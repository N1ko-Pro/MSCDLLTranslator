import React from 'react';
import SidebarFieldWrapper from './SidebarFieldWrapper';

export default function InputField({
  label,
  original,
  value,
  onChange,
  icon: Icon,
  readOnly,
  isFolder,
  isOriginalUuid,
  isRequiredMissing,
  packValidationAttempt = 0,
  headerEnd,
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [dismissedValidationAttempt, setDismissedValidationAttempt] = React.useState(null);
  const displayValue = value !== undefined ? value : original;
  const isUnknown = original?.includes('Unknown');
  const isValidationHighlighted = isRequiredMissing && dismissedValidationAttempt !== packValidationAttempt;
  const wrapperUnknown = isUnknown || isOriginalUuid;

  return (
    <SidebarFieldWrapper
      isFocused={isFocused}
      value={displayValue}
      isUnknown={wrapperUnknown}
      isFolder={isFolder}
      isOriginalUuid={isOriginalUuid}
      isRequiredMissing={isValidationHighlighted}
    >
      <div className="flex items-center justify-between mb-2 ml-3 max-w-full">
        <label
          className={`text-xs font-semibold transition-colors flex items-center gap-2 ${
            isValidationHighlighted
              ? 'text-rose-300/90'
              : isFocused
                ? 'text-zinc-300'
                : isOriginalUuid
                  ? 'text-orange-500/90'
                  : isFolder
                    ? 'text-blue-300/80'
                    : displayValue && displayValue.trim()
                      ? 'text-emerald-500/80'
                      : isUnknown
                        ? 'text-orange-400/80'
                        : 'text-zinc-500 group-hover:text-zinc-400'
          }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{label}</span>
        </label>
        {headerEnd && <div className="shrink-0 ml-2">{headerEnd}</div>}
      </div>

      <div className="space-y-2 ml-3">
        <input
          type="text"
          readOnly
          value={original}
          className={`w-full bg-[#09090b]/40 border-l-[3px] border-y border-r border-white/5 rounded-md px-3 py-1.5 text-[13px] cursor-default shadow-none focus:outline-none transition-colors ${
            isFolder
              ? '!border-l-blue-500/50 !bg-blue-500/[0.05] text-blue-200/70 italic'
              : isOriginalUuid
                ? '!border-l-orange-500 text-orange-200 bg-orange-500/[0.05]'
                : isFocused
                  ? '!border-l-white text-zinc-200'
                  : displayValue && displayValue.trim()
                    ? '!border-l-emerald-500 text-zinc-300'
                    : isUnknown
                      ? '!border-l-orange-400/70 text-zinc-300'
                      : 'border-l-zinc-600 text-zinc-400'
          }`}
        />
        {!readOnly && (
          <div className="relative">
            <input
              type="text"
              onFocus={() => {
                setIsFocused(true);
                if (isValidationHighlighted) {
                  setDismissedValidationAttempt(packValidationAttempt);
                }
              }}
              onBlur={() => setIsFocused(false)}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Перевести ${label.toLowerCase()}...`}
              className={`input-modern px-3 py-1.5 w-full text-[13px] text-zinc-100 bg-[#09090b]/50 transform transition-all shadow-inner border rounded-md ${
                isValidationHighlighted
                  ? '!border-rose-500/70 focus:!border-rose-400/90 focus:bg-[#09090b]/80'
                  : 'border-white/10 focus:!border-indigo-500/80 focus:bg-[#09090b]/80'
              }`}
            />
          </div>
        )}
      </div>
    </SidebarFieldWrapper>
  );
}
