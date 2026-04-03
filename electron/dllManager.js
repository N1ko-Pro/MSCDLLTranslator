import { dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function openDll() {
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

    const parsedStrings = Array.isArray(strings) 
      ? strings.map((str, index) => ({ id: index + 1, original: str }))
      : []

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
        strings: parsedStrings,
        filePath
      }
    }
  } catch (err) {
    console.error(err)
    return { success: false, error: err.message }
  }
}
