const { dialog } = require('electron');
const fs = require('fs');
const { buildXmlContent } = require('./xml_utils/xmlBuilder');
const { parseXmlContent } = require('./xml_utils/xmlParser');

async function exportXml(mainWindow, translations, modInfo) {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Экспорт локализации в XML',
      defaultPath: (modInfo?.name || 'Localizations') + '_RU.xml',
      filters: [{ name: 'XML Files', extensions: ['xml'] }]
    });

    if (canceled || !filePath) return { success: false, canceled: true };

    const xmlContent = await buildXmlContent(translations);
    
    fs.writeFileSync(filePath, xmlContent, 'utf-8');
    return { success: true, filePath };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

async function importXml(mainWindow) {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Импорт локализации из XML',
      filters: [{ name: 'XML Files', extensions: ['xml'] }],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) return { success: false, canceled: true };

    const xmlPath = filePaths[0];
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const translations = await parseXmlContent(xmlContent);
    
    return { success: true, translations, filePath: xmlPath };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  exportXml,
  importXml
};
