import { useEffect, useMemo, useState } from 'react';
import useTranslationProgress from './useTranslationProgress';

export default function useAiTranslation({ originalStrings, translations, setTranslations }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('https://models.github.ai/inference/chat/completions');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [aiError, setAiError] = useState('');

  const normalizedModelName = modelName.replace(/^openai\//, '').trim();

  const {
    isTranslating,
    translationProgress,
    translationStage,
    translationEta,
    applyProgress,
    finishProgress,
    failProgress,
  } = useTranslationProgress(normalizedModelName || 'gpt-4o-mini');

  const hasValidEndpoint = /^https?:\/\/\S+/i.test(endpointUrl.trim());
  const hasApiKey = apiKey.trim().length > 0;
  const showModelSelector = hasValidEndpoint && hasApiKey;

  const totalCount = originalStrings ? originalStrings.length : 0;
  const untranslatedRows = useMemo(
    () => (originalStrings ? originalStrings.filter((row) => !(translations[row.id] || '').trim()) : []),
    [originalStrings, translations]
  );

  const translatedCount = useMemo(
    () => Object.values(translations).filter((value) => value && value.trim() !== '').length,
    [translations]
  );

  const modelHelp = {
    'gpt-4o-mini': 'Более быстрая модель. Хороша для массовых переводов и коротких строк.',
    'gpt-5-mini': 'Более умная модель. Лучше подходит для сложного контекста и тонких формулировок.'
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    const savedEndpoint = localStorage.getItem('ai_endpoint_url');
    const savedModel = localStorage.getItem('ai_model_name');

    if (savedKey) setApiKey(savedKey);
    if (savedEndpoint) setEndpointUrl(savedEndpoint);
    if (savedModel) {
      setModelName(savedModel.replace(/^openai\//, ''));
    }
  }, []);

  useEffect(() => {
    if (!window.electronAPI?.onTranslateAIProgress) return undefined;

    return window.electronAPI.onTranslateAIProgress((payload) => {
      if (!payload) return;

      if (payload.status === 'error') {
        failProgress();
        setAiError(payload.error || 'Неизвестная ошибка от нейросети.');
        return;
      }

      if (payload.status === 'done') {
        finishProgress(payload);
        return;
      }

      applyProgress(payload);
    });
  }, [applyProgress, failProgress, finishProgress, setAiError]);

  const handleSaveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey.trim());
    localStorage.setItem('ai_endpoint_url', endpointUrl.trim());
    localStorage.setItem('ai_model_name', normalizedModelName || 'gpt-4o-mini');
    setIsSettingsOpen(false);
  };

  const triggerAITranslation = async () => {
    if (!apiKey.trim() || !endpointUrl.trim()) {
      setIsAlertOpen(true);
      return;
    }

    if (untranslatedRows.length === 0) return;

    setAiError('');

    try {
      const stringsToTranslate = untranslatedRows.map((row) => row.original);
      const result = await window.electronAPI.translateAI({
        strings: stringsToTranslate,
        apiKey: apiKey.trim(),
        model: normalizedModelName || 'gpt-4o-mini',
        endpointUrl: endpointUrl.trim()
      });

      if (result && result.success) {
        const newTranslations = { ...translations };
        result.result.forEach((translatedStr, index) => {
          newTranslations[untranslatedRows[index].id] = translatedStr;
        });
        setTranslations(newTranslations);
      } else {
        failProgress();
        setAiError(result?.error || 'Неизвестная ошибка от нейросети.');
      }
    } catch (err) {
      failProgress();
      setAiError(err.message);
    }
  };

  return {
    aiError,
    apiKey,
    endpointUrl,
    hasApiKey,
    hasValidEndpoint,
    handleSaveSettings,
    isAlertOpen,
    isSettingsOpen,
    isTranslating,
    modelHelp,
    modelName,
    normalizedModelName,
    setAiError,
    setApiKey,
    setEndpointUrl,
    setIsAlertOpen,
    setIsSettingsOpen,
    setModelName,
    showModelSelector,
    totalCount,
    translationEta,
    translationProgress,
    translationStage,
    translatedCount,
    triggerAITranslation,
  };
}