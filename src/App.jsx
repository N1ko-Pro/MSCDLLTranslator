import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './components/layout/Sidebar'
import MainTable from './components/views/MainTable'
import CustomTitlebar from './components/layout/CustomTitlebar'
import HomeView from './components/views/HomeView'
import EditProjectModal from './components/modals/EditProjectModal'
import CreateProjectModal from './components/modals/CreateProjectModal'
import NotificationContainer from './components/layout/NotificationContainer'
import { notify } from './utils/notifications'
import { notificationMessages } from './constants/notificationStrings'

function App() {
  const [projectsList, setProjectsList] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [extractedModData, setExtractedModData] = useState(null);
  const [extractedStrings, setExtractedStrings] = useState([]);
  const saveTimeoutRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exitActionTarget, setExitActionTarget] = useState(null); // 'app' or 'project'
  const [modData, setModData] = useState({ id: '', author: '', name: '', version: '', description: '' });
  const [modDataTranslations, setModDataTranslations] = useState({});
  const [originalStrings, setOriginalStrings] = useState([]);
  const [translations, setTranslations] = useState({});

  const loadProjects = async () => {
    if (window.electronAPI) {
      const list = await window.electronAPI.getProjects();
      setProjectsList(list);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, []);

  const handleOpenDLLForProject = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openDll();
      if (result && result.success) {
        setExtractedModData(result.data.modData);
        setExtractedStrings(result.data.strings);
        setIsCreatingProject(true);
      }
    }
  };

  const handleCreateProject = async ({ projectName, author }) => {
    // initialize new project
    const newProjectData = {
      projectName,
      author,
      modData: extractedModData,
      originalStrings: extractedStrings,
      translations: {
        meta: {
          version: extractedModData.version !== 'Unknown' ? extractedModData.version : '',
          author: extractedModData.author !== 'Unknown' ? extractedModData.author : '',
          id: extractedModData.id !== 'Unknown' ? extractedModData.id : ''
        },
        strings: {}
      }
    };

    if (window.electronAPI) {
      try {
        const savedProj = await window.electronAPI.saveProject(newProjectData);
        loadProjects();
        openWorkspace(savedProj);
        notify.success(...notificationMessages.project.created(projectName));
      } catch (err) {
        notify.error(...notificationMessages.project.createError);
      }
    }
    setIsCreatingProject(false);
  };

  const handleSaveProjectInfo = async ({ id, projectName, author }) => {
    if (!id) return;
    if (window.electronAPI) {
      try {
        const existingProject = await window.electronAPI.loadProject(id);
        if (existingProject) {
          existingProject.projectName = projectName;
          existingProject.author = author;
          const ts = new Date().getTime();
          existingProject.updatedAt = ts;
          await window.electronAPI.saveProject(existingProject);
          loadProjects();

          if (currentProject && currentProject.id === id) {
            setCurrentProject(prev => ({ ...prev, projectName, author, updatedAt: ts }));
          }
          notify.success(...notificationMessages.project.updated(projectName));
        }
      } catch (err) {
        notify.error(...notificationMessages.project.updateError);
      }
    }
    setEditingProject(null);
  };

  const handleLoadProject = async (id) => {
    if (window.electronAPI) {
      const project = await window.electronAPI.loadProject(id);
      if (project) {
        openWorkspace(project);
      }
    }
  };

  const openWorkspace = (project) => {
    setCurrentProject(project);
    setModData(project.modData);
    setOriginalStrings(project.originalStrings);
    setTranslations(project.translations.strings || {});
    setModDataTranslations(project.translations.meta || {});
    setIsLoaded(true);
    setHasUnsavedChanges(false);
  };

  const handleDeleteProject = async (id) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.deleteProject(id);
        loadProjects();
        notify.success(...notificationMessages.project.deleted);
      } catch (err) {
        notify.error(...notificationMessages.project.deleteError);
      }
    }
  };

  const saveWorkspace = async (isManual = false) => {
    if (!currentProject) return;
    const updatedProject = {
      ...currentProject,
      translations: {
        meta: modDataTranslations,
        strings: translations
      }
    };
    if (window.electronAPI) {
      try {
        const saved = await window.electronAPI.saveProject(updatedProject);
        setCurrentProject(saved);
        setHasUnsavedChanges(false);
        if (isManual) {
          notify.success(...notificationMessages.project.saved, 2500);
        }
      } catch (err) {
        if (isManual) {
          notify.error(...notificationMessages.project.saveError);
        }
      }
    }
  };

  // User asked for explicit manual saving via CTR+S, 
  // so we won't trigger network saves automatically on typing anymore.
  const handleChangeTranslations = (newTrans) => {
    setTranslations(newTrans);
    setHasUnsavedChanges(true);
  };

  const handleChangeModDataTrans = (newMeta) => {
    setModDataTranslations(newMeta);
    setHasUnsavedChanges(true);
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Используем e.code === 'KeyS' чтобы комбинация работала на любой языковой раскладке (включая русскую "Ы")
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.code === 'KeyS' || e.key.toLowerCase() === 'ы')) {
        e.preventDefault();
        if (hasUnsavedChanges && currentProject) {
          saveWorkspace(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, currentProject, translations, modDataTranslations]); // Need dependencies to capture latest translation state!

  // Close logic interception with unsaved changes
  useEffect(() => {
    if (!window.electronAPI?.onRequestAppClose) return;
    
    // When the main process tries to close the window
    return window.electronAPI.onRequestAppClose(() => {
      setHasUnsavedChanges((unsaved) => {
        if (unsaved) {
          setExitActionTarget('app');
        } else {
          window.electronAPI.forceCloseApp();
        }
        return unsaved;
      });
    });
  }, []);
  
  const processExitAction = async (save) => {
    if (save) {
      await saveWorkspace(false);
    }
    
    if (exitActionTarget === 'app') {
      if(window.electronAPI) window.electronAPI.forceCloseApp();
    } else if (exitActionTarget === 'project') {
      setCurrentProject(null);
      loadProjects();
      notify.info(...notificationMessages.project.closed);
      setHasUnsavedChanges(false);
    }
    
    setExitActionTarget(null);
  };


  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f13] overflow-hidden text-gray-200 antialiased font-sans">
      <CustomTitlebar
        currentProject={currentProject}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveProject={() => saveWorkspace(true)}
        onCloseProject={() => { 
          if(hasUnsavedChanges) {
             setExitActionTarget('project');
          } else {
             setCurrentProject(null); loadProjects(); notify.info(...notificationMessages.project.closed); setHasUnsavedChanges(false);
          }
        }}
      />
      <div className="flex flex-1 min-h-0 relative">
        {!currentProject ? (
          <HomeView
            projects={projectsList}
            onCreateProject={handleOpenDLLForProject}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            onEditProject={(proj) => setEditingProject(proj)}
          />
        ) : (
          <>
            <Sidebar 
              disabled={!isLoaded} 
              modData={modData} 
              translations={modDataTranslations}
              setTranslations={handleChangeModDataTrans}
            />
            <MainTable 
              disabled={!isLoaded}
              originalStrings={originalStrings}
              translations={translations}
              setTranslations={handleChangeTranslations}
            />
          </>
        )}
      </div>

      {isCreatingProject && (
        <CreateProjectModal
          onClose={() => setIsCreatingProject(false)}
          modData={extractedModData}
          onCreate={handleCreateProject}
        />
      )}

      {!!editingProject && (
        <EditProjectModal
          onClose={() => setEditingProject(null)}
          initialData={editingProject}
          onSave={handleSaveProjectInfo}
        />
      )}

      {exitActionTarget && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-bold text-white mb-2">Несохранённые изменения</h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              В проекте <span className="text-indigo-400 font-semibold">{currentProject?.projectName}</span> остались несохранённые данные. 
              <br/>Если вы выйдете прямо сейчас, они будут потеряны.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setExitActionTarget(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={() => processExitAction(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                Не сохранять
              </button>
              <button 
                onClick={() => processExitAction(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
              >
                Сохранить и {exitActionTarget === 'app' ? 'выйти' : 'закрыть проект'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationContainer />
    </div>
  )
}

export default App
