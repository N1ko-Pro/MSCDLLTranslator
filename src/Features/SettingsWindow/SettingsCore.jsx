import React, { useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import Modal from '../Core/ModalCore';
import { notify } from '../Shared/NotificationCore_Utils/notifications';
import GeneralPage from './Settings_Pages/GeneralPage';
import TranslatePage from './Settings_Pages/TranslatePage';
import { normalizeAiModel } from './SettingsCore_Utils/autoTranslationConfig';
import { TabButton, SaveButton, SETTINGS_TABS } from './SettingsCore_Utils/SettingsCore_Buttons/SettingsCoreButtons';

function normalizeIncomingSettings(settings) {
  return {
    general: {
      appLanguage: settings?.general?.appLanguage || 'ru',
    },
    method: settings?.method || 'single',
    ai: {
      githubApiKey: settings?.ai?.githubApiKey || '',
      model: normalizeAiModel(settings?.ai?.model),
    },
  };
}

function hasDraftChanges(draft, current) {
  return (
    draft.method !== current.method ||
    draft.ai.githubApiKey !== current.ai.githubApiKey ||
    draft.ai.model !== current.ai.model ||
    draft.general.appLanguage !== current.general.appLanguage
  );
}

export default function SettingsCore({ isOpen, onClose, currentSettings, onSaveSettings }) {
  const normalizedCurrentSettings = useMemo(() => normalizeIncomingSettings(currentSettings), [currentSettings]);

  const [activeTab, setActiveTab] = useState(SETTINGS_TABS.GENERAL.id);
  const [draftSettings, setDraftSettings] = useState(normalizedCurrentSettings);

  const hasChanges = hasDraftChanges(draftSettings, normalizedCurrentSettings);

  const save = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    const success = await onSaveSettings({
      general: { appLanguage: draftSettings.general.appLanguage },
      method: draftSettings.method,
      ai: { githubApiKey: draftSettings.ai.githubApiKey, model: draftSettings.ai.model },
    });

    if (!success) {
      notify.error('Ошибка', 'Не удалось применить настройки');
      return;
    }

    notify.success('Настройки сохранены', 'Изменения успешно применены');
    onClose();
  };

  const footer = <SaveButton hasChanges={hasChanges} onSave={save} />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Настройки приложения"
      icon={Settings}
      footer={footer}
      closeOnOverlayClick={false}
      showCloseIcon={true}
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <div className="grid grid-cols-2 gap-1">
            <TabButton
              label={SETTINGS_TABS.GENERAL.label}
              icon={SETTINGS_TABS.GENERAL.icon}
              isActive={activeTab === SETTINGS_TABS.GENERAL.id}
              onClick={() => setActiveTab(SETTINGS_TABS.GENERAL.id)}
            />
            <TabButton
              label={SETTINGS_TABS.AUTO_TRANSLATION.label}
              icon={SETTINGS_TABS.AUTO_TRANSLATION.icon}
              isActive={activeTab === SETTINGS_TABS.AUTO_TRANSLATION.id}
              onClick={() => setActiveTab(SETTINGS_TABS.AUTO_TRANSLATION.id)}
            />
          </div>
        </div>

        {activeTab === SETTINGS_TABS.GENERAL.id && (
          <GeneralPage
            appLanguage={draftSettings.general.appLanguage}
            onAppLanguageChange={(value) => {
              setDraftSettings((prev) => ({ ...prev, general: { ...prev.general, appLanguage: value } }));
            }}
          />
        )}

        {activeTab === SETTINGS_TABS.AUTO_TRANSLATION.id && (
          <TranslatePage
            method={draftSettings.method}
            githubApiKey={draftSettings.ai.githubApiKey}
            aiModel={draftSettings.ai.model}
            onMethodChange={(method) => setDraftSettings((prev) => ({ ...prev, method }))}
            onAiModelChange={(model) => setDraftSettings((prev) => ({ ...prev, ai: { ...prev.ai, model } }))}
            onAiKeyChange={(value) => setDraftSettings((prev) => ({ ...prev, ai: { ...prev.ai, githubApiKey: value } }))}
          />
        )}
      </div>
    </Modal>
  );
}
