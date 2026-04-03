import { useState } from 'react';
import useAiSettings from './useAiSettings.js';

export function useAIPanelLogic(onStartTranslation) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [limits, setLimits] = useState({ requests: null, tokens: null, loading: false });
  const { modelName, apiKey, endpointUrl } = useAiSettings();

  const pingLimits = async (modelToPing) => {
    if (!apiKey) return;
    setLimits({ requests: null, tokens: null, loading: true });
    try {
      const response = await window.electronAPI.pingAiLimits({
        apiKey,
        model: modelToPing,
        endpointUrl
      });
      
      if (response?.success && response.limits) {
        setLimits({
          requests: response.limits.requests,
          tokens: response.limits.tokens,
          loading: false
        });
      } else {
        setLimits({ requests: 'Ошибка', tokens: 'Ошибка', loading: false });
      }
    } catch (err) {
      console.error("Ошибка получения лимитов", err);
      setLimits({ requests: 'Ошибка', tokens: 'Ошибка', loading: false });
    }
  };

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
    pingLimits(modelName);
  };

  const handleChangeModel = (newModel) => {
    localStorage.setItem('ai_model_name', newModel);
    window.dispatchEvent(new Event('ai-settings-changed'));
    pingLimits(newModel); // Сразу пингуем новые лимиты для новой модели
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleStart = () => {
    if (onStartTranslation) {
        onStartTranslation();
    }
    // Закрываем панель при старте
    setIsPanelOpen(false);
  };

  return {
    isPanelOpen,
    handleOpenPanel,
    handleClosePanel,
    handleStart,
    modelName,
    handleChangeModel,
    limits
  };
}
