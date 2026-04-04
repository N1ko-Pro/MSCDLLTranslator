import { useState, useEffect, useCallback, useMemo } from 'react';
import { getInitialValue, isValidGithubKey, isValidOpenRouterKey } from '../utils/aiUtils';

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

  const normalizedModelName = useMemo(() => modelName.trim(), [modelName]);
  const isGithubKeyValid = useMemo(() => isValidGithubKey(githubApiKey), [githubApiKey]);
  const isOpenRouterKeyValid = useMemo(() => isValidOpenRouterKey(openRouterApiKey), [openRouterApiKey]);

  const apiKey = useMemo(() => 
    normalizedModelName.includes('openrouter') ? openRouterApiKey.trim() : githubApiKey.trim(),
    [normalizedModelName, openRouterApiKey, githubApiKey]
  );
  const hasApiKey = normalizedModelName.includes('openrouter') ? isOpenRouterKeyValid : isGithubKeyValid;
  const showModelSelector = isGithubKeyValid || isOpenRouterKeyValid;

  const getAlertMessage = useCallback(() => {
    if (normalizedModelName.includes('openrouter') && !isOpenRouterKeyValid) {
      return 'Для запуска перевода через эту модель, укажите корректный API Ключ OpenRouter (начинается с sk-or-v1-) в настройках.';
    }
    if (!normalizedModelName.includes('openrouter') && !isGithubKeyValid) {
      return 'Для запуска перевода через эту модель, укажите корректный API Ключ GitHub (начинается с ghp_ или github_pat_) в настройках.';
    }
    return null;
  }, [normalizedModelName, isOpenRouterKeyValid, isGithubKeyValid]);

  const handleSaveSettings = useCallback(() => {
    localStorage.setItem('ai_github_api_key', githubApiKey.trim());
    localStorage.setItem('ai_openrouter_api_key', openRouterApiKey.trim());
    localStorage.setItem('ai_model_name', normalizedModelName || 'gpt-4o-mini');
    window.dispatchEvent(new Event('ai-settings-changed'));
    setIsSettingsOpen(false);
  }, [githubApiKey, openRouterApiKey, normalizedModelName]);

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
