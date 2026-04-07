import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bot, Cpu, KeyRound, Sparkles } from 'lucide-react';
import {
  AI_MODEL_OPTIONS,
  AUTO_TRANSLATION_METHODS_BY_MODEL,
  AUTO_TRANSLATION_MODELS,
  MODEL_X,
  getAiModelLabel,
  getModelByMethod,
} from '../SettingsCore_Utils/autoTranslationConfig';

export default function TranslatePage({ method, githubApiKey, aiModel, onMethodChange, onAiModelChange, onAiKeyChange }) {
  const [activeModel, setActiveModel] = useState(() => getModelByMethod(method));

  useEffect(() => {
    setActiveModel(getModelByMethod(method));
  }, [method]);

  const visibleMethods = useMemo(
    () => AUTO_TRANSLATION_METHODS_BY_MODEL[activeModel] || AUTO_TRANSLATION_METHODS_BY_MODEL[MODEL_X],
    [activeModel]
  );

  const changeModel = (modelId) => {
    setActiveModel(modelId);
    const modelMethods = AUTO_TRANSLATION_METHODS_BY_MODEL[modelId] || [];
    const hasCurrentMethodInsideModel = modelMethods.some((item) => item.id === method);
    if (!hasCurrentMethodInsideModel && modelMethods.length > 0) {
      onMethodChange(modelMethods[0].id);
    }
  };

  return (
    <div className="space-y-5 animate-[fadeIn_220ms_ease-out]">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" />
          Smart-перевод
        </label>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1">
          {AUTO_TRANSLATION_MODELS.map((model) => {
            const Icon = model.icon;
            const isActive = activeModel === model.id;

            return (
              <button
                key={model.id}
                onClick={() => changeModel(model.id)}
                className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-white/30 bg-white/[0.09] shadow-[0_0_24px_rgba(255,255,255,0.04)]'
                    : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.03]'
                }`}
              >
                <span
                  className={`rounded-md p-1.5 transition-colors duration-300 ${
                    isActive ? 'bg-white/15 text-white' : 'bg-white/5 text-zinc-400 group-hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {model.title}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-500">{model.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
          <Bot className="w-3.5 h-3.5" />
          Режим выбранной модели
        </label>

        <div className="grid gap-3">
          {visibleMethods.map((item) => {
            const Icon = item.icon;
            const isActive = method === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onMethodChange(item.id)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 text-left group ${
                  isActive
                    ? 'bg-white/[0.04] border-white/20'
                    : 'bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg transition-colors duration-300 ${item.bg} ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-medium transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                      {item.badge}
                    </span>
                    {isActive && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed mt-1">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
          <KeyRound className="w-3.5 h-3.5" />
          AI-перевод: GitHub API key
        </label>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-300" />
                AI-перевод
              </p>
              <p className="text-xs text-zinc-500 mt-1">Модель: {getAiModelLabel(aiModel)}</p>
            </div>
          </div>

          <select
            value={aiModel}
            onChange={(event) => onAiModelChange(event.target.value)}
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#0e0e12]/70 px-4 py-3 text-sm text-zinc-100 transition-all duration-200 focus:outline-none focus:border-fuchsia-400/50 focus:ring-4 focus:ring-fuchsia-500/10"
          >
            {AI_MODEL_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-[#15151b] text-zinc-100">
                {option.title} - {option.subtitle}
              </option>
            ))}
          </select>

          <input
            type="password"
            value={githubApiKey}
            onChange={(event) => onAiKeyChange(event.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#0e0e12]/70 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:outline-none focus:border-fuchsia-400/50 focus:ring-4 focus:ring-fuchsia-500/10"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 flex gap-4 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-500/80 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-amber-200/90">Рекомендации</h4>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            Для коротких и важных строк используйте Single. Для больших массивов строк лучше Batch. AI-режим требует
            GitHub API key в этом разделе.
          </p>
        </div>
      </div>
    </div>
  );
}
