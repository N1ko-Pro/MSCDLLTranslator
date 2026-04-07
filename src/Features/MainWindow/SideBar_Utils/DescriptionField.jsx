import React from 'react';
import SidebarFieldWrapper from './SidebarFieldWrapper';

export default function DescriptionField({ original, value, onChange }) {
  const [isFocused, setIsFocused] = React.useState(false);
  const isUnknown = original?.includes('Unknown');

  return (
    <SidebarFieldWrapper isFocused={isFocused} value={value} isUnknown={isUnknown}>
      <div className="mb-2 ml-3">
        <label
          className={`text-xs font-semibold transition-colors flex items-center gap-2 ${
            isFocused ? 'text-zinc-300' : value && value.trim() ? 'text-emerald-500/80' : isUnknown ? 'text-orange-400/80' : 'text-zinc-500 group-hover:text-zinc-400'
          }`}
        >
          Описание
        </label>
      </div>

      <div className="space-y-2 ml-3">
        <div className="bg-[#09090b]/40 border border-white/5 rounded-md px-3 py-2 leading-relaxed">
          <p
            className={`text-[13px] min-h-[40px] max-h-[100px] overflow-auto custom-scrollbar ${
              isUnknown ? 'text-orange-200/60 italic' : 'text-zinc-400'
            }`}
          >
            {original || <span className="text-zinc-600 italic">Нет описания</span>}
          </p>
        </div>

        <textarea
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Перевести описание..."
          rows={3}
          className="w-full bg-[#09090b]/50 border border-white/10 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:border-indigo-500/80 focus:bg-[#09090b]/80 transition-all resize-none custom-scrollbar input-modern shadow-inner"
        />
      </div>
    </SidebarFieldWrapper>
  );
}
