import React from 'react';
import { Minus, Square, X, ChevronDown, Save, FolderOpen } from 'lucide-react';

export function WindowControls({ onMinimize, onMaximize, onClose }) {
  return (
    <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
      <button
        onClick={onMinimize}
        className="w-11 h-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={onMaximize}
        className="w-11 h-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Square className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onClose}
        className="w-11 h-full flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProjectMenu({
  isMenuOpen,
  hasUnsavedChanges,
  projectName,
  onToggleMenu,
  onSaveProject,
  onCloseProject,
}) {
  return (
    <>
      <button
        onClick={onToggleMenu}
        className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors border ${
          hasUnsavedChanges
            ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
            : isMenuOpen
              ? 'bg-indigo-500/20 border-indigo-500/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
      >
        <div className="flex items-center justify-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Проект</span>
        </div>
        {hasUnsavedChanges ? (
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
        ) : (
          <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
        )}
        <span
          className={`text-[11px] font-bold tracking-wider uppercase leading-none transition-colors ${
            hasUnsavedChanges ? 'text-rose-300' : 'text-indigo-300'
          }`}
        >
          {projectName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {isMenuOpen && (
        <div className="absolute top-full left-[364px] w-56 py-1.5 mt-1 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2">
          <button
            onClick={onSaveProject}
            className="w-full px-4 py-2 flex items-center gap-3 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить проект</span>
          </button>
          <button
            onClick={onCloseProject}
            className="w-full px-4 py-2 flex items-center gap-3 text-sm text-zinc-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Закрыть проект</span>
          </button>
        </div>
      )}
    </>
  );
}
