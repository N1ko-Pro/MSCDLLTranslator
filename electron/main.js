import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 1220,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    autoHideMenuBar: true,
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.whenReady().then(createWindow)

ipcMain.handle('open-dll', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'DLL Files', extensions: ['dll'] }]
  })
  
  if (canceled) return { success: false }

  const filePath = filePaths[0]
  try {
    const parserPath = process.env.NODE_ENV === 'production' 
       ? path.join(process.resourcesPath, 'backend', 'bin', 'DllParser.exe')
       : path.join(__dirname, '..', 'backend', 'bin', 'DllParser.exe')

    const { stdout, stderr } = await execFileAsync(parserPath, ['read', filePath])

    if (stderr && stderr.trim()) {
      console.warn("Backend WARNING:", stderr)
    }

    const { id, name, author, version, description, strings, error } = JSON.parse(stdout)
    
    if (error) {
       return { success: false, error: error }
    }

    let parsedStrings = []
    if (strings && Array.isArray(strings)) {
        parsedStrings = strings.map((str, index) => ({
            id: index + 1,
            original: str
        }))
    }

    return {
      success: true,
      data: {
        modData: {
          id: id || 'Unknown',
          author: author || 'Unknown',
          name: name || 'Unknown',
          version: version || 'Unknown',
          description: description || 'Unknown'
        },
        strings: parsedStrings
      }
    }
  } catch (err) {
    console.error(err)
    return { success: false, error: err.message }
  }
})