import fs from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'
import crypto from 'node:crypto'

const getProjectsDir = () => path.join(app.getPath('userData'), 'projects')

async function ensureProjectsDir() {
  const dir = getProjectsDir()
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // wait for directory creation
  }
  return dir
}

export async function getProjects() {
  const dir = await ensureProjectsDir()
  try {
    const files = await fs.readdir(dir)
    const projects = []
    for (const file of files) {
      if (!file.endsWith('.json')) continue

      try {
        const data = await fs.readFile(path.join(dir, file), 'utf-8')
        const parsed = JSON.parse(data)
        projects.push({
          id: parsed.id,
          projectName: parsed.projectName,
          author: parsed.author,
          modName: parsed.modData?.name || 'Unknown',
          updatedAt: parsed.updatedAt
        })
      } catch (e) {
        console.error("Error reading project file:", file, e)
      }
    }
    return projects.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

export async function loadProject(id) {
    const dir = await ensureProjectsDir()
    const data = await fs.readFile(path.join(dir, `${id}.json`), 'utf-8')
    return JSON.parse(data)
}

export async function saveProject(projectData) {
    const dir = await ensureProjectsDir()
    if (!projectData.id) {
       projectData.id = crypto.randomUUID()
    }
    projectData.updatedAt = Date.now()
    await fs.writeFile(path.join(dir, `${projectData.id}.json`), JSON.stringify(projectData, null, 2))
    return projectData
}

export async function deleteProject(id) {
    const dir = await ensureProjectsDir()
    await fs.unlink(path.join(dir, `${id}.json`))
    return { success: true }
}