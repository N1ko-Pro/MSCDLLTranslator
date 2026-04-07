import React from 'react';
import { Globe, RefreshCw, Sparkles } from 'lucide-react';

const APP_LANGUAGE_OPTIONS = [
  { value: 'ru', label: 'Русский (RU)' },
  { value: 'en', label: 'English (EN)' },
];

export default function GeneralPage({ appLanguage, onAppLanguageChange }) {
  return (
    <div className="space-y-5 animate-[fadeIn_220ms_ease-out]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-300" />
              Язык интерфейса
            </p>
            <p className="text-xs text-zinc-500 mt-1">Выберите основной язык программы.</p>
          </div>

          <select
            value={appLanguage}
            onChange={(event) => onAppLanguageChange(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#111116] px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-400/50"
          >
            {APP_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-300" />
              Обновления
            </p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Проверка обновлений будет доступна в следующей версии. Здесь появится информация о новых релизах и
              changelog.
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-emerald-200">
            Скоро
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-300 mt-0.5" />
        <p className="text-xs text-indigo-200/80 leading-relaxed">
          Раздел Общее отвечает за базовые системные параметры приложения и не влияет на качество перевода.
        </p>
      </div>
    </div>
  );
}
