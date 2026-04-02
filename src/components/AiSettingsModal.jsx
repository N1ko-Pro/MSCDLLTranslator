import React from 'react';
import { Settings, Check } from 'lucide-react';
import { AI_SETTINGS_STRINGS } from '../constants/aiSettingsStrings';

export default function AiSettingsModal({
  isOpen,
  onClose,
  endpointUrl,
  setEndpointUrl,
  apiKey,
  setApiKey,
  showModelSelector,
  modelName,
  setModelName,
  modelHelp,
  normalizedModelName,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#131316] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-600 to-indigo-500" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <Settings className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{AI_SETTINGS_STRINGS.settingsTitle}</h3>
            <p className="text-xs text-zinc-400 font-medium">{AI_SETTINGS_STRINGS.settingsSubtitle}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{AI_SETTINGS_STRINGS.endpointLabel}</label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
            />
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">
              {AI_SETTINGS_STRINGS.endpointHint} <span className="text-zinc-300">https://models.github.ai/inference/chat/completions</span>
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{AI_SETTINGS_STRINGS.apiKeyLabel}</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              placeholder="sk-... или ghp_..."
            />
          </div>

          {showModelSelector ? (
            <div>
              <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">{AI_SETTINGS_STRINGS.modelLabel}</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              >
                <option value="gpt-4o-mini">GPT-4o mini</option>
                <option value="gpt-5-mini">GPT-5 mini</option>
              </select>
              <p className="text-[10px] text-zinc-500 mt-2 font-medium">{AI_SETTINGS_STRINGS.modelHint}</p>
              <p className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
                {modelHelp[normalizedModelName || 'gpt-4o-mini']}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] text-zinc-500 leading-relaxed">
              {AI_SETTINGS_STRINGS.modelFallbackHint}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {AI_SETTINGS_STRINGS.cancelButton}
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4" />
            {AI_SETTINGS_STRINGS.saveButton}
          </button>
        </div>
      </div>
    </div>
  );
}
