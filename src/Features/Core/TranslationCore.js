import { useState, useCallback, useRef, useEffect } from 'react';
import { notify } from '../Shared/NotificationCore_Utils/notifications';
import { collectPendingTranslationRows, toIdValueDictionary } from '../StartWindow/StartPage_Utils/projectData';
import { AUTO_TRANSLATION_MODE } from '../MainWindow/TopBar_Utils/autoTranslationModes';

export default function useAutoTranslation({ originalStrings, translations, setTranslations }) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationStage, setTranslationStage] = useState('');
  const completionTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  const triggerAutoTranslation = useCallback(
    async (modeId = AUTO_TRANSLATION_MODE.SMART) => {
      if (!originalStrings || originalStrings.length === 0) return;

      const isAiMode = modeId === AUTO_TRANSLATION_MODE.AI;
      const modeLabel = isAiMode ? 'AI-перевод' : 'Smart-перевод';

      setIsTranslating(true);
      setTranslationProgress(0);
      setTranslationStage(`Подготовка: ${modeLabel}...`);

      try {
        const dataToTranslateArray = collectPendingTranslationRows(originalStrings, translations);

        const totalItems = dataToTranslateArray.length;
        if (totalItems === 0) {
          setIsTranslating(false);
          return;
        }

        setTranslationStage(`Запуск: ${modeLabel}...`);

        const chunkSize = 20;
        let completed = 0;

        for (let i = 0; i < totalItems; i += chunkSize) {
          const chunk = dataToTranslateArray.slice(i, i + chunkSize);
          const chunkDict = toIdValueDictionary(chunk, 'text');

          const result = await window.electronAPI.translateStrings(chunkDict, 'ru', {
            mode: modeId,
          });

          if (result && result.success && result.data) {
            setTranslations((prev) => ({ ...prev, ...result.data }));
            completed += chunk.length;
            setTranslationProgress(Math.min(100, Math.round((completed / totalItems) * 100)));
            setTranslationStage(`${modeLabel}: ${Math.min(completed, totalItems)} / ${totalItems}`);
          } else {
            notify.error('Ошибка перевода', result?.error || 'Произошла ошибка API', 5000);
            break;
          }
        }
      } catch (err) {
        notify.error('Ошибка перевода', err.message, 5000);
      } finally {
        setTranslationStage('Завершено!');
        completionTimerRef.current = setTimeout(() => {
          setIsTranslating(false);
          setTranslationProgress(0);
          setTranslationStage('');
        }, 1500);
      }
    },
    [originalStrings, translations, setTranslations]
  );

  return {
    isTranslating,
    triggerAutoTranslation,
    translationProgress,
    translationStage,
  };
}
