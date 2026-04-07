import { useCallback, useEffect, useRef, useState } from 'react';
import { notify } from '../Shared/NotificationCore_Utils/notifications';
import { AUTO_TRANSLATION_MODE } from '../MainWindow/TopBar_Utils/autoTranslationModes';

export default function useAutoTranslateModePicker({ disabled, isTranslating, hasAiKey, onStart }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModeId, setSelectedModeId] = useState('');
  const [errorModeId, setErrorModeId] = useState('');
  const clearErrorTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (clearErrorTimerRef.current) {
        clearTimeout(clearErrorTimerRef.current);
      }
    };
  }, []);

  const openPanel = useCallback(() => {
    if (disabled || isTranslating) return;
    setIsExpanded(true);
  }, [disabled, isTranslating]);

  const closePanel = useCallback(() => {
    setIsExpanded(false);
    setSelectedModeId('');
    setErrorModeId('');
  }, []);

  const selectMode = useCallback(
    (modeId) => {
      if (modeId === AUTO_TRANSLATION_MODE.AI && !hasAiKey) {
        notify.error(
          'Требуется API-ключ',
          'Для AI-перевода сначала укажите GitHub API key в настройках на вкладке AI.',
          5500
        );

        setErrorModeId(modeId);
        if (clearErrorTimerRef.current) {
          clearTimeout(clearErrorTimerRef.current);
        }
        clearErrorTimerRef.current = setTimeout(() => {
          setErrorModeId('');
        }, 800);
        return;
      }

      setSelectedModeId(modeId);
      setErrorModeId('');
    },
    [hasAiKey]
  );

  const start = useCallback(async () => {
    if (!selectedModeId || disabled || isTranslating) return;
    await onStart(selectedModeId);
    closePanel();
  }, [closePanel, disabled, isTranslating, onStart, selectedModeId]);

  return {
    isExpanded: isExpanded && !disabled && !isTranslating,
    selectedModeId,
    errorModeId,
    canStart: Boolean(selectedModeId),
    openPanel,
    closePanel,
    selectMode,
    start,
  };
}
