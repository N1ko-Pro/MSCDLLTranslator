import React, { useState, useRef, useEffect } from 'react';
import { Bot, Play, X, Cpu, Zap, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { useAIPanelLogic } from '../../hooks/useAIPanelLogic.js';
import { AI_MODELS } from '../../constants/aiConstants.js';
import useAiSettings from '../../hooks/useAiSettings.js';

export default function AIPanelButton({ onAIOpen, disableAI }) {
  const { isPanelOpen, handleOpenPanel, handleClosePanel, handleStart, modelName, handleChangeModel, limits, hasApiKey, setIsPanelOpen } = useAIPanelLogic(onAIOpen);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const settings = useAiSettings();

  if (disableAI) return null;

  const isUnlimited = (parseInt(limits.requests) > 10000) || (parseInt(limits.tokens) > 1000000);

  // Закрытие контекстного меню по клику вне его области
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSelectModel = (id) => {
    handleChangeModel(id);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative h-[42px] flex items-center group/wrapper z-30">
      {/* 
        Slide-out Info Panel 
        z-0 places it physically "under" the main button. 
        translate-x-12 allows it to be hidden beneath the main button initially.
      */}
      <div 
        className={`absolute right-full mr-2 z-0 flex items-center gap-4 bg-white/[0.03] border border-white/10 px-5 py-1.5 rounded-l-xl rounded-r-md backdrop-blur-2xl shadow-none transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap overflow-visible origin-right ${
          isPanelOpen 
            ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-x-16 scale-95 pointer-events-none'
        }`}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent rounded-l-lg mix-blend-screen pointer-events-none overflow-hidden" />
        
        <div ref={dropdownRef} className="relative flex items-center gap-2.5 group/model cursor-pointer px-1 rounded-md" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="p-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 shadow-[inset_0_0_10px_rgba(192,38,211,0.1)] group-hover/model:bg-fuchsia-500/20 transition-colors">
            <Cpu className="w-3.5 h-3.5 text-fuchsia-400" />
          </div>
          <div className="flex flex-col justify-center text-xs h-full">
            <span className="text-[10px] leading-none uppercase font-semibold text-zinc-500 tracking-wider flex items-center gap-1 mb-0.5">
              Модель
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-fuchsia-300' : ''}`} />
            </span>
            <span className="text-fuchsia-100 font-medium tracking-wide leading-none group-hover/model:text-white transition-colors">
              {AI_MODELS.find(m => m.id === modelName)?.label || modelName || 'Не выбрана'}
            </span>
          </div>

          {/* Context Menu for Models */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+12px)] left-0 min-w-[160px] bg-[#1a1a24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {AI_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectModel(m.id);
                  }}
                  className="w-full relative flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors group/item"
                >
                  <div className="w-4 flex items-center justify-center">
                    {modelName === m.id && <Check className="w-3 h-3 text-fuchsia-400" />}
                  </div>
                  <span className={`font-medium ${modelName === m.id ? 'text-fuchsia-200' : 'text-zinc-300 group-hover/item:text-white'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        
        <div className="relative flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 shadow-[inset_0_0_10px_rgba(234,179,8,0.1)]">
             <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="flex flex-col text-xs leading-tight min-w-[70px]">
            <div className="flex items-center gap-1 group/tooltip relative cursor-help w-max">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Лимит (RPM / TPM)</span>
              <HelpCircle className="w-3 h-3 text-zinc-600 group-hover/tooltip:text-zinc-300 transition-colors" />

              <div className="absolute top-full right-0 mt-6 min-w-[240px] p-3 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-1 pointer-events-none transition-all duration-200 z-[9999] text-[10px] text-zinc-400 normal-case font-medium whitespace-normal leading-relaxed text-left">
                <span className="text-amber-300 font-bold block mb-0.5 mt-0 text-xs">RPM (Requests per min)</span>
                Сколько запросов подряд вы можете сделать к серверам ИИ.
                <div className="h-px bg-white/10 w-full my-2"></div>
                <span className="text-sky-300 font-bold block mb-0.5 mt-0 text-xs">TPM (Tokens per min)</span>
                Максимальный объем текста, который ИИ может обработать в рамках этих запросов за 1 минуту.
              </div>
            </div>

            <div className="font-medium tracking-wide mt-0.5 whitespace-nowrap">
              {limits.loading ? (
                 <span className="text-zinc-400 animate-pulse">Проверка...</span>
              ) : limits.requests === 'Ошибка' ? (
                 <span className="text-red-400 inline-block text-[11px]" title={limits.tokens}>ОШИБКА: {limits.tokens}</span>
              ) : isUnlimited ? (
                   <span className="text-zinc-200 flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                      <span className="text-emerald-400 font-bold" title="Безлимит (Pro)">PRO</span>
                      <span className="text-zinc-600 text-[10px]">|</span>
                      <span className="text-amber-300 inline-block text-[11px]" title={limits.requests || 'N/A'}>{limits.requests || 'N/A'}</span>
                      <span className="text-zinc-600 text-[10px]">-</span>
                      <span className="text-sky-300 inline-block text-[10px]" title={limits.tokens || '?'}>{limits.tokens || '?'}</span>
                   </span>
              ) : (
                 <span className="text-zinc-200 flex items-center gap-1.5 flex-nowrap whitespace-nowrap text-ellipsis">
                    <span className="text-amber-300 inline-block" title={limits.requests || '?'}>{limits.requests || '?'}</span>
                    <span className="text-zinc-600 text-[10px]">|</span>
                    <span className="text-sky-300 inline-block" title={limits.tokens || '?'}>{limits.tokens || '?'}</span>
                 </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Buttons Container - z-10 visually places it ABOVE the sliding panel */}
      <div className="relative z-10 flex h-full bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/10 p-1 shadow-none transition-all duration-300 hover:bg-white/[0.06] hover:border-fuchsia-500/30 overflow-hidden group/main w-full">
        {/* Ambient background shimmer */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-500/10 via-transparent to-purple-500/10 opacity-40"></span>
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/main:animate-[shimmer_2s_infinite]"></span>
        
        {/* Default Single Button State */}
        <button
          onClick={handleOpenPanel}
          className={`relative z-10 flex items-center justify-center gap-2 px-4 transition-all duration-300 w-full h-full ${
            isPanelOpen ? 'hidden' : 'flex'
          }`}
        >
          <Bot className="w-4 h-4 text-fuchsia-400/90 group-hover/main:text-fuchsia-400 transition-colors" />
          <span className="text-sm font-semibold text-fuchsia-100/90 group-hover/main:text-fuchsia-100 tracking-wide">ИИ-Перевод</span>
        </button>

        {/* Expanded Two-Button State */}
        {isPanelOpen && (
          <div className="flex items-center justify-between gap-1 w-[220px] animate-in fade-in zoom-in-95 duration-200 h-full relative z-10">
            <button
                onClick={() => {
                  if (!settings.hasApiKey) {
                    settings.setIsAlertOpen(true);
                    return;
                  }
                  handleStart();
                }}
                className={`group/start relative flex-1 flex items-center justify-center gap-2 h-full px-3 rounded-lg overflow-hidden transition-all duration-300 ${
                  settings.hasApiKey 
                    ? 'hover:bg-emerald-500/10 hover:border-emerald-500/20' 
                    : 'opacity-50 grayscale hover:bg-zinc-500/10 cursor-pointer'
                }`}
              >
                <Play className={`relative z-10 w-3.5 h-3.5 transition-all duration-300 ${
                  settings.hasApiKey
                    ? 'fill-emerald-300/80 group-hover/start:fill-emerald-300 group-hover/start:scale-110 group-hover/start:translate-x-0.5'
                    : 'fill-zinc-400 group-hover/start:fill-zinc-300'
                }`} />
                <span className={`relative z-10 text-xs font-bold ${
                  settings.hasApiKey ? 'text-emerald-300' : 'text-zinc-400'
                }`}>Начать</span>
            </button>
            <button
              onClick={handleClosePanel}
              className="group/cancel relative flex-1 flex items-center justify-center gap-2 h-full px-3 rounded-lg overflow-hidden transition-all duration-300 hover:bg-rose-500/10 hover:border-rose-500/20"
            >
              <X className="relative z-10 w-4 h-4 text-rose-300/90 group-hover/cancel:text-rose-300 group-hover/cancel:rotate-90 group-hover/cancel:scale-110 transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
              <span className="relative z-10 text-xs font-bold text-rose-300">Отмена</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}