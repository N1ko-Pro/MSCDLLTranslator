const path = require("path");
const { DEFAULT_METHOD } = require("./smart_utils/constants");
const { normalizeAiModel } = require("./ai_utils/constants");
const { GoogleTranslateManager } = require("./smart_utils/googleEngine");
const { AiManager } = require("./aiManager");
const {
  DEFAULT_GENERAL_SETTINGS,
  normalizeGeneralSettings,
  loadSettingsFromDisk,
  saveSettingsToDisk,
} = require("./smart_utils/settingsStore");

const TRANSLATION_SETTINGS_FILE_NAME = "translation-settings.json";

class SmartManager {
  constructor() {
    this.googleTranslateManager = new GoogleTranslateManager();
    this.aiManager = new AiManager({
      getGithubApiKey: () => this.aiGithubApiKey,
      getAiModel: () => this.aiModel,
    });

    this.generalSettings = { ...DEFAULT_GENERAL_SETTINGS };
    this.aiGithubApiKey = "";
    this.aiModel = normalizeAiModel("");
    this.settingsStoragePath = "";
  }

  initializeSettingsStore(userDataPath) {
    if (!userDataPath || typeof userDataPath !== "string") {
      return;
    }

    this.settingsStoragePath = path.join(userDataPath, TRANSLATION_SETTINGS_FILE_NAME);
    const loadedSettings = loadSettingsFromDisk(this.settingsStoragePath, DEFAULT_METHOD);

    this.googleTranslateManager.setMethod(loadedSettings.method);
    this.aiGithubApiKey = loadedSettings.ai.githubApiKey;
    this.aiModel = normalizeAiModel(loadedSettings.ai.model);
    this.generalSettings = normalizeGeneralSettings(loadedSettings.general);
  }

  _persistSettingsToDisk() {
    saveSettingsToDisk(this.settingsStoragePath, {
      method: this.googleTranslateManager.getMethod(),
      ai: {
        githubApiKey: this.aiGithubApiKey,
        model: this.aiModel,
      },
      general: {
        ...this.generalSettings,
      },
    });
  }

  setMethod(method) {
    const isChanged = this.googleTranslateManager.setMethod(method);
    if (isChanged) {
      this._persistSettingsToDisk();
    }

    return isChanged;
  }

  setProxyPool(proxyEntries) {
    this.googleTranslateManager.setProxyPool(proxyEntries || []);
    return this.getSettings();
  }

  setProxyConfig(proxyConfig) {
    this.googleTranslateManager.setProxyConfig(proxyConfig || {});
    return this.getSettings();
  }

  clearProxyPool() {
    this.googleTranslateManager.clearProxyPool();
    return this.getSettings();
  }

  setAiGithubApiKey(githubApiKey) {
    this.aiGithubApiKey = typeof githubApiKey === "string" ? githubApiKey.trim() : "";
    this._persistSettingsToDisk();
    return this.getSettings();
  }

  setAiModel(model) {
    this.aiModel = normalizeAiModel(model);
    this._persistSettingsToDisk();
    return this.getSettings();
  }

  setGeneralSettings(generalPatch) {
    this.generalSettings = normalizeGeneralSettings({
      ...this.generalSettings,
      ...(generalPatch || {}),
    });
    this._persistSettingsToDisk();
    return this.getSettings();
  }

  updateSettings(settingsPatch = {}) {
    const nextMethod = settingsPatch?.method;
    if (nextMethod !== undefined) {
      this.setMethod(nextMethod);
    }

    if (settingsPatch?.ai?.githubApiKey !== undefined) {
      this.setAiGithubApiKey(settingsPatch.ai.githubApiKey);
    }

    if (settingsPatch?.ai?.model !== undefined) {
      this.setAiModel(settingsPatch.ai.model);
    }

    if (settingsPatch?.general !== undefined) {
      this.setGeneralSettings(settingsPatch.general);
    }

    return this.getSettings();
  }

  setDefaultTargetLanguage(language) {
    this.googleTranslateManager.setDefaultTargetLanguage(language);
  }

  setDefaultSourceLanguage(language) {
    this.googleTranslateManager.setDefaultSourceLanguage(language);
  }

  getSettings() {
    const runtimeSettings = this.googleTranslateManager.getRuntimeSettings();

    return {
      ...runtimeSettings,
      ai: this.aiManager.getSettings(),
      general: {
        ...this.generalSettings,
      },
    };
  }

  async translateBatchWithRetry(dataToTranslate, targetLang, options = {}) {
    const mode = options?.mode === "ai" ? "ai" : "smart";

    if (mode === "ai") {
      try {
        return await this.aiManager.translateBatchWithRetry(dataToTranslate, targetLang, options);
      } catch (error) {
        if (error?.message === "AI_KEY_REQUIRED") {
          throw new Error("Для AI-перевода сначала укажите GitHub API key в настройках.");
        }

        if (error?.message === "AI_AUTH_FAILED") {
          throw new Error("Не удалось авторизоваться в GitHub Models. Проверьте API key (нужен scope models:read).");
        }

        if (typeof error?.message === "string" && error.message.startsWith("AI_PROVIDER_HTTP_4")) {
          throw new Error("AI-провайдер отклонил запрос. Проверьте выбранную модель и корректность входных данных.");
        }

        throw error;
      }
    }

    return this.googleTranslateManager.translateBatchWithRetry(dataToTranslate, targetLang, options);
  }
}

module.exports = new SmartManager();
