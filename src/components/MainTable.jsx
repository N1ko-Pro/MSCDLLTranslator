import React from 'react';
import { Sparkles, FolderOpen, X, AlertCircle, Settings, Check } from 'lucide-react';
import Topbar from './Topbar';
import TranslationStatusBar from './TranslationStatusBar';
import AiAlertModal from './AiAlertModal';
import AiSettingsModal from './AiSettingsModal';
import useAiTranslation from '../hooks/useAiTranslation';

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

      <AiAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        endpointUrl={endpointUrl}
        setEndpointUrl={setEndpointUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
        showModelSelector={showModelSelector}
        modelName={modelName}
        setModelName={setModelName}
        modelHelp={modelHelp}
        normalizedModelName={normalizedModelName}
        onSave={handleSaveSettings}
      />

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
