const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerAllHandlers } = require('./ipc');
const bg3Manager = require('./manager/bg3Manager');
const smartManager = require('./manager/smartManager');
const projectManager = require('./manager/projectManager');

// Suppress security warnings for local dev server (Content-Security-Policy)
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Disable DirectComposition to avoid AMD VideoProcessorGetOutputExtension issues on some integrated GPUs.
app.commandLine.appendSwitch('disable-direct-composition');

// Suppress the punycode deprecation warning globally
process.noDeprecation = true;
const originalEmitWarning = process.emitWarning;
process.emitWarning = function (warning, ...args) {
  if (typeof warning === 'string' && warning.includes('punycode')) return;
  return originalEmitWarning.call(process, warning, ...args);
};

let mainWindow;

function getUserDataPath() {
  return app.getPath('userData');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false,
    backgroundColor: '#0f0f13',
  });

  mainWindow.on('close', (e) => {
    if (app.isQuitting) return;
    e.preventDefault();
    mainWindow.webContents.send('os-window-close');
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(() => {
  smartManager.initializeSettingsStore(getUserDataPath());
  createWindow();

  registerAllHandlers({
    app,
    mainWindow,
    getUserDataPath,
    services: { bg3Manager, smartManager, projectManager },
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

