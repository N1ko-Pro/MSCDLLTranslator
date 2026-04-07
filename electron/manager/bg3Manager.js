const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const smartManager = require("./smartManager");

const { findModFiles, cleanModWorkspace, findLocalizationRoot } = require("./bg3_utils/fileSystemUtils");
const { sanitizeWorkspaceTag, createSessionWorkspaceTag, resolveWorkspaceDirectory } = require("./bg3_utils/workspaceUtils");
const DivineCliUtils = require("./bg3_utils/divineCliUtils");
const { extractModInfo, updateMetaLsx } = require("./bg3_utils/metaInfoUtils");

function extractStringsFromParsedContent(parsedXml) {
  const rawContentNodes = parsedXml?.contentList?.content;
  const contentNodes = Array.isArray(rawContentNodes)
    ? rawContentNodes
    : rawContentNodes
      ? [rawContentNodes]
      : [];

  const stringsData = {};

  for (const contentNode of contentNodes) {
    const uid = contentNode.$?.contentuid;
    if (uid) {
      stringsData[uid] = contentNode._ || "";
    }
  }

  return stringsData;
}

function applyUpdatedStringsToParsedContent(parsedXml, updatedData) {
  if (!parsedXml?.contentList?.content) return;

  for (const contentNode of parsedXml.contentList.content) {
    const uid = contentNode.$?.contentuid;
    if (uid && typeof updatedData[uid] !== "undefined") {
      contentNode._ = updatedData[uid];
    }
  }
}

class Bg3Manager {
  constructor() {
    this.workspaceDir = path.join(__dirname, "..", "workspace");
    this.toolsDir = path.join(__dirname, "..", "tools");
    this.divineCliUtils = new DivineCliUtils(path.join(this.toolsDir, "divine.exe"));
    this.cachedData = {
      xmlStructure: null,
      locaPath: null,
      xmlPath: null,
      metaLsxPath: null,
      modInfo: null,
      modWorkspaceDir: null,
    };
  }

  _findXmlWithContent(xmlPath) {
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    if (xmlContent.includes('<content ')) return xmlPath;

    const xmlDir = path.dirname(xmlPath);
    const baseName = path.basename(xmlPath);

    for (const file of fs.readdirSync(xmlDir)) {
      if (!file.toLowerCase().endsWith('.xml') || file === baseName) continue;
      const altPath = path.join(xmlDir, file);
      if (fs.readFileSync(altPath, 'utf8').includes('<content ')) return altPath;
    }

    return xmlPath;
  }

  async unpackAndLoadStrings(pakPath, options = {}) {
    const modFolderName = path.basename(pakPath, ".pak");
    const workspaceTag = sanitizeWorkspaceTag(options.workspaceTag, modFolderName);
    const finalWorkspaceTag = options.freshSessionWorkspace
      ? createSessionWorkspaceTag(workspaceTag)
      : workspaceTag;
    const baseModWorkspaceDir = path.join(this.workspaceDir, finalWorkspaceTag);
    const modWorkspaceDir = resolveWorkspaceDirectory(baseModWorkspaceDir);

    await this.divineCliUtils.extractPackage(pakPath, modWorkspaceDir);

    const { targetLocaPath, targetXmlPath, metaLsxPath } = findModFiles(modWorkspaceDir);

    let finalLocaPath = targetLocaPath;
    let finalXmlPath = targetXmlPath;

    if (!finalLocaPath && finalXmlPath) {
      finalXmlPath = this._findXmlWithContent(finalXmlPath);
      finalLocaPath = finalXmlPath.replace(/\.xml$/i, '.loca');
      await this.divineCliUtils.convertXmlToLoca(finalXmlPath, finalLocaPath);
    }

    if (!finalLocaPath) throw new Error("No .loca localization file found in this mod.");

    const modInfo = await extractModInfo(metaLsxPath);

    const xmlPath = finalLocaPath.replace(/\.loca$/, ".xml");

    this.cachedData = {
      xmlStructure: null,
      locaPath: finalLocaPath,
      xmlPath,
      metaLsxPath,
      modInfo,
      modWorkspaceDir,
    };

    await this.divineCliUtils.convertLocaToXml(finalLocaPath, xmlPath);

    const xmlData = fs.readFileSync(xmlPath, "utf8");
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(xmlData);

    this.cachedData.xmlStructure = parsed;

    const stringsData = extractStringsFromParsedContent(parsed);

    return { strings: stringsData, modInfo };
  }

  async translateBatch(dataToTranslate, targetLang = "ru", options = {}) {
    try {
      return await smartManager.translateBatchWithRetry(dataToTranslate, targetLang, options);
    } catch (error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        const settings = smartManager.getSettings();
        const proxyPoolSize = settings?.proxy?.poolSize || 0;

        if (proxyPoolSize > 0) {
          throw new Error("Сервис перевода вернул 429. Приложение попробовало прокси из вашего пула, но доступные адреса были исчерпаны. Проверьте актуальность пула/логина или повторите попытку позже.");
        }

        throw new Error("Сервис перевода временно заблокировал запросы (Ошибка 429). Добавьте proxy-пул для авто-ротации или попробуйте позже.");
      }
      throw error;
    }
  }

  async saveAndRepack(updatedData, outputPakPath) {
    if (!this.cachedData.xmlStructure) throw new Error("No XML structure loaded.");

    const parsed = this.cachedData.xmlStructure;

    applyUpdatedStringsToParsedContent(parsed, updatedData);

    const locaDir = path.dirname(this.cachedData.locaPath);
    const locRoot = findLocalizationRoot(locaDir, this.workspaceDir);

    const ruLocaDir = path.join(locRoot, "Russian");
    if (!fs.existsSync(ruLocaDir)) fs.mkdirSync(ruLocaDir, { recursive: true });

    const ruXmlPath = path.join(ruLocaDir, "russian.xml");
    const ruLocaPath = path.join(ruLocaDir, "russian.loca");

    const builder = new xml2js.Builder({ xmldec: { version: "1.0", encoding: "utf-8" }});
    const newXml = builder.buildObject(parsed);
    fs.writeFileSync(ruXmlPath, newXml, "utf8");

    await this.divineCliUtils.convertXmlToLoca(ruXmlPath, ruLocaPath);

    updateMetaLsx(this.cachedData, updatedData);

    cleanModWorkspace(this.cachedData.modWorkspaceDir);

    await this.divineCliUtils.createPackage(this.cachedData.modWorkspaceDir, outputPakPath);
  }
}

module.exports = new Bg3Manager();