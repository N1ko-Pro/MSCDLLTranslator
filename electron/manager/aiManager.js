const {
  DEFAULT_TARGET_LANG,
  DEFAULT_SOURCE_LANG,
} = require("./smart_utils/constants");
const {
  toSafeString,
  hasText,
  normalizeLanguage,
} = require("./smart_utils/textUtils");
const { appendWithDelimiter, splitTranslatedBatch } = require("./smart_utils/batchSplitter");
const {
  isTranslatableSegment,
  makeSegmentKey,
  buildMarkupAwarePlan,
  rebuildFromMarkupAwarePlan,
  normalizeGameMarkupSpacing,
} = require("./smart_utils/markupParser");
const {
  AI_MODEL_OPTIONS,
  DEFAULT_AI_CHUNK_SIZE_LIMIT,
  DEFAULT_AI_MAX_TOKENS,
  DEFAULT_AI_TEMPERATURE,
  normalizeAiModel,
} = require("./ai_utils/constants");
const {
  buildBg3AiSystemPrompt,
  buildBatchUserPrompt,
  buildSingleUserPrompt,
} = require("./ai_utils/prompt");
const { requestGithubChatCompletion } = require("./ai_utils/provider");

class AiManager {
  constructor({ getGithubApiKey, getAiModel }) {
    this.getGithubApiKey = getGithubApiKey;
    this.getAiModel = getAiModel;
    this.defaultTargetLang = DEFAULT_TARGET_LANG;
    this.defaultSourceLang = DEFAULT_SOURCE_LANG;
    this.defaultChunkSizeLimit = DEFAULT_AI_CHUNK_SIZE_LIMIT;
    this.systemPrompt = buildBg3AiSystemPrompt();
  }

  getSettings() {
    const githubApiKey = typeof this.getGithubApiKey === "function" ? this.getGithubApiKey() : "";
    const safeKey = typeof githubApiKey === "string" ? githubApiKey.trim() : "";

    const model = typeof this.getAiModel === "function"
      ? normalizeAiModel(this.getAiModel())
      : normalizeAiModel("");

    return {
      githubApiKey: safeKey,
      hasGithubApiKey: safeKey.length > 0,
      model,
      modelOptions: AI_MODEL_OPTIONS,
    };
  }

  _resolveRuntimeOptions(targetLang, options = {}) {
    const { githubApiKey: apiKey, model: currentModel } = this.getSettings();

    return {
      apiKey,
      targetLang: normalizeLanguage(targetLang, this.defaultTargetLang),
      sourceLang: normalizeLanguage(options.sourceLang, this.defaultSourceLang),
      model: normalizeAiModel(options.model || currentModel),
      temperature: Number.isFinite(options.temperature)
        ? options.temperature
        : DEFAULT_AI_TEMPERATURE,
      maxTokens: Number.isFinite(options.maxTokens)
        ? Math.floor(options.maxTokens)
        : DEFAULT_AI_MAX_TOKENS,
      chunkSizeLimit: Number.isFinite(options.chunkSizeLimit) && options.chunkSizeLimit > 500
        ? Math.floor(options.chunkSizeLimit)
        : this.defaultChunkSizeLimit,
      timeoutMs: Number.isFinite(options.timeoutMs) && options.timeoutMs > 5000
        ? Math.floor(options.timeoutMs)
        : 45000,
      preserveMarkup: options.preserveMarkup !== false,
    };
  }

  _isFatalAiError(error) {
    const message = toSafeString(error?.message);
    return (
      message === "RATE_LIMIT_EXCEEDED" ||
      message === "AI_AUTH_FAILED" ||
      message.startsWith("AI_PROVIDER_HTTP_4")
    );
  }

  async _translateSingleSegment(sourceText, runtimeOptions) {
    if (!hasText(sourceText)) {
      return toSafeString(sourceText);
    }

    const userPrompt = buildSingleUserPrompt({
      sourceLang: runtimeOptions.sourceLang,
      targetLang: runtimeOptions.targetLang,
      text: toSafeString(sourceText),
    });

    const translated = await requestGithubChatCompletion({
      apiKey: runtimeOptions.apiKey,
      model: runtimeOptions.model,
      temperature: runtimeOptions.temperature,
      maxTokens: runtimeOptions.maxTokens,
      timeoutMs: runtimeOptions.timeoutMs,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return toSafeString(translated) || toSafeString(sourceText);
  }

  async _translateChunk(chunkText, runtimeOptions) {
    const userPrompt = buildBatchUserPrompt({
      sourceLang: runtimeOptions.sourceLang,
      targetLang: runtimeOptions.targetLang,
      text: toSafeString(chunkText),
    });

    return requestGithubChatCompletion({
      apiKey: runtimeOptions.apiKey,
      model: runtimeOptions.model,
      temperature: runtimeOptions.temperature,
      maxTokens: runtimeOptions.maxTokens,
      timeoutMs: runtimeOptions.timeoutMs,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
  }

  async _translateDictionaryWithRetry(dataToTranslate, runtimeOptions) {
    const translated = {};
    const entries = Object.entries(dataToTranslate || {});

    if (entries.length === 0) {
      return translated;
    }

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
      if (nextChunkText.length > runtimeOptions.chunkSizeLimit && currentKeys.length > 0) {
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
        const batchTranslatedText = await this._translateChunk(chunk.text, runtimeOptions);
        const split = splitTranslatedBatch(batchTranslatedText);

        if (split.length !== chunk.keys.length) {
          for (const entryKey of chunk.keys) {
            translated[entryKey] = await this._translateSingleSegment(
              dataToTranslate[entryKey],
              runtimeOptions
            );
          }
          continue;
        }

        chunk.keys.forEach((entryKey, index) => {
          translated[entryKey] = toSafeString(split[index] ?? dataToTranslate[entryKey]);
        });
      } catch (error) {
        if (this._isFatalAiError(error)) {
          throw error;
        }

        console.warn("AI batch translation chunk fallback:", error?.message || error);

        for (const entryKey of chunk.keys) {
          try {
            translated[entryKey] = await this._translateSingleSegment(
              dataToTranslate[entryKey],
              runtimeOptions
            );
          } catch (singleError) {
            if (this._isFatalAiError(singleError)) {
              throw singleError;
            }
            translated[entryKey] = toSafeString(dataToTranslate[entryKey]);
          }
        }
      }
    }

    return translated;
  }

  async translateBatchWithRetry(dataToTranslate, targetLang = this.defaultTargetLang, options = {}) {
    const aiSettings = this.getSettings();
    if (!aiSettings.hasGithubApiKey) {
      throw new Error("AI_KEY_REQUIRED");
    }

    const runtimeOptions = this._resolveRuntimeOptions(targetLang, options);
    const translated = {};
    const entries = Object.entries(dataToTranslate || {});

    if (entries.length === 0) {
      return translated;
    }

    if (!runtimeOptions.preserveMarkup) {
      return this._translateDictionaryWithRetry(dataToTranslate, runtimeOptions);
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

    const translatedSegments = await this._translateDictionaryWithRetry(segmentDictionary, runtimeOptions);

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
  AiManager,
};
