import React from 'react';
import { Sparkles, FolderOpen } from 'lucide-react';
import Topbar from './Topbar';

export default function MainTable({ disabled, originalStrings, translations, setTranslations, onOpenDLL }) {

  const handleTranslateChange = (id, value) => {
    setTranslations((prev) => ({ ...prev, [id]: value }));
  };

  const translatedCount = Object.values(translations).filter(v => v && v.trim() !== '').length;
  const totalCount = originalStrings ? originalStrings.length : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] overflow-hidden relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

      {/* Top Navigation Bar */}
      <Topbar translatedCount={translatedCount} totalCount={totalCount} onOpenDLL={onOpenDLL} />

      {/* Table Container */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 scroll-smooth z-10 flex flex-col">
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
          <div className="max-w-6xl mx-auto space-y-3 w-full h-full">
            {/* Table Headers */}
            <div className="grid grid-cols-[40px_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5 mb-3 sticky top-0 bg-[#0f0f13]/90 backdrop-blur-xl z-10 rounded-t-xl mt-4">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">#</div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Оригинальный текст из игры</div>
              <div className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest flex justify-between">
                <span>Ваш перевод</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500/50" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2 pb-20">
              {originalStrings.map((row, index) => {
                const isTranslated = !!translations[row.id]?.trim();

                return (
                  <div
                    key={row.id}
                    className={`group grid grid-cols-[40px_1fr_1fr] gap-4 p-3 px-6 rounded-2xl items-center transition-all duration-300 ring-1 ring-inset
                      ${isTranslated
                        ? 'bg-indigo-500/[0.02] ring-indigo-500/10 hover:bg-indigo-500/[0.04]'
                        : 'bg-[#18181b]/40 ring-white/5 hover:bg-[#18181b]/80 hover:ring-white/10'}
                    `}
                  >
                    <div className="text-center font-mono text-[12px] font-semibold text-zinc-600 group-hover:text-indigo-400 transition-colors">
                      {index + 1}
                    </div>

                    <div className="text-[13px] text-zinc-300/90 leading-relaxed font-medium break-words select-text">
                      <span className="relative">
                        {row.original}
                        {!isTranslated && (
                          <span className="absolute -left-4 top-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/70 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
                        )}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        className={`
                          w-full bg-[#09090b]/50 border rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-300 shadow-inner placeholder-zinc-600
                          ${isTranslated
                            ? 'border-indigo-500/20 text-indigo-100 focus:border-indigo-500/60 hover:border-indigo-500/40 bg-indigo-950/10'
                            : 'border-white/5 text-zinc-200 focus:border-indigo-500/60 focus:bg-[#09090b] hover:border-white/10'}
                          focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                        `}
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