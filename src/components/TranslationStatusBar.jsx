import React from 'react';
import { Bot } from 'lucide-react';

export default function TranslationStatusBar({ visible, modelName, stage, eta, progress }) {
  if (!visible) return null;

  const safeProgress = Math.max(0, Math.min(100, progress ?? 0));
  const stageLabel = stage || `Модель ${modelName || 'gpt-4o-mini'} переводит строки`;
  const normalizedModelName = (modelName || 'gpt-4o-mini').replace(/^openai\//, '').trim();
  const modelLabel = {
    'gpt-4o-mini': 'GPT-4o mini',
    'gpt-5-mini': 'GPT-5 mini',
  }[normalizedModelName] || normalizedModelName;

  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-fuchsia-900/10 backdrop-blur-md border-b border-fuchsia-500/20 h-16 flex items-center justify-between px-8 shadow-[0_10px_40px_rgba(192,38,211,0.1)] animate-in slide-in-from-top">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 border-2 border-fuchsia-500/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-fuchsia-500 rounded-full border-t-transparent animate-spin" />
          <Bot className="w-4.5 h-4.5 text-fuchsia-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="text-sm font-bold text-fuchsia-100 leading-none">ИИ работает над переводом</h4>
            <span className="inline-flex items-center rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.08)]">
              {modelLabel}
            </span>
          </div>
          <p className="text-[11px] text-fuchsia-300/70 font-medium tracking-wide flex items-center gap-2">{stageLabel}</p>
          <p className="text-[10px] text-fuchsia-200/60 font-medium tracking-wide mt-0.5">{eta}</p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 flex items-center">
        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-fuchsia-500/10 relative">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-indigo-400 transition-[width] duration-100 ease-linear shadow-[0_0_16px_rgba(217,70,239,0.35)]"
            style={{ width: `${Math.max(safeProgress, 6)}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-[left] duration-100 ease-linear"
            style={{ left: `calc(${Math.max(safeProgress, 6)}% - 8px)` }}
          />
        </div>
      </div>
    </div>
  );
}