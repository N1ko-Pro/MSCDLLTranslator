import React, { useState } from 'react';
import { Sparkles, X, AlertCircle, Settings, Check, Trash2, Search } from 'lucide-react';
import Topbar from '../layout/Topbar';
import TranslationStatusBar from '../layout/TranslationStatusBar';
import AiAlertModal from '../ai/AiAlertModal';
import AiSettingsModal from '../ai/AiSettingsModal';
import useAiTranslation from '../../hooks/useAiTranslation';

export default function MainTable({ disabled, originalStrings, translations, setTranslations }) {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    aiError,
    githubApiKey,
    openRouterApiKey,
    handleSaveSettings,
    isAlertOpen,
    isSettingsOpen,
    isTranslating,
    modelHelp,
    modelName,
    normalizedModelName,
    setAiError,
    setGithubApiKey,
    setOpenRouterApiKey,
    setIsAlertOpen,
    setIsSettingsOpen,
    setModelName,
    showModelSelector,
    getAlertMessage,
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

  const handleClearTranslation = (rowId) => {
    const newTranslations = { ...translations };
    delete newTranslations[rowId];
    setTranslations(newTranslations);
  };

  const filteredStrings = originalStrings.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const origMatch = row.original?.toLowerCase().includes(q);
    const transMatch = translations[row.id]?.toLowerCase().includes(q);
    return origMatch || transMatch;
  });

  const progress = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;

  const getProgressGradient = (p) => {
    if (p === 0) return 'from-zinc-700 to-zinc-600';
    if (p < 30) return 'from-rose-500 to-red-500';
    if (p < 60) return 'from-orange-500 to-amber-500';
    if (p < 100) return 'from-lime-400 to-emerald-500';
    return 'from-emerald-500 to-teal-500';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0f0f13]">
      <Topbar

        onAIOpen={triggerAITranslation}
        disableAI={disabled || !originalStrings.length}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      <AiAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        alertBody={typeof getAlertMessage === 'function' ? getAlertMessage() : undefined}
      />

      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        githubApiKey={githubApiKey}
        setGithubApiKey={setGithubApiKey}
        openRouterApiKey={openRouterApiKey}
        setOpenRouterApiKey={setOpenRouterApiKey}
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
              <AlertCircle className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-3">В проекте нет строк для перевода</h2>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6 leading-relaxed">
              Этот файл DLL не содержит распознанных строк, доступных для перевода.
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
            
            <div className="flex items-center justify-between shrink-0 mb-4 pl-1 pr-[14px] gap-6">
              <div className="glass-panel px-4 py-2 rounded-xl flex items-center bg-[#18181b]/50">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Прогресс перевода</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressGradient(progress)} rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">{translatedCount} / {totalCount}</span>
                  </div>
                </div>
              </div>

              <div className="relative group w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по строкам (оригинал или перевод)..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18181b]/50 border border-white/5 hover:border-white/10 focus:border-violet-500/40 rounded-2xl py-3 pl-12 pr-4 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="shrink-0 pb-3 z-20 relative pr-[14px]">
              <div className="grid grid-cols-[40px_1fr_1fr] gap-4 px-6 py-3.5 rounded-2xl border border-white/5 bg-[#18181b]/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
                <div className="text-xs font-black text-violet-400/40 uppercase tracking-widest text-center border-r border-violet-500/10 pr-4">#</div>
                <div className="text-xs font-black text-zinc-300 uppercase tracking-widest pl-1 border-r border-violet-500/10 pr-4">Оригинальный текст из игры</div>
                <div className="flex items-center justify-between gap-3 text-xs font-black text-violet-300/80 uppercase tracking-widest pl-4">
                  <span>Ваш перевод</span>
                  <div className="w-8 shrink-0 flex justify-center">
                    <Sparkles className="w-4 h-4 text-violet-400/80" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto scroll-smooth pr-2 pb-20 flex flex-col gap-1.5">
              {filteredStrings.map((row) => {
                const isTranslated = !!translations[row.id]?.trim();
                const displayIndex = originalStrings.indexOf(row) + 1;

                return (
                  <div
                    key={row.id}
                    className={`group grid grid-cols-[40px_1fr_1fr] gap-4 p-3 px-6 rounded-2xl items-center transition-all duration-300 ring-1 ring-inset ${
                      isTranslated
                        ? 'bg-indigo-500/[0.02] ring-indigo-500/10 hover:bg-indigo-500/[0.04] focus-within:bg-indigo-500/[0.05] focus-within:ring-indigo-500/25'
                        : 'bg-[#18181b]/30 ring-white/5 hover:bg-[#18181b]/70 hover:ring-white/10 focus-within:bg-[#18181b]/90 focus-within:ring-white/15 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    <div className="text-center font-mono text-[12px] font-semibold text-zinc-600 group-hover:text-indigo-400 group-focus-within:text-indigo-400 transition-colors border-r border-white/5 pr-4 self-center">
                      {displayIndex}
                    </div>

                    <div className="text-[13px] text-zinc-300/90 leading-relaxed font-medium break-words select-text pl-4 border-r border-white/5 pr-4 self-center">
                      <span className="relative">
                        {row.original}
                        {!isTranslated && (
                          <span className="absolute -left-4 top-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        )}
                      </span>
                    </div>

                    <div className="relative flex items-center gap-3 pl-4">
                      <textarea
                        className={`flex-1 w-full resize-none overflow-hidden bg-[#09090b]/50 border rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-300 shadow-inner placeholder-zinc-600 ${
                          isTranslated
                            ? 'border-indigo-500/20 text-indigo-100 focus:border-indigo-500/60 hover:border-indigo-500/40 bg-indigo-950/10'
                            : 'border-white/5 text-zinc-200 focus:border-indigo-500/60 focus:bg-[#09090b] hover:border-white/10'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/10`}
                        style={{ fieldSizing: 'content', minHeight: '40px' }}
                        placeholder={isTranslated ? '' : 'Введите перевод для этой строки...'}
                        value={translations[row.id] || ''}
                        rows={1}
                        onChange={(e) => handleTranslateChange(row.id, e.target.value)}
                      />
                      
                      <button
                        onClick={() => handleClearTranslation(row.id)}
                        title="Очистить перевод"
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-zinc-600 opacity-60 hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
