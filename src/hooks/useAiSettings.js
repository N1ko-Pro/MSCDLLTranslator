import { useState, useEffect } from 'react';

const getInitialValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  return saved || fallback;
};

export default function useAiSettings() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [githubApiKey, setGithubApiKey] = useState(() => getInitialValue('ai_github_api_key', ''));
  const [openRouterApiKey, setOpenRouterApiKey] = useState(() => getInitialValue('ai_openrouter_api_key', ''));
  const [modelName, setModelName] = useState(() => {
    return getInitialValue('ai_model_name', 'gpt-4o-mini');
  });

  useEffect(() => {
    const syncState = () => {
      setGithubApiKey(getInitialValue('ai_github_api_key', ''));
      setOpenRouterApiKey(getInitialValue('ai_openrouter_api_key', ''));
      setModelName(getInitialValue('ai_model_name', 'gpt-4o-mini'));
    };

    window.addEventListener('ai-settings-changed', syncState);
    return () => window.removeEventListener('ai-settings-changed', syncState);
  }, []);

  const normalizedModelName = modelName.trim();

  const isValidGithubKey = /^(gh[pousr]_|github_pat_)[a-zA-Z0-9_.-]{20,}$/.test(githubApiKey.trim());
  const isValidOpenRouterKey = /^sk-or-v1-[a-zA-Z0-9_.-]{30,}$/.test(openRouterApiKey.trim());

  const apiKey = normalizedModelName.includes('openrouter') ? openRouterApiKey.trim() : githubApiKey.trim();

  const hasApiKey = normalizedModelName.includes('openrouter') ? isValidOpenRouterKey : isValidGithubKey;
  const showModelSelector = isValidGithubKey || isValidOpenRouterKey;

  const getAlertMessage = () => {
    if (normalizedModelName.includes('openrouter') && !isValidOpenRouterKey) {
      return 'Для запуска перевода через эту модель, укажите корректный API Ключ OpenRouter (начинается с sk-or-v1-) в настройках.';
    }
    if (!normalizedModelName.includes('openrouter') && !isValidGithubKey) {
      return 'Для запуска перевода через эту модель, укажите корректный API Ключ GitHub (начинается с ghp_ или github_pat_) в настройках.';
    }
    return null;
  };

  const handleSaveSettings = () => {
    localStorage.setItem('ai_github_api_key', githubApiKey.trim());
    localStorage.setItem('ai_openrouter_api_key', openRouterApiKey.trim());
    localStorage.setItem('ai_model_name', normalizedModelName || 'gpt-4o-mini');
    window.dispatchEvent(new Event('ai-settings-changed'));
    setIsSettingsOpen(false);
  };

  return {
    isSettingsOpen, setIsSettingsOpen,
    isAlertOpen, setIsAlertOpen,
    githubApiKey, setGithubApiKey,
    openRouterApiKey, setOpenRouterApiKey,
    apiKey, // Automatically swapped!
    modelName, setModelName,
    normalizedModelName,
    hasApiKey,
    getAlertMessage,
    showModelSelector,
    handleSaveSettings
  };
}
