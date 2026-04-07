import React from 'react';
import { Languages, Package, Settings, DownloadCloud, UploadCloud } from 'lucide-react';

export function AutoTranslateButton({ disabled, isTranslating, onOpen }) {
  return (
    <button
      onClick={onOpen}
      disabled={disabled || isTranslating}
      className={`group relative flex h-[42px] items-center justify-center gap-2 px-5 rounded-xl border transition-all duration-300 overflow-hidden ${
        disabled || isTranslating
          ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
          : 'bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.08] hover:border-fuchsia-500/30 active:scale-95'
      }`}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      <Languages
        className={`relative z-10 w-4 h-4 transition-all duration-300 ${
          disabled || isTranslating
            ? 'text-white/30'
            : 'text-fuchsia-400/80 group-hover:text-fuchsia-400 group-hover:-translate-y-0.5'
        }`}
      />
      <span
        className={`relative z-10 text-sm font-semibold tracking-wide ${
          disabled || isTranslating ? 'text-white/30' : 'text-fuchsia-100/90 group-hover:text-fuchsia-100'
        }`}
      >
        Авто-перевод
      </span>
    </button>
  );
}

export function PackButton({ onPack }) {
  return (
    <button
      onClick={onPack}
      className="group relative flex h-[42px] items-center justify-center gap-2 px-5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 transition-all duration-300 hover:bg-indigo-600/30 hover:border-indigo-500/50 overflow-hidden active:scale-95"
    >
      <Package className="relative z-10 w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-all duration-300" />
      <span className="relative z-10 text-sm font-bold text-indigo-200 tracking-wide">Упаковать</span>
    </button>
  );
}

export function SettingsButton({ onSettings }) {
  return (
    <button
      onClick={onSettings}
      className="group relative flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/[0.02] border border-transparent transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 active:scale-95"
      title="Настройки"
    >
      <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-all duration-500 group-hover:rotate-90" />
    </button>
  );
}

function ExportButton({ onExport }) {
  return (
    <button
      onClick={onExport}
      className="group relative flex h-[42px] items-center justify-center gap-2 px-5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-indigo-500/30 overflow-hidden active:scale-95"
      title="Экспортировать оригинальный XML файл перевода"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      <DownloadCloud className="relative z-10 w-4 h-4 text-indigo-400/80 group-hover:text-indigo-400 group-hover:translate-y-0.5 transition-all duration-300" />
      <span className="relative z-10 text-sm font-semibold text-indigo-100/90 group-hover:text-indigo-100 tracking-wide">
        Экспорт
      </span>
    </button>
  );
}

function ImportButton({ onImport }) {
  return (
    <button
      onClick={onImport}
      className="group relative flex h-[42px] items-center justify-center gap-2 px-5 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-emerald-500/30 overflow-hidden active:scale-95"
      title="Импортировать готовый XML файл перевода"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      <UploadCloud className="relative z-10 w-4 h-4 text-emerald-400/80 group-hover:text-emerald-400 group-hover:-translate-y-0.5 transition-all duration-300" />
      <span className="relative z-10 text-sm font-semibold text-emerald-100/90 group-hover:text-emerald-100 tracking-wide">
        Импорт
      </span>
    </button>
  );
}

export function XmlActionGroup({ onImport, onExport }) {
  return (
    <div className="relative flex items-center justify-center gap-2 px-2 mt-2 mb-2">
      <div className="absolute -top-[14px] left-4 right-4 flex items-center justify-center pointer-events-none">
        <div className="w-full h-2 border-t border-l border-white/20 rounded-tl-lg" />
        <span className="text-[9px] text-zinc-400 font-bold px-1.5 tracking-widest leading-none bg-[#131316]">
          XML
        </span>
        <div className="w-full h-2 border-t border-r border-white/20 rounded-tr-lg" />
      </div>
      <ExportButton onExport={onExport} />
      <ImportButton onImport={onImport} />
    </div>
  );
}
