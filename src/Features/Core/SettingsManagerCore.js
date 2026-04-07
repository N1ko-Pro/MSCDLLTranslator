import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  general: {
    appLanguage: 'ru',
  },
  method: 'single',
  ai: {
    githubApiKey: '',
    hasGithubApiKey: false,
    model: 'openai/gpt-4.1-mini',
  },
};

export default function useTranslationSettings() {
  const [translationSettings, setTranslationSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    const syncSettingsFromBackend = async () => {
      if (!window.electronAPI?.getTranslationSettings) return;

      const response = await window.electronAPI.getTranslationSettings();
      if (!cancelled && response?.success && response?.settings) {
        setTranslationSettings(response.settings);
      }
    };

    syncSettingsFromBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateTranslationSettings = useCallback(async (settingsPatch) => {
    if (!window.electronAPI?.setTranslationSettings) {
      setTranslationSettings((previous) => {
        const nextGithubApiKey =
          settingsPatch?.ai?.githubApiKey !== undefined
            ? settingsPatch.ai.githubApiKey
            : previous?.ai?.githubApiKey || '';

        return {
          ...previous,
          ...settingsPatch,
          general: {
            ...(previous?.general || {}),
            ...(settingsPatch?.general || {}),
          },
          ai: {
            ...(previous?.ai || {}),
            ...(settingsPatch?.ai || {}),
            githubApiKey: nextGithubApiKey,
            hasGithubApiKey: Boolean(nextGithubApiKey.trim()),
          },
        };
      });
      return true;
    }

    const response = await window.electronAPI.setTranslationSettings(settingsPatch);
    if (response?.success && response?.settings) {
      setTranslationSettings(response.settings);
      return true;
    }

    return false;
  }, []);

  return {
    translationSettings,
    updateTranslationSettings,
  };
}
