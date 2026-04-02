import React, { useState } from 'react';
import { DownloadCloud, FolderOpen, Bot, Settings } from 'lucide-react';

export default function Topbar({ translatedCount, totalCount, onOpenDLL, onAIOpen, disableAI, onSettingsOpen }) {
  const progress = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;

  return (
    <header className="h-20 border-b border-white/5 bg-[#131316]/80 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 relative z-30">
      <div className="flex items-center gap-6">
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-4 bg-[#18181b]/50">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Прогресс перевода</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-zinc-300">{translatedCount} / {totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!disableAI && (
          <button 
            onClick={onAIOpen}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-fuchsia-300 bg-fuchsia-900/20 border border-fuchsia-800/50 hover:bg-fuchsia-900/40 hover:border-fuchsia-500/50 transition-all active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            <Bot className="w-4 h-4 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" />
            <span className="relative z-10">ИИ-Перевод</span>
          </button>
        )}

        <button 
          onClick={onOpenDLL}
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95 overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
          <FolderOpen className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="relative z-10">Выбрать DLL</span>
        </button>

        <button className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-500/80 transition-all active:scale-95 overflow-hidden">
          <DownloadCloud className="w-4 h-4" />
          <span className="relative z-10">Экспорт</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>
        
        <button 
          onClick={onSettingsOpen} 
          className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
          title="Настройки"
        >
          <Settings className="w-5 h-5 hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </header>
  );
}