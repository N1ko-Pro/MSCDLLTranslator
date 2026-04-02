import React from 'react';
import { DownloadCloud, UploadCloud, Bot, Settings } from 'lucide-react';

export default function Topbar({ onAIOpen, disableAI, onSettingsOpen }) {
  return (
    <header className="h-20 border-b border-white/5 bg-[#131316]/80 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 relative z-30">
      <div className="flex-1"></div>

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

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        <button className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600/80 hover:bg-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50 transition-all active:scale-95 overflow-hidden">
          <UploadCloud className="w-4 h-4 text-emerald-100 group-hover:text-white transition-colors" />
          <span className="relative z-10">Импорт</span>
        </button>

        <button className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-500/80 transition-all active:scale-95 overflow-hidden">
          <DownloadCloud className="w-4 h-4" />
          <span className="relative z-10">Экспорт</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>
        
        <button 
          onClick={onSettingsOpen} 
          className="group p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
          title="Настройки"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </header>
  );
}