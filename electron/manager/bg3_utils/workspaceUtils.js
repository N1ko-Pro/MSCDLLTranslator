const fs = require('fs');
const { forceRmDir } = require('./fileSystemUtils');

function sanitizeWorkspaceTag(rawTag, fallbackTag) {
  const text = typeof rawTag === 'string' ? rawTag.trim() : '';
  const sanitized = text.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized || fallbackTag;
}

function createSessionWorkspaceTag(baseTag) {
  const sessionSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${baseTag}__work_${sessionSuffix}`;
}

function tryResetWorkspaceDir(workspaceDirPath) {
  if (!fs.existsSync(workspaceDirPath)) {
    return true;
  }

  try {
    fs.rmSync(workspaceDirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    if (!fs.existsSync(workspaceDirPath)) {
      return true;
    }
  } catch {
    // Fallback below handles locked entries in a more granular way.
  }

  return forceRmDir(workspaceDirPath) || !fs.existsSync(workspaceDirPath);
}

function ensureWorkspaceDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.lstatSync(dirPath);
      if (stats.isDirectory()) {
        return true;
      }

      fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }

    fs.mkdirSync(dirPath, { recursive: true });
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function createFallbackWorkspaceDir(baseWorkspaceDir) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${baseWorkspaceDir}__work_${uniqueSuffix}`;
}

function resolveWorkspaceDirectory(baseModWorkspaceDir) {
  const workspaceResetSuccess = tryResetWorkspaceDir(baseModWorkspaceDir);

  if (workspaceResetSuccess && ensureWorkspaceDirectory(baseModWorkspaceDir)) {
    return baseModWorkspaceDir;
  }

  const fallbackWorkspaceDir = createFallbackWorkspaceDir(baseModWorkspaceDir);
  if (!ensureWorkspaceDirectory(fallbackWorkspaceDir)) {
    throw new Error(
      `Could not create workspace directory. Base: ${baseModWorkspaceDir}, Fallback: ${fallbackWorkspaceDir}`
    );
  }

  if (!workspaceResetSuccess) {
    console.warn(
      `Could not fully clean previous workspace at ${baseModWorkspaceDir}. ` +
      `Using fallback workspace: ${fallbackWorkspaceDir}`
    );
  } else {
    console.warn(
      `Could not prepare workspace at ${baseModWorkspaceDir}. ` +
      `Using fallback workspace: ${fallbackWorkspaceDir}`
    );
  }

  return fallbackWorkspaceDir;
}

module.exports = {
  sanitizeWorkspaceTag,
  createSessionWorkspaceTag,
  resolveWorkspaceDirectory,
};
