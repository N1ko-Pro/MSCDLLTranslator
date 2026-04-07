import React from 'react';
import { Trash2 } from 'lucide-react';
import RenderHighlightedText from '../../../Utils/SystemMark/RenderHighlightedText';

const VirtualTableRow = React.memo(
  ({ row, translation, displayIndex, isMissingByValidation, isRequiredMissing, onTranslateChange, onClearTranslation, onDismissHighlight, searchQuery }) => {
    const normalizedTranslation = translation || '';
    const isTranslated = !!normalizedTranslation.trim();

    const handleClear = () => {
      onClearTranslation(row.id);
    };

    return (
      <div className="pb-1.5" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        <div
          className={`group grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)] gap-4 p-3 px-6 rounded-2xl items-center transition-all duration-200 ring-1 ring-inset ${
            isRequiredMissing
              ? 'bg-rose-500/[0.06] ring-rose-500/35 hover:bg-rose-500/[0.09] focus-within:bg-rose-500/[0.12] focus-within:ring-rose-500/55'
              : isTranslated
                ? 'bg-indigo-500/[0.02] ring-indigo-500/10 hover:bg-indigo-500/[0.04] focus-within:bg-indigo-500/[0.05] focus-within:ring-indigo-500/25'
                : 'bg-[#18181b]/30 ring-white/5 hover:bg-[#18181b]/70 hover:ring-white/10 focus-within:bg-[#18181b]/90 focus-within:ring-white/15 focus-within:shadow-xl shadow-black/20'
          }`}
        >
          <div
            className={`text-center font-mono text-[12px] font-semibold transition-colors border-r border-white/5 pr-4 self-center ${
              isRequiredMissing
                ? 'text-rose-300 group-hover:text-rose-200 group-focus-within:text-rose-200'
                : 'text-zinc-600 group-hover:text-indigo-400 group-focus-within:text-indigo-400'
            }`}
          >
            {displayIndex}
          </div>

          <div className="text-[13px] text-zinc-300/90 leading-relaxed font-medium break-words [overflow-wrap:anywhere] select-text pl-4 border-r border-white/5 pr-4 self-center min-w-0">
            <span className="relative">
              <RenderHighlightedText text={row.original} mode="table" searchQuery={searchQuery} />
              {!isTranslated && (
                <span className="absolute -left-4 top-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              )}
            </span>
          </div>

          <div className="relative flex items-center gap-3 pl-4 min-w-0">
            <div className="relative flex-1 w-full min-w-0 overflow-hidden">
              <div
                className={`pointer-events-none absolute inset-0 z-0 rounded-xl px-4 py-2.5 text-[13px] font-medium leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                  isRequiredMissing ? 'text-rose-100' : isTranslated ? 'text-indigo-100' : 'text-zinc-200'
                }`}
                aria-hidden="true"
              >
                {normalizedTranslation ? (
                  <RenderHighlightedText text={normalizedTranslation} mode="editor" searchQuery={searchQuery} />
                ) : (
                  <span className="text-transparent">.</span>
                )}
              </div>

              <textarea
                className={`relative z-10 flex-1 w-full min-w-0 resize-none overflow-hidden bg-[#09090b]/50 border rounded-xl px-4 py-2.5 text-[13px] font-medium leading-relaxed [overflow-wrap:anywhere] text-transparent caret-zinc-200 transition-all duration-200 shadow-inner placeholder-zinc-600 ${
                  isRequiredMissing
                    ? 'border-rose-500/60 focus:border-rose-400/90 hover:border-rose-400/80 bg-rose-950/20'
                    : isTranslated
                      ? 'border-indigo-500/20 focus:border-indigo-500/60 hover:border-indigo-500/40 bg-indigo-950/10'
                      : 'border-white/5 focus:border-indigo-500/60 focus:bg-[#09090b] hover:border-white/10'
                } focus:outline-none focus:ring-4 ${isRequiredMissing ? 'focus:ring-rose-500/15' : 'focus:ring-indigo-500/10'}`}
                style={{ fieldSizing: 'content', minHeight: '40px' }}
                placeholder=""
                value={normalizedTranslation}
                rows={1}
                onFocus={() => onDismissHighlight(row.id, isMissingByValidation)}
                onChange={(e) => onTranslateChange(row.id, e.target.value)}
              />
            </div>

            <button
              onClick={handleClear}
              title="Очистить перевод"
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-zinc-600 opacity-60 hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default VirtualTableRow;
