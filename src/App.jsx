import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import MainTable from './components/MainTable'
import CustomTitlebar from './components/CustomTitlebar'
import HomeView from './components/HomeView'
import EditProjectModal from './components/EditProjectModal'
import CreateProjectModal from './components/CreateProjectModal'
import NotificationContainer from './components/NotificationContainer'
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

  const debouncedSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveWorkspace(false);
    }, 1000);
  };

  // Trigger save directly whenever translations change
  const handleChangeTranslations = (newTrans) => {
    setTranslations(newTrans);
    debouncedSave();
  };

  const handleChangeModDataTrans = (newMeta) => {
    setModDataTranslations(newMeta);
    debouncedSave();
  };


  return (
    <div className="flex flex-col h-screen w-full bg-[#0f0f13] overflow-hidden text-gray-200 antialiased font-sans">
      <CustomTitlebar
        currentProject={currentProject}
        onSaveProject={() => saveWorkspace(true)}
        onCloseProject={() => { setCurrentProject(null); loadProjects(); notify.info(...notificationMessages.project.closed); }}
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

      <NotificationContainer />
    </div>
  )
}

export default App
