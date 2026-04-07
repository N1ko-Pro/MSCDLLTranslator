import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function NewTranslationButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-bold text-indigo-100 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 border border-indigo-500/50 transition-all overflow-hidden active:scale-95"
    >
      <Plus className="w-5 h-5 text-indigo-200" />
      <span className="relative z-10">Новый перевод (.pak)</span>
    </button>
  );
}

export function DeleteProjectButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-zinc-600 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
