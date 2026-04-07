import React from 'react';
import { Play, X, Sparkles, Cpu } from 'lucide-react';
import DropdownCore from '../../Core/DropdownCore';
import {
  AI_MODEL_OPTIONS,
  AUTO_TRANSLATION_METHODS_BY_MODEL,
  AUTO_TRANSLATION_MODELS,
  getModelByMethod,
} from '../../SettingsWindow/SettingsCore_Utils/autoTranslationConfig';
import { AUTO_TRANSLATION_MODE } from './autoTranslationModes';

export default function AutoTranslatePanel({
  selectedModeId,
  errorModeId,
  canStart,
  isTranslating,
  translationSettings,
  onSelectMode,
  onStart,
  onClose,
  onUpdateSettings,
}) {
  const currentAiModel = translationSettings?.ai?.model || 'openai/gpt-4.1-mini';
  const currentMethod = translationSettings?.method || 'single';
  const currentSmartModel = getModelByMethod(currentMethod);

  const smartModelOptions = AUTO_TRANSLATION_MODELS.map((m) => ({
    id: m.id,
    title: m.title,
    subtitle: m.subtitle,
  }));

  const smartMethodOptions = (AUTO_TRANSLATION_METHODS_BY_MODEL[currentSmartModel] || []).map((m) => ({
    id: m.id,
    title: m.name,
    subtitle: m.badge,
  }));

  const handleAiModelChange = (modelId) => {
    onUpdateSettings({ ai: { ...translationSettings?.ai, model: modelId } });
  };

  const handleSmartModelChange = (modelId) => {
    const methods = AUTO_TRANSLATION_METHODS_BY_MODEL[modelId] || [];
    if (methods.length > 0) {
      onUpdateSettings({ method: methods[0].id });
    }
  };

  const handleSmartMethodChange = (methodId) => {
    onUpdateSettings({ method: methodId });
  };

  const isAiSelected = selectedModeId === AUTO_TRANSLATION_MODE.AI;
  const isSmartSelected = selectedModeId === AUTO_TRANSLATION_MODE.SMART;
  const hasAiError = errorModeId === AUTO_TRANSLATION_MODE.AI;
  const hasSmartError = errorModeId === AUTO_TRANSLATION_MODE.SMART;

  const cardBase =
    'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all duration-200 cursor-pointer select-none';
  const cardActive = 'border-fuchsia-400/40 bg-fuchsia-500/[0.08] shadow-[0_0_20px_rgba(217,70,239,0.12)]';
  const cardInactive = 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]';
  const cardError = 'border-rose-400/60 bg-rose-500/10 animate-[autoTranslateShake_340ms_ease-in-out]';

  return (
    <div className="flex items-center gap-3 w-full animate-[autoTranslatePanelIn_300ms_cubic-bezier(0.2,0.9,0.24,1)]">
      {/* AI Mode Card */}
      <div
        onClick={() => onSelectMode(AUTO_TRANSLATION_MODE.AI)}
        className={`${cardBase} ${hasAiError ? cardError : isAiSelected ? cardActive : cardInactive}`}
      >
        <Sparkles className={`w-4 h-4 shrink-0 ${isAiSelected ? 'text-fuchsia-300' : 'text-zinc-500'}`} />
        <span
          className={`text-[13px] font-semibold whitespace-nowrap ${isAiSelected ? 'text-fuchsia-100' : 'text-zinc-300'}`}
        >
          AI-перевод
        </span>
        {isAiSelected && (
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.6)] shrink-0" />
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownCore value={currentAiModel} options={AI_MODEL_OPTIONS} onChange={handleAiModelChange} />
        </div>
      </div>

      {/* Smart Mode Card */}
      <div
        onClick={() => onSelectMode(AUTO_TRANSLATION_MODE.SMART)}
        className={`${cardBase} ${hasSmartError ? cardError : isSmartSelected ? cardActive : cardInactive}`}
      >
        <Cpu className={`w-4 h-4 shrink-0 ${isSmartSelected ? 'text-fuchsia-300' : 'text-zinc-500'}`} />
        <span
          className={`text-[13px] font-semibold whitespace-nowrap ${isSmartSelected ? 'text-fuchsia-100' : 'text-zinc-300'}`}
        >
          Smart-перевод
        </span>
        {isSmartSelected && (
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.6)] shrink-0" />
        )}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <DropdownCore value={currentSmartModel} options={smartModelOptions} onChange={handleSmartModelChange} />
          <DropdownCore value={currentMethod} options={smartMethodOptions} onChange={handleSmartMethodChange} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          onClick={onStart}
          disabled={!canStart || isTranslating}
          className={`flex h-[38px] items-center justify-center gap-2 px-5 rounded-xl border text-[13px] font-semibold transition-all duration-200 ${
            canStart && !isTranslating
              ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25 hover:border-emerald-300/50 active:scale-[0.98]'
              : 'border-white/10 bg-white/5 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          Начать
        </button>
        <button
          onClick={onClose}
          disabled={isTranslating}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 transition-all duration-200 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
