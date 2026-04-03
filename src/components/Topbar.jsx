import React from 'react';
import { DownloadCloud, UploadCloud, Settings } from 'lucide-react';
import AIPanelButton from './AIPanelButton.jsx';

export default function Topbar({ onAIOpen, disableAI, onSettingsOpen }) {
  return (
    <header className="h-20 border-b border-white/5 bg-[#131316]/80 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 relative z-30">
      <div className="flex-1"></div>

      <div className="flex items-center gap-3">
        <AIPanelButton onAIOpen={onAIOpen} disableAI={disableAI} />

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        <button className="group relative flex h-[42px] items-center justify-center gap-2 px-5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-emerald-500/30 overflow-hidden active:scale-95">
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></span>
          <UploadCloud className="relative z-10 w-4 h-4 text-emerald-400/80 group-hover:text-emerald-400 group-hover:-translate-y-0.5 transition-all duration-300" />
          <span className="relative z-10 text-sm font-semibold text-emerald-100/90 group-hover:text-emerald-100 tracking-wide">Импорт</span>
        </button>

        <button className="group relative flex h-[42px] items-center justify-center gap-2 px-5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-indigo-500/30 overflow-hidden active:scale-95">
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></span>
          <DownloadCloud className="relative z-10 w-4 h-4 text-indigo-400/80 group-hover:text-indigo-400 group-hover:translate-y-0.5 transition-all duration-300" />
          <span className="relative z-10 text-sm font-semibold text-indigo-100/90 group-hover:text-indigo-100 tracking-wide">Экспорт</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>
        
        <button 
          onClick={onSettingsOpen} 
          className="group relative flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/[0.02] border border-transparent transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 active:scale-95"
          title="Настройки"
        >
          <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-all duration-500 group-hover:rotate-90" />
        </button>
      </div>
    </header>
  );
}