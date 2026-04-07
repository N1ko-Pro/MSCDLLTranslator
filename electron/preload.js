const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-min'),
  maximize: () => ipcRenderer.send('window-max'),
  close: () => ipcRenderer.send('window-close'),
  onOsClose: (callback) => {
    ipcRenderer.on('os-window-close', callback);
    return () => ipcRenderer.removeListener('os-window-close', callback);
  },

  // BG3 Workflow
  selectAndUnpackPak: () => ipcRenderer.invoke('select-and-unpack-pak'),
  translateStrings: (dataToTranslate, targetLang, options = {}) => ipcRenderer.invoke('translate-strings', {
    dataToTranslate,
    targetLang,
    options,
  }),
  repackMod: (updatedData) => ipcRenderer.invoke('repack-mod', { updatedData }),
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  deleteProject: (id) => ipcRenderer.invoke('delete-project', id),
  loadProject: (projectId) => ipcRenderer.invoke('load-project', projectId),
  
  // XML Import/Export
  exportXml: (translations, modInfo) => ipcRenderer.invoke('export-xml', translations, modInfo),
  importXml: () => ipcRenderer.invoke('import-xml'),

  // Settings
  setTranslationMethod: (method) => ipcRenderer.invoke('set-translation-method', method),
  setTranslationSettings: (settingsPatch) => ipcRenderer.invoke('set-translation-settings', settingsPatch),
  setTranslationProxyPool: (proxyPool) => ipcRenderer.invoke('set-translation-proxy-pool', proxyPool),
  setTranslationProxyConfig: (proxyConfig) => ipcRenderer.invoke('set-translation-proxy-config', proxyConfig),
  clearTranslationProxyPool: () => ipcRenderer.invoke('clear-translation-proxy-pool'),
  getTranslationSettings: () => ipcRenderer.invoke('get-translation-settings')
});
