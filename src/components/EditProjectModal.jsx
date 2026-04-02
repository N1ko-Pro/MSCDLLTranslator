import React, { useState } from 'react';
import { Settings, Check, X, Edit3 } from 'lucide-react';

export default function EditProjectModal({ onClose, initialData, onSave }) {
  const [projectName, setProjectName] = useState(() => {
    return initialData?.projectName || '';
  });
  
  const [author, setAuthor] = useState(() => {
    return initialData?.author || '';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    onSave({ 
      id: initialData?.id, 
      projectName: projectName.trim(), 
      author: author.trim() || 'Неизвестен' 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#131316] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-violet-500" />

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-indigo-500/10 border-indigo-500/20">
              <Edit3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-zinc-100 tracking-wide tracking-tight leading-tight">
                Редактировать проект
              </h3>
              <p className="text-[12px] font-medium text-zinc-500">
                Измените данные вашего проекта
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Settings className="w-4 h-4 text-zinc-500" />
              Название проекта <span className="text-red-500 text-xs">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Напр. Toolpack_RUS"
              className="w-full bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Settings className="w-4 h-4 text-zinc-500" />
              Автор перевода
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Напр. ivan_translator_22"
              className="w-full bg-[#0f0f13] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all text-center"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!projectName.trim()}
              className="flex-[2] flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 border-indigo-500 border"
            >
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}