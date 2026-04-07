const { ipcMain } = require('electron');
const { wrapHandler } = require('./ipcUtils');

function registerTranslatorHandlers({ smartManager }) {
  ipcMain.handle('set-translation-method', wrapHandler(async (_, method) => {
    smartManager.setMethod(method);
    return { success: true, settings: smartManager.getSettings() };
  }));

  ipcMain.handle('set-translation-settings', wrapHandler(async (_, settingsPatch) => {
    const settings = smartManager.updateSettings(settingsPatch || {});
    return { success: true, settings };
  }));

  ipcMain.handle('set-translation-proxy-pool', wrapHandler(async (_, proxyPool) => {
    const settings = smartManager.setProxyPool(proxyPool);
    return { success: true, settings };
  }));

  ipcMain.handle('set-translation-proxy-config', wrapHandler(async (_, proxyConfig) => {
    const settings = smartManager.setProxyConfig(proxyConfig);
    return { success: true, settings };
  }));

  ipcMain.handle('clear-translation-proxy-pool', wrapHandler(async () => {
    const settings = smartManager.clearProxyPool();
    return { success: true, settings };
  }));

  ipcMain.handle('get-translation-settings', wrapHandler(async () => {
    return { success: true, settings: smartManager.getSettings() };
  }));
}

module.exports = { registerTranslatorHandlers };
