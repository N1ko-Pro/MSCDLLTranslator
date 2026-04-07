import React, { useState } from 'react';
import AutoTranslatePanel from './TopBar_Utils/AutoTranslatePanel';
import useAutoTranslateModePicker from '../Core/AutoTranslateCore';
import { AutoTranslateButton, PackButton, SettingsButton, XmlActionGroup } from './TopBar_Utils/TopBar_Buttons/TopBarButtons';
import PackModal from '../Shared/NotifModal/PackModal';
import { notify } from '../Shared/NotificationCore_Utils/notifications';

export default function TopBar({
  onStartTranslation,
  disableTranslation,
  isTranslating,
  hasAiKey,
  onSettingsOpen,
  onSavePak,
  onExportXml,
  onImportXml,
  hasOriginalUuid,
  onValidatePackBeforeOpen,
  translationSettings,
  onUpdateSettings,
}) {
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

  const { isExpanded, selectedModeId, errorModeId, canStart, openPanel, closePanel, selectMode, start } =
    useAutoTranslateModePicker({
      disabled: disableTranslation,
      isTranslating,
      hasAiKey,
      onStart: onStartTranslation,
    });

  const handlePackClick = () => {
    if (!onValidatePackBeforeOpen) {
      setIsPackModalOpen(true);
      return;
    }

    const result = onValidatePackBeforeOpen();
    if (!result?.isValid) {
      notify.warning(
        'Не все поля заполнены',
        'Пожалуйста, заполните все обязательные поля перед упаковкой. Незаполненные поля уже подсвечены.',
        6500
      );
      return;
    }

    setIsPackModalOpen(true);
  };

  const confirmPack = () => {
    setIsPackModalOpen(false);
    if (onSavePak) onSavePak();
  };

  return (
    <>
      <header className="h-20 border-b border-white/5 bg-[#131316]/80 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 relative z-30">
        {isExpanded ? (
          <div className="flex-1 mr-4">
            <AutoTranslatePanel
              selectedModeId={selectedModeId}
              errorModeId={errorModeId}
              canStart={canStart}
              isTranslating={isTranslating}
              translationSettings={translationSettings}
              onSelectMode={selectMode}
              onStart={start}
              onClose={closePanel}
              onUpdateSettings={onUpdateSettings}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-3">
          {!isExpanded && (
            <>
              <AutoTranslateButton disabled={disableTranslation} isTranslating={isTranslating} onOpen={openPanel} />

              <div className="w-px h-8 bg-white/10 mx-2" />

              <XmlActionGroup onImport={onImportXml} onExport={onExportXml} />

              <div className="w-px h-8 bg-white/10 mx-2" />
            </>
          )}

          <PackButton onPack={handlePackClick} />

          <div className="w-px h-8 bg-white/10 mx-2" />

          <SettingsButton onSettings={onSettingsOpen} />
        </div>
      </header>

      <PackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        onPack={confirmPack}
        hasOriginalUuid={hasOriginalUuid}
      />
    </>
  );
}
