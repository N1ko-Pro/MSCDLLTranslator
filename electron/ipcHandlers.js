import { ipcMain, BrowserWindow } from 'electron';
import { openDll } from './dllManager.js';
import { getProjects, loadProject, saveProject, deleteProject } from './projectManager.js';
import { pingAiLimits, translateAi } from './aiService.js';

let isForceClosing = false;

export function getIsForceClosing() {
  return isForceClosing;
}

export function setupIpcHandlers() {
  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.webContents.send('request-app-close');
    }
  });

  ipcMain.on('force-close-app', (event) => {
    isForceClosing = true;
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  ipcMain.handle('open-dll', openDll);
  
  ipcMain.handle('get-projects', async () => await getProjects());
  ipcMain.handle('load-project', async (_, id) => await loadProject(id));
  ipcMain.handle('save-project', async (_, data) => await saveProject(data));
  ipcMain.handle('delete-project', async (_, id) => await deleteProject(id));

  ipcMain.handle('ping-ai-limits', async (event, { apiKey, model, endpointUrl }) => {
    return await pingAiLimits(apiKey, model, endpointUrl);
  });

  ipcMain.handle('translate-ai', async (event, { strings, apiKey, model, endpointUrl }) => {
    return await translateAi(event, { strings, apiKey, model, endpointUrl });
  });
}
