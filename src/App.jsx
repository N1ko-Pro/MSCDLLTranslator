import React from 'react'
import TitleBar from './Features/MainWindow/TitleBar'
import MainTable from './Features/MainWindow/MainTable'
import SideBar from './Features/MainWindow/SideBar'
import StartPage from './Features/StartWindow/StartPage'
import NotificationCore from './Features/Shared/NotificationCore'
import SettingsCore from './Features/SettingsWindow/SettingsCore'
import LoadingCore from './Features/Core/LoadingCore'
import { useProjectManager } from './Features/Core/ProjectCore'
import useXmlManager from './Features/Core/XmlCore'
import usePackValidation from './Features/Core/ValidationCore'
import useTranslationSettings from './Features/Core/SettingsManagerCore'
import { resolveProjectDisplayName } from './Features/StartWindow/StartPage_Utils/projectData'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const { translationSettings, updateTranslationSettings } = useTranslationSettings();

  const {
    originalStrings,
    translations,
    setTranslations,
    modInfo,
    hasUnsavedChanges,
    isLoadingPak,
    isLoadingProject,
    handleOpenPak,
    handleSaveProject,
    handleCloseProject,
    handleLoadProject,
    handleSavePak
  } = useProjectManager();

  const { handleExportXml, handleImportXml } = useXmlManager({ originalStrings, setTranslations, modInfo });
  const {
    packValidationSnapshot,
    packValidationAttempt,
    handleValidatePackBeforeOpen,
  } = usePackValidation({ originalStrings, translations, modInfo });

  const projectDisplayName = React.useMemo(
    () => resolveProjectDisplayName({ translations, modInfo }),
    [translations, modInfo]
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f13] overflow-hidden text-gray-200 antialiased font-sans">
      <LoadingCore 
        isVisible={isLoadingPak || isLoadingProject} 
        message={isLoadingPak ? "Загрузка мода..." : "Загрузка проекта..."} 
        description={isLoadingPak ? "Пожалуйста, подождите, идет распаковка и анализ файлов..." : "Пожалуйста, подождите, идет загрузка проекта..."}
      />
      <TitleBar
        onSaveProject={handleSaveProject}
        onCloseProject={handleCloseProject}
        hasUnsavedChanges={hasUnsavedChanges}
        currentProject={originalStrings ? { projectName: projectDisplayName } : null}
      />
      <div className="flex flex-1 min-h-0 relative">
        {!originalStrings ? (
          <StartPage onOpenPak={handleOpenPak} onLoadProject={handleLoadProject} />
        ) : (
          <div className="flex-1 overflow-hidden flex w-full relative h-full">
            <SideBar
              modData={modInfo}
              translations={translations}
              setTranslations={setTranslations}
              packValidation={packValidationSnapshot}
              packValidationAttempt={packValidationAttempt}
            />
            <MainTable
              originalStrings={originalStrings}
              translations={translations}
              setTranslations={setTranslations}
              translationSettings={translationSettings}
              onUpdateSettings={updateTranslationSettings}
              onSavePak={handleSavePak}
              onExportXml={handleExportXml}
              onImportXml={handleImportXml}
              onSettingsOpen={() => setIsSettingsOpen(true)}
              modData={modInfo}
              onValidatePackBeforeOpen={handleValidatePackBeforeOpen}
              packValidation={packValidationSnapshot}
              packValidationAttempt={packValidationAttempt}
            />
          </div>
        )}
      </div>
      <NotificationCore />
      {isSettingsOpen && (
        <SettingsCore 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          currentSettings={translationSettings}
          onSaveSettings={updateTranslationSettings}
        />
      )}
    </div>
  )
}

export default App
