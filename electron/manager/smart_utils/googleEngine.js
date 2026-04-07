const path = require("path");
const { translate: singleTranslate, translateBatch: translateBatchX } = require("google-translate-api-x");
const { translate: translateCompatibility } = require("@vitalets/google-translate-api");

const {
  DEFAULT_METHOD,
  DEFAULT_TARGET_LANG,
  DEFAULT_SOURCE_LANG,
  DEFAULT_CHUNK_SIZE_LIMIT,
} = require("./constants");
const {
  toSafeString,
  hasText,
  normalizeLanguage,
  isRateLimitError,
} = require("./textUtils");
const { appendWithDelimiter, splitTranslatedBatch } = require("./batchSplitter");
const {
  isTranslatableSegment,
  makeSegmentKey,
  buildMarkupAwarePlan,
  rebuildFromMarkupAwarePlan,
  normalizeGameMarkupSpacing,
} = require("./markupParser");
const { ProxyPoolManager } = require("./proxyPool");

const METHODS = {
  standard: translateBatchX,
  single: singleTranslate,
  compatibility: translateCompatibility,
};

function isRateLimitExceededError(error) {
  return error?.message === "RATE_LIMIT_EXCEEDED" || isRateLimitError(error);
}

class GoogleTranslateManager {
  constructor() {
    this.currentMethod = DEFAULT_METHOD;
    this.defaultTargetLang = DEFAULT_TARGET_LANG;
    this.defaultSourceLang = DEFAULT_SOURCE_LANG;
    this.defaultChunkSizeLimit = DEFAULT_CHUNK_SIZE_LIMIT;
    this.proxyPoolManager = new ProxyPoolManager();

    const proxyConfigPath = path.resolve(__dirname, "../../config/translatorProxy.json");
    this.proxyPoolManager.loadFromSources({
      env: process.env,
      configFilePath: proxyConfigPath,
    });
  }

  setMethod(method) {
    if (METHODS[method]) {
      this.currentMethod = method;
      return true;
    }

    return false;
  }

  getMethod() {
    return this.currentMethod;
  }

  setProxyPool(proxyEntries) {
    this.proxyPoolManager.setPool(proxyEntries || []);
  }

  setProxyConfig(proxyConfig) {
    this.proxyPoolManager.setPoolFromConfig(proxyConfig || {});
  }

  clearProxyPool() {
    this.proxyPoolManager.setPool([]);
  }

  setDefaultTargetLanguage(language) {
    this.defaultTargetLang = normalizeLanguage(language, DEFAULT_TARGET_LANG);
  }

  setDefaultSourceLanguage(language) {
    this.defaultSourceLang = normalizeLanguage(language, DEFAULT_SOURCE_LANG);
  }

  getRuntimeSettings() {
    return {
      method: this.currentMethod,
      defaultTargetLang: this.defaultTargetLang,
      defaultSourceLang: this.defaultSourceLang,
      chunkSizeLimit: this.defaultChunkSizeLimit,
      proxy: {
        enabled: this.proxyPoolManager.hasPool(),
        poolSize: this.proxyPoolManager.getPoolSize(),
        active: this.proxyPoolManager.getActiveProxyMasked(),
      },
    };
  }

  _buildRequestOptions(options = {}) {
    const requestOptions = { ...(options.requestOptions || {}) };

    if (!requestOptions.agent && options.useProxy !== false) {
      const proxyAgent = this.proxyPoolManager.getAgent();
      if (proxyAgent) {
        requestOptions.agent = proxyAgent;
      }
    }

    return requestOptions;
  }

  _buildProviderOptions(targetLang, options = {}) {
    const to = normalizeLanguage(targetLang, this.defaultTargetLang);
    const from = normalizeLanguage(options.sourceLang, this.defaultSourceLang);

    const providerOptions = { to };
    if (from && from !== "auto") {
      providerOptions.from = from;
    }

    const requestOptions = this._buildRequestOptions(options);
    if (Object.keys(requestOptions).length > 0) {
      if (this.currentMethod === "compatibility") {
        providerOptions.fetchOptions = requestOptions;
      } else {
        providerOptions.requestOptions = requestOptions;
      }
    }

    return providerOptions;
  }

