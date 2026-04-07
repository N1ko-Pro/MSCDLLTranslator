import React from 'react';

export default function SidebarFieldWrapper({
  isFocused,
  value,
  isUnknown,
  children,
  isFolder,
  isOriginalUuid,
  isRequiredMissing,
}) {
  const hasValue = value && value.trim() !== '';

  return (
    <div
      className={`group relative -mx-3 p-3 rounded-xl transition-colors hover:bg-white/[0.02] ${
        isRequiredMissing
          ? 'bg-rose-500/[0.08] ring-1 ring-rose-500/40'
          : isFocused
            ? 'bg-indigo-500/[0.03] ring-1 ring-indigo-500/20'
            : isOriginalUuid
              ? 'bg-orange-500/[0.08] ring-1 ring-orange-500/40'
              : isFolder
                ? 'bg-blue-500/[0.04] ring-1 ring-blue-500/20'
                : hasValue
                  ? 'bg-emerald-500/[0.02] ring-1 ring-emerald-500/10'
                  : isUnknown
                    ? 'bg-orange-500/[0.02] ring-1 ring-orange-500/20'
                    : ''
      }`}
    >
      <div
        className={`absolute h-[calc(100%-16px)] w-[2px] left-[2px] top-[8px] rounded-full transition-all duration-300 ${
          isRequiredMissing
            ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.45)]'
            : isFocused
              ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
              : isOriginalUuid
                ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]'
                : isFolder
                  ? 'bg-blue-500/50'
                  : hasValue
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : isUnknown
                      ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.4)]'
                      : 'bg-white/5 group-hover:bg-indigo-400/40'
        }`}
      />
      {children}
    </div>
  );
}
