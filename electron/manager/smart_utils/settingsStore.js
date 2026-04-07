const fs = require("fs");
const { normalizeAiModel } = require("../ai_utils/constants");

const DEFAULT_GENERAL_SETTINGS = {
  appLanguage: "ru",
};

function normalizeGithubApiKey(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAiSettings(ai) {
  return {
    githubApiKey: normalizeGithubApiKey(ai?.githubApiKey),
    model: normalizeAiModel(ai?.model),
  };
}

function normalizeGeneralSettings(general) {
  const appLanguage = typeof general?.appLanguage === "string" && general.appLanguage.trim()
    ? general.appLanguage.trim().toLowerCase()
    : DEFAULT_GENERAL_SETTINGS.appLanguage;

  return {
    appLanguage,
  };
}

function buildDefaultSettings(method) {
  return {
    method,
    ai: normalizeAiSettings(),
    general: { ...DEFAULT_GENERAL_SETTINGS },
  };
}

function loadSettingsFromDisk(settingsStoragePath, fallbackMethod) {
  const defaults = buildDefaultSettings(fallbackMethod);

  if (!settingsStoragePath || !fs.existsSync(settingsStoragePath)) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(settingsStoragePath, "utf8"));

    return {
      method: typeof parsed?.method === "string" ? parsed.method : defaults.method,
      ai: normalizeAiSettings(parsed?.ai),
      general: normalizeGeneralSettings(parsed?.general),
    };
  } catch (error) {
    console.warn("Failed to load translation settings:", error?.message || error);
    return defaults;
  }
}

function saveSettingsToDisk(settingsStoragePath, settings) {
  if (!settingsStoragePath) {
    return;
  }

  try {
    fs.writeFileSync(settingsStoragePath, JSON.stringify(settings, null, 2), "utf8");
  } catch (error) {
    console.warn("Failed to persist translation settings:", error?.message || error);
  }
}

module.exports = {
  DEFAULT_GENERAL_SETTINGS,
  normalizeGeneralSettings,
  loadSettingsFromDisk,
  saveSettingsToDisk,
};
