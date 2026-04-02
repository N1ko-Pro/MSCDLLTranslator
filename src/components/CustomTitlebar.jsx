import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, ChevronDown, Save, FolderOpen } from 'lucide-react';

export default function CustomTitlebar({ currentProject, onSaveProject, onCloseProject }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximizeWindow) window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    if (window.electronAPI?.closeWindow) window.electronAPI.closeWindow();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-8 bg-[#0f0f13] flex items-center justify-between select-none shrink-0 border-b border-white/5 relative z-[100]" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex-1 flex items-center h-full">
        {currentProject && (
          <div
            ref={menuRef}
            className="relative h-full flex items-center pl-[340px]"
            style={{ WebkitAppRegion: 'no-drag' }}
          >
            <div className="pl-0 h-full flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors border ${isMenuOpen ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Проект</span>
                <div className="w-1 h-1 rounded-full bg-indigo-500/50"></div>
                <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase leading-none">{currentProject.projectName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isMenuOpen && (
              <div className="absolute top-full left-[364px] w-56 py-1.5 mt-1 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => { setIsMenuOpen(false); if(onSaveProject) onSaveProject(); }}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить проект</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); if(onCloseProject) onCloseProject(); }}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm text-zinc-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Закрыть проект</span>
                </button>
              </div>
            )}
          </div>
        )}
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
