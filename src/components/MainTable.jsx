import React from 'react';
import { Sparkles, FolderOpen, X, AlertCircle, Settings, Check } from 'lucide-react';
import Topbar from './Topbar';
import TranslationStatusBar from './TranslationStatusBar';
import useAiTranslation from '../hooks/useAiTranslation';
import { AI_MODAL_COPY } from '../constants/modalCopy';

export default function MainTable({ disabled, originalStrings, translations, setTranslations, onOpenDLL }) {
  const {
    aiError,
    apiKey,
    endpointUrl,
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
  } = useAiTranslation({ originalStrings, translations, setTranslations });

  const handleTranslateChange = (rowId, value) => {
    setTranslations({
      ...translations,
      [rowId]: value,
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0f0f13]">
      <Topbar
        translatedCount={translatedCount}
        totalCount={totalCount}
        onOpenDLL={onOpenDLL}
        onAIOpen={triggerAITranslation}
        disableAI={disabled || !originalStrings.length}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      {isAlertOpen && (
        <div className="absolute inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#131316] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-600 to-indigo-500" />

            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                <AlertCircle className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{AI_MODAL_COPY.alertTitle}</h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                  {AI_MODAL_COPY.alertBody}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAlertOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {AI_MODAL_COPY.closeButton}
              </button>
              <button
                onClick={() => {
                  setIsAlertOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg"
              >
                {AI_MODAL_COPY.settingsButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#131316] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-600 to-indigo-500" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Settings className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{AI_MODAL_COPY.settingsTitle}</h3>
                <p className="text-xs text-zinc-400 font-medium">{AI_MODAL_COPY.settingsSubtitle}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{AI_MODAL_COPY.endpointLabel}</label>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                  {AI_MODAL_COPY.endpointHint} <span className="text-zinc-300">https://models.github.ai/inference/chat/completions</span>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{AI_MODAL_COPY.apiKeyLabel}</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
                  placeholder="sk-... или ghp_..."
                />
              </div>

              {showModelSelector ? (
                <div>
                  <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{AI_MODAL_COPY.modelLabel}</label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="gpt-4o-mini">GPT-4o mini</option>
                    <option value="gpt-5-mini">GPT-5 mini</option>
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-2 font-medium">{AI_MODAL_COPY.modelHint}</p>
                  <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
                    {modelHelp[normalizedModelName || 'gpt-4o-mini']}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] text-zinc-500 leading-relaxed">
                  {AI_MODAL_COPY.modelFallbackHint}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {AI_MODAL_COPY.cancelButton}
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg active:scale-95"
              >
                <Check className="w-4 h-4" />
                {AI_MODAL_COPY.saveButton}
              </button>
            </div>
          </div>
        </div>
      )}

      <TranslationStatusBar
        visible={isTranslating}
        modelName={modelName || 'gpt-4o-mini'}
        stage={translationStage}
        eta={translationEta}
        progress={translationProgress}
      />

      {aiError && !isTranslating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(239,68,68,0.2)] animate-in zoom-in-95">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-semibold">{aiError}</span>
          <button onClick={() => setAiError('')} className="ml-2 hover:bg-white/10 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-8 scroll-smooth z-10 flex flex-col">
        {disabled ? (
          <div className="flex-1 flex flex-col items-center justify-center pt-10">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.02)] border border-white/10">
              <FolderOpen className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-3">Мод не выбран</h2>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6 leading-relaxed">
              Нажмите кнопку «Выбрать DLL» в верхней правой панели, чтобы извлечь текст модификации и начать его перевод.
            </p>
            <button
              onClick={onOpenDLL}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/80 transition-all active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              Выбрать файл
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
            <div className="shrink-0 pt-2 pb-3">
              <div className="grid grid-cols-[40px_1fr_1fr] gap-4 px-6 py-3 rounded-2xl border border-white/5 bg-[#111115]/82 backdrop-blur-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">#</div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Оригинальный текст из игры</div>
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-indigo-400/80 uppercase tracking-widest">
                  <span>Ваш перевод</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500/50 shrink-0" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto scroll-smooth pr-1 pb-20">
              {originalStrings.map((row, index) => {
                const isTranslated = !!translations[row.id]?.trim();

                return (
                  <div
                    key={row.id}
                    className={`group grid grid-cols-[40px_1fr_1fr] gap-4 p-3 px-6 rounded-2xl items-center transition-all duration-300 ring-1 ring-inset ${
                      isTranslated
                        ? 'bg-indigo-500/[0.02] ring-indigo-500/10 hover:bg-indigo-500/[0.04]'
                        : 'bg-[#18181b]/40 ring-white/5 hover:bg-[#18181b]/80 hover:ring-white/10'
                    }`}
                  >
                    <div className="text-center font-mono text-[12px] font-semibold text-zinc-600 group-hover:text-indigo-400 transition-colors">
                      {index + 1}
                    </div>

                    <div className="text-[13px] text-zinc-300/90 leading-relaxed font-medium break-words select-text">
                      <span className="relative">
                        {row.original}
                        {!isTranslated && (
                          <span className="absolute -left-4 top-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        )}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full bg-[#09090b]/50 border rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-300 shadow-inner placeholder-zinc-600 ${
                          isTranslated
                            ? 'border-indigo-500/20 text-indigo-100 focus:border-indigo-500/60 hover:border-indigo-500/40 bg-indigo-950/10'
                            : 'border-white/5 text-zinc-200 focus:border-indigo-500/60 focus:bg-[#09090b] hover:border-white/10'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/10`}
                        placeholder={isTranslated ? '' : 'Введите перевод для этой строки...'}
                        value={translations[row.id] || ''}
                        onChange={(e) => handleTranslateChange(row.id, e.target.value)}
                      />
                      {isTranslated && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-medium">
                          Сохранено
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
