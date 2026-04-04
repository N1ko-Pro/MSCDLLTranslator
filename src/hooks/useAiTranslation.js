import { useEffect, useMemo, useState, useCallback } from 'react';
import useTranslationProgress from './useTranslationProgress';
import useAiSettings from './useAiSettings';
import { AI_MODELS_HELP, AI_ERRORS } from '../constants/aiStrings';

export default function useAiTranslation({ originalStrings, translations, setTranslations }) {
  const [aiError, setAiError] = useState('');

  const settings = useAiSettings();

  const {
    isTranslating,
    translationProgress,
    translationStage,
    translationEta,
    applyProgress,
    finishProgress,
    failProgress,
  } = useTranslationProgress();


  const totalCount = originalStrings ? originalStrings.length : 0;
  const untranslatedRows = useMemo(
    () => (originalStrings ? originalStrings.filter((row) => !(translations[row.id] || '').trim()) : []),
    [originalStrings, translations]
  );

  const translatedCount = useMemo(
    () => Object.values(translations).filter((value) => value && value.trim() !== '').length,
    [translations]
  );

  const modelHelp = AI_MODELS_HELP;

  useEffect(() => {
    if (!window.electronAPI?.onTranslateAIProgress) return undefined;

    return window.electronAPI.onTranslateAIProgress((payload) => {
      if (!payload) return;

      if (payload.status === 'error') {
        failProgress();
        setAiError(payload.error || AI_ERRORS.UNKNOWN);
        return;
      }

      if (payload.status === 'done') {
        finishProgress(payload);
        return;
      }

      applyProgress(payload);
    });
  }, [applyProgress, failProgress, finishProgress, setAiError]);

  const triggerAITranslation = useCallback(async () => {
    if (!settings.hasApiKey) {
      settings.setIsAlertOpen(true);
      return;
    }

    if (untranslatedRows.length === 0) return;

    setAiError('');

    try {
      const stringsToTranslate = untranslatedRows.map((row) => row.original);
      const result = await window.electronAPI.translateAI({
        strings: stringsToTranslate,
        apiKey: settings.apiKey,
        model: settings.normalizedModelName || 'gpt-4o-mini'
      });

      if (result && result.success) {
        const newTranslations = { ...translations };
        result.result.forEach((translatedStr, index) => {
          newTranslations[untranslatedRows[index].id] = translatedStr;
        });
        setTranslations(newTranslations);
      } else {
        failProgress();
        setAiError(result?.error || AI_ERRORS.UNKNOWN);
      }
    } catch (err) {
      failProgress();
      setAiError(err.message);
    }
  }, [settings, untranslatedRows, translations, setTranslations, failProgress]);

  return {
    ...settings,
    aiError, setAiError,
    isTranslating, translationProgress, translationStage, translationEta,
    totalCount, untranslatedRows, translatedCount,
    modelHelp, triggerAITranslation,
  };
}
