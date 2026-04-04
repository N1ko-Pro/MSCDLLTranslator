import React from 'react';
import { Bot } from 'lucide-react';
import { AI_MODELS } from '../constants/aiConstants';

export default function TranslationStatusBar({ visible, modelName, stage, eta, progress }) {
  if (!visible) return null;

  const safeProgress = Math.max(0, Math.min(100, progress ?? 0));
  const fallbackModel = 'openai/gpt-4o-mini';
  const currentModel = modelName || fallbackModel;
  const modelObj = AI_MODELS.find(m => m.id === currentModel);
  const modelLabel = modelObj ? modelObj.label : currentModel;
  const stageLabel = stage || `Модель ${modelLabel} переводит строки`;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-white/[0.03] backdrop-blur-2xl border-b border-white/10 h-20 flex items-center justify-between px-8 shadow-2xl animate-[slideInFromTop_0.5s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 via-transparent to-fuchsia-500/5 opacity-50 pointer-events-none"></div>
      
      <div className="relative flex items-center justify-between w-full z-10">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-[46px] h-[46px]">
            <div className="absolute inset-0 border border-fuchsia-500/30 rounded-xl" />
            <div className="absolute inset-0 border-2 border-fuchsia-400 rounded-xl border-t-transparent animate-spin" />
            <Bot className="w-6 h-6 text-fuchsia-300 drop-shadow-[0_0_8px_rgba(192,38,211,0.6)]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-extrabold text-white tracking-wide drop-shadow-md">ИИ ПЕРЕВОДИТ СТРОКИ...</h4>
              <span className="inline-flex items-center justify-center rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-100 shadow-sm">
                {modelLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium tracking-wide flex items-center mt-1">{stageLabel}</p>
            {eta && <p className="text-[11px] text-fuchsia-300/80 font-semibold tracking-wide mt-0.5">{eta}</p>}
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-10">
          <div className="w-full h-3 bg-black/30 backdrop-blur-md rounded-full overflow-hidden border border-white/10 relative shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-fuchsia-300 transition-[width] duration-300 ease-out shadow-[0_0_20px_rgba(217,70,239,0.5)]"
              style={{ width: `${Math.max(safeProgress, 3)}%` }}
            />
            {/* Глянцевый блик на прогресс баре */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent w-full h-full rounded-full mix-blend-overlay"></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold px-1">
            <span className="text-fuchsia-200/90">{safeProgress}% завершено</span>
          </div>
        </div>
      </div>
    </div>
  );
}