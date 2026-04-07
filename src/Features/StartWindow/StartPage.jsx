import React, { useState, useEffect, useCallback } from 'react';
import { FolderOpen, Clock } from 'lucide-react';
import { notify } from '../Shared/NotificationCore_Utils/notifications';
import { NewTranslationButton, DeleteProjectButton } from './StartPage_Utils/StartPage_Buttons/StartPageButtons';

export default function StartPage({ onOpenPak, onLoadProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.loadProjects();
      if (res && res.success) {
        setProjects(res.projects);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!window.electronAPI) {
        if (!cancelled) setLoading(false);
        return;
      }
      const res = await window.electronAPI.loadProjects();
      if (cancelled) return;
      if (res?.success) setProjects(res.projects);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.electronAPI) {
      const res = await window.electronAPI.deleteProject(id);
      if (res && res.success) {
        notify.success('Удалено', 'Проект успешно удален', 2000);
        setLoading(true);
        await fetchProjects();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-10 relative overflow-hidden bg-[#0f0f13] min-h-0 items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0f0f13] to-[#0f0f13] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col space-y-10 pt-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Проекты BG3 TRANSLATOR</h2>
            <p className="text-zinc-500 text-[15px] mt-2 font-medium">
              Выберите файл .pak для начала перевода или загрузите сохранение
            </p>
          </div>

          <NewTranslationButton onClick={onOpenPak} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Последние проекты
          </h3>

          {loading ? (
            <div className="text-zinc-500 text-sm">Загрузка...</div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <FolderOpen className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-medium">У вас еще нет сохраненных проектов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onLoadProject(p)}
                  className="group relative bg-[#131316] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col gap-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-zinc-200 font-bold text-[15px] truncate max-w-[85%]">{p.name}</h4>
                    <DeleteProjectButton onClick={(e) => handleDelete(e, p.id)} />
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{p.pakPath}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-500/70 mt-auto pt-2 border-t border-white/5">
                    Изменен:{' '}
                    {new Date(p.lastModified).toLocaleDateString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
