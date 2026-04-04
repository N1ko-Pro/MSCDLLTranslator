import React from 'react';
import { AlertCircle } from 'lucide-react';
import { AI_SETTINGS_STRINGS } from '../constants/aiSettingsStrings';

export default function AiAlertModal({
  isOpen,
  onClose,
  onOpenSettings,
  alertBody
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#131316] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-600 to-indigo-500" />

        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
            <AlertCircle className="w-5 h-5 text-red-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{AI_SETTINGS_STRINGS.alertTitle}</h3>
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
              {alertBody || AI_SETTINGS_STRINGS.alertBody}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {AI_SETTINGS_STRINGS.closeButton}
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg"
          >
            {AI_SETTINGS_STRINGS.settingsButton}
          </button>
        </div>
      </div>
    </div>
  );
}
