import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  openDll: () => ipcRenderer.invoke('open-dll'),
  saveDll: (data) => ipcRenderer.invoke('save-dll', data),
  getProjects: () => ipcRenderer.invoke('get-projects'),
  loadProject: (id) => ipcRenderer.invoke('load-project', id),
  saveProject: (data) => ipcRenderer.invoke('save-project', data),
  deleteProject: (id) => ipcRenderer.invoke('delete-project', id),
  translateAI: (data) => ipcRenderer.invoke('translate-ai', data),
  onTranslateAIProgress: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('translate-ai-progress', handler);

    return () => {
      ipcRenderer.removeListener('translate-ai-progress', handler);
    };
  }
})