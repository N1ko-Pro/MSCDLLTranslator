const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const xml2js = require('xml2js');

async function extractModInfo(metaLsxPath) {
  let modInfo = {
    name: 'Unknown Mod',
    author: 'Unknown',
    description: '',
    version: '',
    uuid: '',
    folder: ''
  };

  if (!metaLsxPath || !fs.existsSync(metaLsxPath)) return modInfo;

  try {
    const metaData = fs.readFileSync(metaLsxPath, 'utf8');
    const parser = new xml2js.Parser();
    const metaParsed = await parser.parseStringPromise(metaData);
    
    let moduleInfoNode = null;

    const findModuleInfo = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj['$'] && obj['$']['id'] === 'ModuleInfo') {
        moduleInfoNode = obj;
        return;
      }
      for (const key of Object.keys(obj)) {
        findModuleInfo(obj[key]);
      }
    };

    findModuleInfo(metaParsed);

    if (moduleInfoNode && moduleInfoNode.attribute) {
      for (const attr of moduleInfoNode.attribute) {
        const id = attr.$?.id;
        const val = attr.$?.value;
        if (id === 'Name') modInfo.name = val;
        if (id === 'Author') modInfo.author = val;
        if (id === 'Description') modInfo.description = val;
        if (id === 'Version64') modInfo.version = val;
        if (id === 'UUID') modInfo.uuid = val;
        if (id === 'Folder') modInfo.folder = val;
      }
    }
  } catch (err) {
    console.error('Error parsing meta.lsx', err);
  }

  return modInfo;
}

function updateMetaAttribute(xmlData, id, newValue) {
  if (newValue === undefined || newValue === null) return xmlData;
  const regex = new RegExp(`(<attribute\\s+id="${id}"\\s+type="[^"]+"\\s+value=")([^"]*)("\\s*\\/>)`);
  return xmlData.replace(regex, `$1${newValue}$3`);
}

function updateMetaLsx(cachedData, updatedData) {
  if (!cachedData.metaLsxPath || !fs.existsSync(cachedData.metaLsxPath)) return;

  try {
    let metaData = fs.readFileSync(cachedData.metaLsxPath, 'utf8');

    const currentName = cachedData.modInfo?.name || '';
    const newName = updatedData.name ? updatedData.name : currentName + '_RU';
    const newFolderName = newName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const newAuthor = updatedData.author ? updatedData.author : cachedData.modInfo?.author || '';
    const newDesc = updatedData.description ? updatedData.description : ((cachedData.modInfo?.description || '') + ' (Russian Translation)');
    const newUuid = updatedData.uuid ? updatedData.uuid : crypto.randomUUID();

    metaData = updateMetaAttribute(metaData, 'Name', newName);
    metaData = updateMetaAttribute(metaData, 'Folder', newFolderName);
    metaData = updateMetaAttribute(metaData, 'Description', newDesc);
    metaData = updateMetaAttribute(metaData, 'UUID', newUuid);
    metaData = updateMetaAttribute(metaData, 'Author', newAuthor);

    fs.writeFileSync(cachedData.metaLsxPath, metaData, 'utf8');

    const oldFolderName = cachedData.modInfo?.folder || '';
    if (oldFolderName && oldFolderName !== newFolderName) {
      const modsDir = path.join(cachedData.modWorkspaceDir, 'Mods');
      const oldModsSubdir = path.join(modsDir, oldFolderName);
      const newModsSubdir = path.join(modsDir, newFolderName);
      if (fs.existsSync(oldModsSubdir)) {
        fs.renameSync(oldModsSubdir, newModsSubdir);
        cachedData.metaLsxPath = path.join(newModsSubdir, 'meta.lsx');
      }

      const publicDir = path.join(cachedData.modWorkspaceDir, 'Public');
      const oldPublicSubdir = path.join(publicDir, oldFolderName);
      const newPublicSubdir = path.join(publicDir, newFolderName);
      if (fs.existsSync(oldPublicSubdir)) {
        fs.renameSync(oldPublicSubdir, newPublicSubdir);
      }
    }
  } catch (err) {
    console.error('Error updating meta.lsx', err);
  }
}

module.exports = {
  extractModInfo,
  updateMetaLsx
};
