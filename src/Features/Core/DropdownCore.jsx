import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function DropdownCore({ value, options, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selected = options.find((opt) => opt.id === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 text-[12px] text-zinc-200 min-w-0 max-w-[180px]"
      >
        <span className="truncate">{selected?.title || '—'}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 min-w-full w-max rounded-xl border border-white/10 bg-[#1a1a22]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.55)] z-[100] py-1 animate-[fadeIn_150ms_ease-out]">
          {options.map((opt) => {
            const isActive = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="block text-[12px] font-medium truncate">{opt.title}</span>
                  {opt.subtitle && (
                    <span className="block text-[10px] text-zinc-500 mt-0.5 truncate">{opt.subtitle}</span>
                  )}
                </div>
                {isActive && <Check className="w-3 h-3 shrink-0 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
