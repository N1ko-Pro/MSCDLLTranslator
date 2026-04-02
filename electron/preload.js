import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openDll: () => ipcRenderer.invoke('open-dll'),
  saveDll: (data) => ipcRenderer.invoke('save-dll', data),
  translateAI: (data) => ipcRenderer.invoke('translate-ai', data),
  onTranslateAIProgress: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('translate-ai-progress', handler);

    return () => {
      ipcRenderer.removeListener('translate-ai-progress', handler);
    };
  }
})