  async _executeWithRateLimitRecovery(operation, options = {}) {
    const allowProxyRotation = options.useProxy !== false && options.allowProxyRotation !== false;
    const poolSize = this.proxyPoolManager.getPoolSize();
    const maxAttempts = allowProxyRotation && poolSize > 0 ? poolSize : 1;

    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        if (!isRateLimitError(error)) {
          throw error;
        }

        attempt += 1;

        if (!allowProxyRotation || attempt >= maxAttempts) {
          throw new Error("RATE_LIMIT_EXCEEDED");
        }

        const rotated = this.proxyPoolManager.rotate();
        if (!rotated) {
          throw new Error("RATE_LIMIT_EXCEEDED");
        }

        console.warn(
          `Translator [${this.currentMethod}] 429 received. Switched proxy to ${this.proxyPoolManager.getActiveProxyMasked()} (${attempt}/${maxAttempts - 1}).`
        );
      }
    }

    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  async _translateText(text, targetLang, options = {}) {
    const provider = METHODS[this.currentMethod] || METHODS[DEFAULT_METHOD];
    const providerOptions = this._buildProviderOptions(targetLang, options);
    return provider(toSafeString(text), providerOptions);
  }

  async _translateSingleEntry(entryKey, entryText, targetLang, options = {}) {
    const sourceText = toSafeString(entryText);

    if (!hasText(sourceText)) {
      return sourceText;
    }

    try {
      const response = await this._executeWithRateLimitRecovery(
        () => this._translateText(sourceText, targetLang, options),
        options
      );
      return toSafeString(response?.text ?? sourceText);
    } catch (error) {
      if (isRateLimitExceededError(error)) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }

      console.warn(`Translator [${this.currentMethod}] fallback for key ${entryKey}:`, error?.message || error);
      return sourceText;
    }
  }

  _resolveChunkSizeLimit(customChunkSizeLimit) {
    if (Number.isFinite(customChunkSizeLimit) && customChunkSizeLimit > 100) {
      return Math.floor(customChunkSizeLimit);
    }

    return this.defaultChunkSizeLimit;
  }

  async _translateDictionaryWithRetry(dataToTranslate, targetLang = this.defaultTargetLang, options = {}) {
    const translated = {};
    const entries = Object.entries(dataToTranslate || {});

    if (entries.length === 0) {
      return translated;
    }

    if (this.currentMethod === "single") {
      for (const [entryKey, entryText] of entries) {
        translated[entryKey] = await this._translateSingleEntry(entryKey, entryText, targetLang, options);
      }
      return translated;
    }

    const chunkSizeLimit = this._resolveChunkSizeLimit(options.chunkSizeLimit);

    const chunks = [];
    let currentKeys = [];
    let currentText = "";

    for (const [entryKey, rawText] of entries) {
      const sourceText = toSafeString(rawText);

      if (!hasText(sourceText)) {
        translated[entryKey] = sourceText;
        continue;
      }

      const nextChunkText = appendWithDelimiter(currentText, sourceText);
      if (nextChunkText.length > chunkSizeLimit && currentKeys.length > 0) {
        chunks.push({ keys: currentKeys, text: currentText });
        currentKeys = [entryKey];
        currentText = sourceText;
        continue;
      }

      currentKeys.push(entryKey);
      currentText = nextChunkText;
    }

    if (currentKeys.length > 0) {
      chunks.push({ keys: currentKeys, text: currentText });
    }

    for (const chunk of chunks) {
      try {
        const response = await this._executeWithRateLimitRecovery(
          () => this._translateText(chunk.text, targetLang, options),
          options
        );
        const split = splitTranslatedBatch(response?.text);

        if (split.length !== chunk.keys.length) {
          console.warn(
            `Translator [${this.currentMethod}] segment mismatch: expected ${chunk.keys.length}, got ${split.length}. Falling back to single-entry translation.`
          );

          for (const entryKey of chunk.keys) {
            translated[entryKey] = await this._translateSingleEntry(
              entryKey,
              dataToTranslate[entryKey],
              targetLang,
              options
            );
          }

          continue;
        }

        chunk.keys.forEach((entryKey, index) => {
          translated[entryKey] = split[index] ?? toSafeString(dataToTranslate[entryKey]);
        });
      } catch (error) {
        if (isRateLimitExceededError(error)) {
          throw new Error("RATE_LIMIT_EXCEEDED");
        }

        console.error(`Translator [${this.currentMethod}] Error:`, error);

        for (const entryKey of chunk.keys) {
          translated[entryKey] = toSafeString(dataToTranslate[entryKey]);
        }
      }
    }

    return translated;
  }

  async translateBatchWithRetry(dataToTranslate, targetLang = this.defaultTargetLang, options = {}) {
    const translated = {};
    const entries = Object.entries(dataToTranslate || {});

    if (entries.length === 0) {
      return translated;
    }

    const preserveMarkup = options.preserveMarkup !== false;
    const resolvedTargetLang = normalizeLanguage(targetLang, this.defaultTargetLang);
    const resolvedSourceLang = normalizeLanguage(options.sourceLang, this.defaultSourceLang);
    const runtimeOptions = {
      ...options,
      sourceLang: resolvedSourceLang,
    };

    if (!preserveMarkup) {
      return this._translateDictionaryWithRetry(dataToTranslate, resolvedTargetLang, runtimeOptions);
    }

    const plansByUid = {};
    const segmentDictionary = {};

    for (const [uid, rawText] of entries) {
      const sourceText = toSafeString(rawText);

      if (!hasText(sourceText)) {
        translated[uid] = sourceText;
        continue;
      }

      const plan = buildMarkupAwarePlan(sourceText);
      plansByUid[uid] = plan;

      let hasTranslatableSegments = false;
      plan.segments.forEach((segment, segmentIndex) => {
        if (!isTranslatableSegment(segment)) {
          return;
        }

        hasTranslatableSegments = true;
        segmentDictionary[makeSegmentKey(uid, segmentIndex)] = segment;
      });

      if (!hasTranslatableSegments) {
        translated[uid] = sourceText;
      }
    }

    if (Object.keys(segmentDictionary).length === 0) {
      return translated;
    }

    const translatedSegments = await this._translateDictionaryWithRetry(
      segmentDictionary,
      resolvedTargetLang,
      runtimeOptions
    );

    for (const [uid, rawText] of entries) {
      if (translated[uid] !== undefined) {
        continue;
      }

      const plan = plansByUid[uid];
      if (!plan) {
        translated[uid] = toSafeString(rawText);
        continue;
      }

      const rowTranslatedSegments = plan.segments.map((segment, segmentIndex) => {
        if (!isTranslatableSegment(segment)) {
          return segment;
        }

        return translatedSegments[makeSegmentKey(uid, segmentIndex)] ?? segment;
      });

      translated[uid] = normalizeGameMarkupSpacing(
        rebuildFromMarkupAwarePlan(plan, rowTranslatedSegments)
      );
    }

    return translated;
  }
}

module.exports = {
  GoogleTranslateManager,
};
