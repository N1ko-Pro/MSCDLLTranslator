import { useState, useEffect } from 'react';
import useAiSettings from './useAiSettings.js';

export function useAIPanelLogic(onStartTranslation) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [limits, setLimits] = useState({ requests: null, tokens: null, loading: false });
const { modelName, apiKey, hasApiKey } = useAiSettings();

  const pingLimits = async (modelToPing) => {
    if (!hasApiKey) return;
    setLimits({ requests: null, tokens: null, loading: true });
    try {
      const response = await window.electronAPI.pingAiLimits({
        apiKey,
        model: modelToPing
      });

      if (response?.success && response.limits) {
        setLimits({
          requests: response.limits.requests,
          tokens: response.limits.tokens,
          loading: false
        });
      } else {
        setLimits({
          requests: 'Ошибка',
          tokens: response?.error || 'Ошибка',
          loading: false
        });
      }
    } catch (err) {
      console.error("Ошибка получения лимитов", err);
      setLimits({ requests: 'Ошибка', tokens: err.message, loading: false });
    }
  };

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
    // pingLimits(modelName) будет вызван через useEffect
  };

  const handleChangeModel = (newModel) => {
    localStorage.setItem('ai_model_name', newModel);
    window.dispatchEvent(new Event('ai-settings-changed'));
    // Убираем pingLimits отсюда, он вызовется из useEffect при изменении modelName/apiKey
  };

  // Автоматический пинг лимитов при открытии панели или смене модели/ключа
  useEffect(() => {
    if (isPanelOpen) {
      pingLimits(modelName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, apiKey, isPanelOpen, hasApiKey]);

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
    limits,
    hasApiKey,
    setIsPanelOpen
  };
}
