import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function CustomTitlebar() {
  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximizeWindow) window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    if (window.electronAPI?.closeWindow) window.electronAPI.closeWindow();
  };

  return (
    <div className="h-8 bg-[#0f0f13] flex items-center justify-between select-none shrink-0" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex-1 flex items-center px-4">
        <span className="text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">MSC DLL TRANSLATOR</span>
      </div>
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <button 
          onClick={handleMinimize}
          className="w-11 h-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          onClick={handleMaximize}
          className="w-11 h-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleClose}
          className="w-11 h-full flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
