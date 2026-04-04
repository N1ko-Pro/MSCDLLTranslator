import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteProjectModal({ project, onClose, onConfirm }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 border-b border-white/5 bg-red-500/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Удаление проекта</h2>
            <p className="text-sm text-red-400/80 mt-0.5">Это действие нельзя отменить</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-base text-zinc-300">
            Вы уверены, что хотите удалить проект <br />
            <span className="text-white font-bold px-1.5 py-0.5 bg-white/5 rounded mx-1">{project.projectName}</span>?
          </p>
          <p className="text-sm text-zinc-500">
            Все переведенные строки, метаданные и прогресс будут навсегда удалены из базы данных и файловой системы.
          </p>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 transition-colors border border-transparent"
          >
            Отмена
          </button>
          
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 border border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Удалить проект
          </button>
        </div>
      </div>
    </div>
  );
}