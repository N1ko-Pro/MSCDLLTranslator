const { ipcMain, dialog } = require('electron');
const { wrapHandler } = require('./ipcUtils');

function registerModHandlers(mainWindow, { bg3Manager }) {
  ipcMain.handle('select-and-unpack-pak', wrapHandler(async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select BG3 Mod (.pak)',
      filters: [{ name: 'BG3 Pak Files', extensions: ['pak'] }],
      properties: ['openFile'],
    });

    if (canceled || filePaths.length === 0) return { success: false };

    const result = await bg3Manager.unpackAndLoadStrings(filePaths[0]);
    return { success: true, data: { ...result, originalPakPath: filePaths[0] } };
  }));

  ipcMain.handle('translate-strings', wrapHandler(async (_, { dataToTranslate, targetLang, options }) => {
    const result = await bg3Manager.translateBatch(dataToTranslate, targetLang, options);
    return { success: true, data: result };
  }));

  ipcMain.handle('repack-mod', wrapHandler(async (_, { updatedData }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Translated Mod (.pak)',
      filters: [{ name: 'BG3 Pak Files', extensions: ['pak'] }],
      defaultPath: 'Translated_Mod_RU.pak',
    });

    if (canceled || !filePath) return { success: false };

    await bg3Manager.saveAndRepack(updatedData, filePath);
    return { success: true, filePath };
  }));
}

module.exports = { registerModHandlers };
