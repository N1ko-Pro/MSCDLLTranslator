import React from 'react';
import { RefreshCw } from 'lucide-react';

export function GenerateUuidButton({ onGenerate }) {
  return (
    <button
      onClick={onGenerate}
      className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-[10px] text-orange-300 font-bold uppercase tracking-widest transition-colors"
      title="Сгенерировать новый UUID"
    >
      <RefreshCw className="w-3 h-3" />
      Сгенерировать
    </button>
  );
}
