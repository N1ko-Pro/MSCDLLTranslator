import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { AlertCircle, Sparkles, Search } from 'lucide-react';
import TopBar from './TopBar';
import TranslationStatusBar from './TopBar_Utils/TranslationStatusBar';
import useAutoTranslation from '../Core/TranslationCore';
import { useKeyboardShortcuts } from '../../Utils/Keyboard/useKeyboardShortcuts';
import VirtualTableRow from './MainTable_Utils/VirtualTableRow';
import { hasConfiguredGithubApiKey } from './TopBar_Utils/autoTranslationModes';
import { SearchClearButton } from './MainTable_Utils/MainTable_Buttons/MainTableButtons';

export default function MainTable({
  disabled,
  originalStrings,
  translations,
  setTranslations,
  translationSettings,
  onUpdateSettings,
  onSavePak,
  onExportXml,
  onImportXml,
  onSettingsOpen,
  modData,
  onValidatePackBeforeOpen,
  packValidation,
  packValidationAttempt = 0,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const [dismissedMissingRowAttempts, setDismissedMissingRowAttempts] = useState(() => ({}));

  useKeyboardShortcuts({
    onFocusSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
  });

  const { isTranslating, triggerAutoTranslation, translationProgress, translationStage } = useAutoTranslation({
    originalStrings,
    translations,
    setTranslations,
  });

  const hasAiKey = useMemo(() => hasConfiguredGithubApiKey(translationSettings), [translationSettings]);

  const totalCount = originalStrings?.length || 0;
  const translatedCount = useMemo(() => {
    return originalStrings?.filter((row) => translations[row.id] && translations[row.id].trim() !== '').length || 0;
  }, [originalStrings, translations]);

  const hasOriginalUuid = !translations.uuid && !!modData?.uuid;

  const handleTranslateChange = useCallback(
    (rowId, value) => {
      setTranslations((prev) => ({ ...prev, [rowId]: value }));
    },
    [setTranslations]
  );

  const handleClearTranslation = useCallback(
    (rowId) => {
      setTranslations((prev) => {
        const newTranslations = { ...prev };
        delete newTranslations[rowId];
        return newTranslations;
      });
    },
    [setTranslations]
  );

  const filteredStrings = useMemo(() => {
    if (!searchQuery) return originalStrings || [];
    const q = searchQuery.toLowerCase();
    return originalStrings.filter((row) => {
      const origMatch = row.original?.toLowerCase().includes(q);
      const transMatch = translations[row.id]?.toLowerCase().includes(q);
      return origMatch || transMatch;
    });
  }, [originalStrings, translations, searchQuery]);

  const progress = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;
  const missingMainTableRowIdSet = useMemo(() => new Set(packValidation?.missingMainTableRowIds || []), [packValidation]);

  const dismissMissingRowHighlight = useCallback(
    (rowId, isMissingByValidation) => {
      if (!isMissingByValidation) return;
      setDismissedMissingRowAttempts((previous) => {
        if (previous[rowId] === packValidationAttempt) return previous;
        return { ...previous, [rowId]: packValidationAttempt };
      });
    },
    [packValidationAttempt]
  );

  const getProgressGradient = (p) => {
    if (p === 0) return 'from-zinc-700 to-zinc-600';
    if (p < 30) return 'from-rose-500 to-red-500';
    if (p < 60) return 'from-orange-500 to-amber-500';
    if (p < 100) return 'from-lime-400 to-emerald-500';
    return 'from-emerald-500 to-teal-500';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0f0f13]">
      <TranslationStatusBar visible={isTranslating} stage={translationStage} progress={translationProgress} />
      <TopBar
        onStartTranslation={triggerAutoTranslation}
        disableTranslation={disabled || !originalStrings.length}
        isTranslating={isTranslating}
        hasAiKey={hasAiKey}
        onSettingsOpen={onSettingsOpen}
        onSavePak={onSavePak}
        hasOriginalUuid={hasOriginalUuid}
        onExportXml={onExportXml}
        onImportXml={onImportXml}
        onValidatePackBeforeOpen={onValidatePackBeforeOpen}
        translationSettings={translationSettings}
        onUpdateSettings={onUpdateSettings}
      />

      <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-8 scroll-smooth z-10 flex flex-col">
        {disabled ? (
          <div className="flex-1 flex flex-col items-center justify-center pt-10">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.02)] border border-white/10">
              <AlertCircle className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-3">В проекте нет строк для перевода</h2>
            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6 leading-relaxed">
              Этот мод не содержит распознанных строк для перевода, или файлы локализации пусты.
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between shrink-0 mb-4 pl-1 pr-[14px] gap-6">
              <div className="glass-panel px-4 py-2 rounded-xl flex items-center bg-[#18181b]/50">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                    Прогресс перевода
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressGradient(progress)} rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">
                      {translatedCount} / {totalCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск по строкам (оригинал или перевод)..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18181b]/50 border border-white/5 hover:border-white/10 focus:border-violet-500/40 rounded-2xl py-3 pl-12 pr-10 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-inner"
                />
                {searchQuery && <SearchClearButton onClick={() => setSearchQuery('')} />}
              </div>
            </div>

            <div className="shrink-0 pb-3 z-20 relative pr-[14px]">
              <div className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)] gap-4 px-6 py-3.5 rounded-2xl border border-white/5 bg-[#18181b]/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
                <div className="text-xs font-black text-violet-400/40 uppercase tracking-widest text-center border-r border-violet-500/10 pr-4">
                  #
                </div>
                <div className="text-xs font-black text-zinc-300 uppercase tracking-widest pl-1 border-r border-violet-500/10 pr-4">
                  Оригинальный текст из игры
                </div>
                <div className="flex items-center justify-between gap-3 text-xs font-black text-violet-300/80 uppercase tracking-widest pl-4">
                  <span>Ваш перевод</span>
                  <div className="w-8 shrink-0 flex justify-center">
                    <Sparkles className="w-4 h-4 text-violet-400/80" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 relative pr-[14px]">
              <Virtuoso
                style={{ height: '100%' }}
                overscan={400}
                computeItemKey={(_, row) => row.id}
                components={{ Footer: () => <div style={{ height: '80px' }} /> }}
                data={filteredStrings}
                itemContent={(_, row) => {
                  const displayIndex = originalStrings.indexOf(row) + 1;
                  const isMissingByValidation = missingMainTableRowIdSet.has(row.id);
                  const isRequiredMissing = isMissingByValidation && dismissedMissingRowAttempts[row.id] !== packValidationAttempt;

                  return (
                    <VirtualTableRow
                      key={row.id}
                      row={row}
                      translation={translations[row.id]}
                      searchQuery={searchQuery}
                      displayIndex={displayIndex}
                      isMissingByValidation={isMissingByValidation}
                      isRequiredMissing={isRequiredMissing}
                      onTranslateChange={handleTranslateChange}
                      onClearTranslation={handleClearTranslation}
                      onDismissHighlight={dismissMissingRowHighlight}
                    />
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
