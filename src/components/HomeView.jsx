import React, { useState } from 'react';
import { FolderPlus, FileText, Trash2, Edit3, Sparkles } from 'lucide-react';
import DeleteProjectModal from './DeleteProjectModal';

export default function HomeView({ projects, onCreateProject, onLoadProject, onDeleteProject, onEditProject }) {
  const [projectToDelete, setProjectToDelete] = useState(null);

  const formatDate = (ts) => {
    return new Date(ts).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#0f0f13] min-h-0">
      <div className="absolute inset-0 pointers-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0f0f13] to-[#0f0f13]"></div>
      
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-6 pt-10">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
              <FolderPlus className="w-10 h-10 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-200 mb-3">Пока пусто</h2>
              <p className="text-zinc-500 text-[15px] max-w-md mx-auto leading-relaxed">
                Нажмите кнопку ниже «Создать проект» и выберите DLL файл, чтобы извлечь текст модификации и начать его перевод.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between items-end mb-8 pt-8 px-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ваши проекты</h2>
              <p className="text-zinc-500 text-[13px]">Выберите проект для продолжения перевода или создайте новый.</p>
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="w-full max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-3 mb-8 px-4">
            {projects.map(proj => (
              <div 
                key={proj.id}
                onClick={() => onLoadProject(proj.id)}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-[#18181b]/50 border border-white/5 hover:border-indigo-500/30 hover:bg-[#18181b]/80 transition-all cursor-pointer shadow-sm hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-zinc-200 group-hover:text-indigo-300 transition-colors uppercase tracking-wide">
                      {proj.projectName}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500">
                      <span className="text-indigo-400/80">Автор: <span className="text-zinc-400">{proj.author}</span></span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span>Мод: {proj.modName}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span>Изменен: {formatDate(proj.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject(proj);
                    }}
                    className="p-2.5 rounded-xl text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors active:scale-95 shrink-0"
                    title="Редактировать проект"
                  >
                    <Edit3 className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(proj);
                    }}
                    className="p-2.5 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors active:scale-95 shrink-0"
                    title="Удалить проект"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onCreateProject}
          className="group relative flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-[15px] font-bold text-indigo-100 bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-500/80 transition-all active:scale-95 overflow-hidden mt-8"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
          <FolderPlus className="w-5 h-5 text-indigo-200" />
          <span className="relative z-10">Создать проект</span>
        </button>
      </div>

      {projectToDelete && (
        <DeleteProjectModal
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}