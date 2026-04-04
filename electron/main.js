import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createAiProgressReporter, pingAiLimits } from './ai.js'
import { translateBatchesWithProgress } from './aiBatching.js'
import { getProjects, loadProject, saveProject, deleteProject } from './projectManager.js'
import { openDll } from './dllManager.js'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win
let isForceClosing = false;

function createWindow() {
  win = new BrowserWindow({
    width: 1500,
    height: 1220,
    minWidth: 900,
    minHeight: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    autoHideMenuBar: true,
  })

  win.on('close', (e) => {
    if (!isForceClosing) {
      e.preventDefault();
      win.webContents.send('request-app-close');
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.whenReady().then(createWindow)

ipcMain.on('window-minimize', () => {
  if (win) win.minimize()
})

ipcMain.on('window-maximize', () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('window-close', () => {
  if (win) win.webContents.send('request-app-close');
})

ipcMain.on('force-close-app', () => {
  isForceClosing = true;
  if (win) win.close();
});

ipcMain.handle('open-dll', openDll)

ipcMain.handle('get-projects', async () => await getProjects())
ipcMain.handle('load-project', async (_, id) => await loadProject(id))
ipcMain.handle('save-project', async (_, data) => await saveProject(data))
ipcMain.handle('delete-project', async (_, id) => await deleteProject(id))

ipcMain.handle('ping-ai-limits', async (event, { apiKey, model, endpointUrl }) => {
  return await pingAiLimits(apiKey, model, endpointUrl);
})

ipcMain.handle('translate-ai', async (event, { strings, apiKey, model, endpointUrl }) => {
  if (!strings || strings.length === 0) return { success: false, error: 'Нет текста для перевода.' };
  if (!apiKey) return { success: false, error: 'Необходим API Ключ.' };

  const total = strings.length;
  const activeModel = model || 'gpt-4o-mini';
  const activeEndpoint = endpointUrl || 'https://models.github.ai/inference/chat/completions';
  const progressReporter = createAiProgressReporter(event.sender, {
    model: activeModel,
    endpointUrl: activeEndpoint,
    total,
  });

  progressReporter.start();

  try {
    const result = await translateBatchesWithProgress(
      strings,
      apiKey,
      activeModel,
      activeEndpoint,
      (payload) => {
        progressReporter.progress(payload);
      }
    );

    if (result.success) {
      progressReporter.done();
    } else {
      progressReporter.error(result.error);
    }

    return result;
  } catch (err) {
    progressReporter.error(err.message);
    return { success: false, error: err.message };
  }
})