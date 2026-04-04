import { useState, useEffect, useCallback } from 'react';
import useAiSettings from './useAiSettings.js';

export function useAIPanelLogic(onStartTranslation) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [limits, setLimits] = useState({ requests: null, tokens: null, loading: false });
  const { modelName, apiKey, hasApiKey } = useAiSettings();

  const pingLimits = useCallback(async (modelToPing) => {
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
  }, [apiKey, hasApiKey]);

  const handleOpenPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const handleChangeModel = useCallback((newModel) => {
    localStorage.setItem('ai_model_name', newModel);
    window.dispatchEvent(new Event('ai-settings-changed'));
  }, []);

  useEffect(() => {
    if (isPanelOpen) {
      pingLimits(modelName);
    }
  }, [modelName, isPanelOpen, pingLimits]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleStart = useCallback(() => {
    if (onStartTranslation) {
        onStartTranslation();
    }
    setIsPanelOpen(false);
  }, [onStartTranslation]);

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
