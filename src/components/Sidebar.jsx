import React from 'react';
import { Settings, User, FileText, Hash, Info, Type, ScrollText } from 'lucide-react';

export default function Sidebar({ disabled, modData, translations, setTranslations }) {
  const { id = '', author = '', name = '', version = '', description = '' } = modData || {};
  
  const handleTranslate = (key, value) => {
    setTranslations(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`w-[340px] border-r border-white/5 bg-[#131316]/90 backdrop-blur-xl flex flex-col h-full shrink-0 z-30 transition-all ${disabled ? 'opacity-40 pointer-events-none grayscale-[50%]' : ''}`}>
      {/* Header Logo Area */}
      <div className="h-20 shrink-0 px-6 border-b border-white/5 flex items-center bg-[#131316]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[16px] font-bold text-zinc-100 leading-tight tracking-tight">MSC DLL Launcher</h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">v4.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Mod Info Card */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Info className="w-4 h-4 text-zinc-500" />
            <h2 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Данные мода</h2>
          </div>
          
          <div className="glass-panel rounded-2xl p-5 space-y-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-shadow">
            <InputField icon={Type} label="Имя мода" original={name} value={translations.name || ''} onChange={(v) => handleTranslate('name', v)} />
            <InputField icon={FileText} label="Версия" original={version} value={translations.version || ''} onChange={(v) => handleTranslate('version', v)} />
            <InputField icon={User} label="Автор" original={author} value={translations.author || ''} onChange={(v) => handleTranslate('author', v)} />
            <InputField icon={Hash} label="ID мода" original={id} value={translations.id || ''} onChange={(v) => handleTranslate('id', v)} />
          </div>
        </section>

        {/* Description Card */}
        <section className="flex-1 pb-4">
          <div className="flex items-center gap-2 px-1 mb-4">
            <ScrollText className="w-4 h-4 text-zinc-500" />
            <h2 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Описание</h2>
          </div>
          
          <div className="glass-panel rounded-2xl p-5 flex flex-col hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-shadow">
            <DescriptionField 
              original={description} 
              value={translations.description || ''} 
              onChange={(v) => handleTranslate('description', v)} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SidebarFieldWrapper({ isFocused, value, isUnknown, children }) {
  const hasValue = value.trim() !== '';
  return (
    <div className={`group relative -mx-3 p-3 rounded-xl transition-colors hover:bg-white/[0.02] ${isFocused ? 'bg-indigo-500/[0.03] ring-1 ring-indigo-500/20' : hasValue ? 'bg-emerald-500/[0.02] ring-1 ring-emerald-500/10' : isUnknown ? 'bg-orange-500/[0.02] ring-1 ring-orange-500/20' : ''}`}>
      <div className={`absolute h-[calc(100%-16px)] w-[2px] left-[2px] top-[8px] rounded-full transition-all duration-300 ${isFocused ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : hasValue ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : isUnknown ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.4)]' : 'bg-white/5 group-hover:bg-indigo-400/40'}`}></div>
      {children}
    </div>
  );
}

function DescriptionField({ original, value, onChange }) {
  const [isDescFocused, setIsDescFocused] = React.useState(false);
  const isUnknown = original?.includes('Unknown');

  return (
    <SidebarFieldWrapper isFocused={isDescFocused} value={value} isUnknown={isUnknown}>
      <div className="mb-4">
        <label className={`block text-[10px] font-bold mb-2 uppercase tracking-widest transition-colors ml-3 ${isDescFocused ? 'text-zinc-400' : value.trim() ? 'text-emerald-500/80' : isUnknown ? 'text-orange-400/80' : 'text-zinc-500 group-hover:text-zinc-400'}`}>Оригинальный текст</label>
        <div className="ml-3">
          <textarea
            readOnly
            className={`w-full bg-[#09090b]/40 border-l-[3px] border-y border-r border-white/5 rounded-lg px-3 py-2 text-[13px] cursor-default shadow-none focus:outline-none resize-none h-24 transition-colors ${isDescFocused ? '!border-l-white text-zinc-200' : value.trim() ? '!border-l-emerald-500 text-zinc-300' : isUnknown ? '!border-l-orange-400/70 text-zinc-300' : 'border-l-zinc-600 text-zinc-400'}`}
            value={original}
          />
        </div>
      </div>
    
      <div>
        <label className={`block text-[10px] font-bold mb-2 uppercase tracking-widest transition-colors ml-3 ${isDescFocused ? 'text-indigo-400' : value.trim() ? 'text-emerald-400/80' : 'text-indigo-400/70 group-hover:text-indigo-400'}`}>Ваш перевод</label>
        <div className="relative ml-3">
          <textarea
            onFocus={() => setIsDescFocused(true)}
            onBlur={() => setIsDescFocused(false)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-modern h-32 resize-none leading-relaxed text-zinc-100 placeholder-zinc-600 bg-[#09090b]/50 border-white/10 focus:!border-indigo-500/80 focus:bg-[#09090b]/80 transition-all shadow-inner"
            placeholder="Введите перевод описания..."
          />
        </div>
      </div>
    </SidebarFieldWrapper>
  );
}

function InputField({ label, original, value, onChange, icon: Icon }) {
  const [isFocused, setIsFocused] = React.useState(false);
  const isUnknown = original?.includes('Unknown');

  return (
    <SidebarFieldWrapper isFocused={isFocused} value={value} isUnknown={isUnknown}>
      <div className="flex items-center justify-between mb-2 ml-3">
        <label className={`text-xs font-semibold transition-colors flex items-center gap-2 ${isFocused ? 'text-zinc-300' : value.trim() ? 'text-emerald-500/80' : isUnknown ? 'text-orange-400/80' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{label}</span>
        </label>
      </div>
      
      <div className="space-y-2 ml-3">
        <input
          type="text"
          readOnly
          value={original}
          className={`w-full bg-[#09090b]/40 border-l-[3px] border-y border-r border-white/5 rounded-md px-3 py-1.5 text-[13px] cursor-default shadow-none focus:outline-none transition-colors ${isFocused ? '!border-l-white text-zinc-200' : value.trim() ? '!border-l-emerald-500 text-zinc-300' : isUnknown ? '!border-l-orange-400/70 text-zinc-300' : 'border-l-zinc-600 text-zinc-400'}`}
        />
        <div className="relative">
          <input
            type="text"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Перевести ${label.toLowerCase()}...`}
            className="input-modern px-3 py-1.5 text-[13px] text-zinc-100 bg-[#09090b]/50 border-white/10 focus:!border-indigo-500/80 focus:bg-[#09090b]/80 transform transition-all shadow-inner"
          />
        </div>
      </div>
    </SidebarFieldWrapper>
  );
}