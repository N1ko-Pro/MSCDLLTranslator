const fs = require('fs');
const path = require('path');
const { sanitizeWorkspaceTag } = require('./bg3_utils/workspaceUtils');
const {
  normalizeProjectRecord,
  toProjectSummary,
  ensureObject,
} = require('./project_utils/normalizer');
const {
  buildProjectFilePath,
  ensureProjectsDirectory,
  readProjectFile,
} = require('./project_utils/fileIO');

function getProjectById(userDataPath, projectId) {
  if (!projectId || typeof projectId !== 'string') {
    return null;
  }

  const projectsDirectory = ensureProjectsDirectory(userDataPath);
  const filePath = buildProjectFilePath(projectsDirectory, projectId);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawProject = readProjectFile(filePath);
  if (!rawProject) {
    return null;
  }

  return normalizeProjectRecord(rawProject, { fallbackId: projectId });
}

function saveProject(userDataPath, projectData) {
  const projectsDirectory = ensureProjectsDirectory(userDataPath);
  const incomingProject = ensureObject(projectData);

  const existingProject =
    typeof incomingProject.id === 'string' && incomingProject.id
      ? getProjectById(userDataPath, incomingProject.id)
      : null;

  const normalizedProject = normalizeProjectRecord(incomingProject, {
    fallbackId: existingProject?.id,
    existingCreatedAt: existingProject?.createdAt,
  });

  if (!normalizedProject) {
    throw new Error('Project data is invalid: missing pakPath.');
  }

  const filePath = buildProjectFilePath(projectsDirectory, normalizedProject.id);
  fs.writeFileSync(filePath, JSON.stringify(normalizedProject, null, 2), 'utf8');

  return normalizedProject;
}

function loadProjectSummaries(userDataPath) {
  const projectsDirectory = ensureProjectsDirectory(userDataPath);

  return fs
    .readdirSync(projectsDirectory)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => {
      const filePath = path.join(projectsDirectory, fileName);
      const fallbackId = path.basename(fileName, '.json');
      const parsedProject = readProjectFile(filePath);
      if (!parsedProject) {
        return null;
      }

      const normalizedProject = normalizeProjectRecord(parsedProject, { fallbackId });
      if (!normalizedProject) {
        return null;
      }

      return toProjectSummary(normalizedProject);
    })
    .filter(Boolean)
    .sort((left, right) => right.lastModified - left.lastModified);
}

function deleteProject(userDataPath, projectId) {
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('Project id is required.');
  }

  const projectsDirectory = ensureProjectsDirectory(userDataPath);
  const filePath = buildProjectFilePath(projectsDirectory, projectId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function createProjectSessionTag(projectRecord) {
  const baseTag = sanitizeWorkspaceTag(projectRecord.id, 'project');
  return `project_${baseTag}__session`;
}

async function loadProjectForEditing({ userDataPath, projectId, bg3Manager }) {
  if (!projectId || typeof projectId !== 'string') {
    return { success: false, error: 'Не указан идентификатор проекта.' };
  }

  const projectRecord = getProjectById(userDataPath, projectId);
  if (!projectRecord) {
    return { success: false, error: 'Проект не найден или повреждён.' };
  }

  if (!fs.existsSync(projectRecord.pakPath)) {
    return {
      success: false,
      error: `Оригинальный .pak файл больше не существует по пути: ${projectRecord.pakPath}`,
    };
  }

  const result = await bg3Manager.unpackAndLoadStrings(projectRecord.pakPath, {
    workspaceTag: createProjectSessionTag(projectRecord),
    freshSessionWorkspace: true,
  });

  return {
    success: true,
    project: {
      id: projectRecord.id,
      name: projectRecord.name,
    },
    data: {
      ...result,
      originalPakPath: projectRecord.pakPath,
      translations: projectRecord.translations,
    },
  };
}

module.exports = {
  ensureProjectsDirectory,
  saveProject,
  loadProjectSummaries,
  getProjectById,
  deleteProject,
  loadProjectForEditing,
};
