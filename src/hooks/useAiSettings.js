import { useState } from 'react';

const getInitialValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  return saved || fallback;
};

export default function useAiSettings() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => getInitialValue('ai_api_key', ''));
  const [endpointUrl, setEndpointUrl] = useState(() => getInitialValue('ai_endpoint_url', 'https://models.github.ai/inference/chat/completions'));
  const [modelName, setModelName] = useState(() => {
    const saved = getInitialValue('ai_model_name', 'gpt-4o-mini');
    return saved.replace(/^openai\//, '');
  });

  const normalizedModelName = modelName.replace(/^openai\//, '').trim();

  const hasValidEndpoint = /^https?:\/\/\S+/i.test(endpointUrl.trim());
  const hasApiKey = apiKey.trim().length > 0;
  const showModelSelector = hasValidEndpoint && hasApiKey;

  const handleSaveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey.trim());
    localStorage.setItem('ai_endpoint_url', endpointUrl.trim());
    localStorage.setItem('ai_model_name', normalizedModelName || 'gpt-4o-mini');
    setIsSettingsOpen(false);
  };

  return {
    isSettingsOpen, setIsSettingsOpen,
    isAlertOpen, setIsAlertOpen,
    apiKey, setApiKey,
    endpointUrl, setEndpointUrl,
    modelName, setModelName,
    normalizedModelName,
    hasValidEndpoint,
    hasApiKey,
    showModelSelector,
    handleSaveSettings
  };
}
