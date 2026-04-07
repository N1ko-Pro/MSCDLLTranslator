const { ipcMain } = require('electron');
const { registerModHandlers } = require('./modHandlers');
const { registerProjectHandlers } = require('./projectHandlers');
const { registerTranslatorHandlers } = require('./translatorHandlers');
const { registerXmlHandlers } = require('./xmlHandlers');

function registerWindowHandlers(mainWindow, app) {
  ipcMain.on('window-min', () => mainWindow?.minimize());
  ipcMain.on('window-max', () => {
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('window-close', () => {
    app.isQuitting = true;
    app.quit();
  });
}

function registerAllHandlers({ app, mainWindow, getUserDataPath, services }) {
  const { bg3Manager, smartManager, projectManager } = services;

  registerWindowHandlers(mainWindow, app);
  registerModHandlers(mainWindow, { bg3Manager });
  registerProjectHandlers(getUserDataPath, { projectManager, bg3Manager });
  registerTranslatorHandlers({ smartManager });
  registerXmlHandlers(mainWindow);
}

module.exports = { registerAllHandlers };
