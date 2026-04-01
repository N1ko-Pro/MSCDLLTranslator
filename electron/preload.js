import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openDll: () => ipcRenderer.invoke('open-dll'),
  saveDll: (data) => ipcRenderer.invoke('save-dll', data)
})