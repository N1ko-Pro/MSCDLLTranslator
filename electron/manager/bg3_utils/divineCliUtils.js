const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);

class DivineCliUtils {
  constructor(divineExePath) {
    this.divineExe = divineExePath;
    this.toolsDir = require('path').dirname(divineExePath);
  }

  async runCommand(args) {
    const options = {
      cwd: this.toolsDir,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    };
    try {
      return await execFileAsync(this.divineExe, args, options);
    } catch (error) {
      error.message = `${error.message}\nSTDOUT: ${error.stdout || ''}\nSTDERR: ${error.stderr || ''}`;
      throw error;
    }
  }

  async extractPackage(pakPath, modWorkspaceDir) {
    return this.runCommand(['-g', 'bg3', '-a', 'extract-package', '-s', pakPath, '-d', modWorkspaceDir]);
  }

  async createPackage(modWorkspaceDir, outputPakPath) {
    return this.runCommand(['-g', 'bg3', '-a', 'create-package', '-s', modWorkspaceDir, '-d', outputPakPath]);
  }

  async convertLocaToXml(locaPath, xmlPath) {
    return this.runCommand(['-g', 'bg3', '-a', 'convert-loca', '-s', locaPath, '-d', xmlPath]);
  }

  async convertXmlToLoca(xmlPath, locaPath) {
    return this.runCommand(['-g', 'bg3', '-a', 'convert-loca', '-s', xmlPath, '-d', locaPath]);
  }
}

module.exports = DivineCliUtils;
