const { ipcMain } = require('electron');
const { wrapHandler } = require('./ipcUtils');

function registerProjectHandlers(getUserDataPath, { projectManager, bg3Manager }) {
  ipcMain.handle('save-project', wrapHandler(async (_, projectData) => {
    const savedProject = projectManager.saveProject(getUserDataPath(), projectData);
    return { success: true, project: savedProject };
  }));

  ipcMain.handle('load-projects', wrapHandler(async () => {
    const projects = projectManager.loadProjectSummaries(getUserDataPath());
    return { success: true, projects };
  }));

  ipcMain.handle('delete-project', wrapHandler(async (_, id) => {
    projectManager.deleteProject(getUserDataPath(), id);
    return { success: true };
  }));

  ipcMain.handle('load-project', wrapHandler(async (_, projectId) => {
    return projectManager.loadProjectForEditing({
      userDataPath: getUserDataPath(),
      projectId,
      bg3Manager,
    });
  }));
}

module.exports = { registerProjectHandlers };
