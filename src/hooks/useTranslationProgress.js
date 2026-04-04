import { useCallback, useEffect, useRef, useState } from 'react';
import { formatProgressCopy } from '../utils/aiUtils';

export default function useTranslationProgress() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationStage, setTranslationStage] = useState('');
  const [translationEta, setTranslationEta] = useState('');
  const finishTimerRef = useRef(null);

  const clearFinishTimer = useCallback(() => {
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }, []);

  const applyProgress = useCallback((payload = {}) => {
    const completed = Number.isFinite(payload.completed) ? payload.completed : 0;
    const total = Number.isFinite(payload.total) ? payload.total : 0;
    const remaining = Number.isFinite(payload.remaining) ? payload.remaining : Math.max(0, total - completed);
    const progress = Number.isFinite(payload.progress)
      ? payload.progress
      : (total > 0 ? Math.round((completed / total) * 100) : 0);

    clearFinishTimer();
    setIsTranslating(true);
    setTranslationProgress(Math.max(0, Math.min(100, progress)));
    const text = formatProgressCopy(remaining, total);
    setTranslationStage(payload.stage || text.stage);
    setTranslationEta(text.eta);
  }, [clearFinishTimer]);

  const finishProgress = useCallback((payload = {}) => {
    clearFinishTimer();

    setTranslationProgress(100);
    const text = formatProgressCopy(0, payload.total, true);
    setTranslationStage(payload.stage || text.stage);
    setTranslationEta(text.eta);

    finishTimerRef.current = setTimeout(() => {
      setIsTranslating(false);
      setTranslationProgress(0);
      setTranslationStage('');
      setTranslationEta('');
    }, 350);
  }, [clearFinishTimer]);


  const failProgress = useCallback(() => {
    clearFinishTimer();
    setIsTranslating(false);
    setTranslationProgress(0);
    setTranslationStage('');
    setTranslationEta('');
  }, [clearFinishTimer]);

  useEffect(() => {
    return () => {
      clearFinishTimer();
    };
  }, [clearFinishTimer]);

  return {
    isTranslating,
    translationProgress,
    translationStage,
    translationEta,
    applyProgress,
    finishProgress,
    failProgress,
  };
}