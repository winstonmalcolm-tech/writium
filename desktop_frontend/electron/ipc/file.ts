import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

// vite-plugin-electron compiles the main process to CJS, so import.meta.url is
// undefined at runtime. Use process.cwd() as an absolute anchor instead.
const _require = createRequire(path.join(process.cwd(), '_'))

// ── Local document store ──────────────────────────────────────────────────────
// Documents are persisted as JSON files inside the Electron userData directory
// (e.g. C:\Users\<user>\AppData\Roaming\scholarly-editor\documents\)
// This acts as an offline fallback when Supabase is unreachable.

interface LocalDoc {
  id:           string
  title:        string
  content_json: unknown
  updated_at:   string
}

function docsDir() {
  return path.join(app.getPath('userData'), 'documents')
}

async function ensureDocsDir(): Promise<string> {
  const dir = docsDir()
  await fs.mkdir(dir, { recursive: true })
  return dir
}

export function registerFileHandlers() {
  // ── Open file ──────────────────────────────────────────────────────
  ipcMain.handle('file:open', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Open Document',
      filters: [
        { name: 'Documents', extensions: ['docx', 'txt', 'md'] },
        { name: 'Word Documents (.docx)', extensions: ['docx'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })

    if (canceled || !filePaths[0]) return null

    const filePath = filePaths[0]
    const ext = path.extname(filePath).toLowerCase().replace('.', '')

    // .docx — binary format, convert to HTML via mammoth
    if (ext === 'docx') {
      try {
        const mammoth = _require('mammoth')
        const buffer  = await fs.readFile(filePath)
        const result  = await mammoth.convertToHtml({ buffer })
        return { content: result.value, filePath, ext, isHtml: true }
      } catch (err: any) {
        if (err.code === 'MODULE_NOT_FOUND') {
          return { content: null, filePath, ext,
            error: 'mammoth is not installed. Run: npm install mammoth --legacy-peer-deps inside desktop_frontend/' }
        }
        return { content: null, filePath, ext, error: `Could not read .docx: ${err.message}` }
      }
    }

    // .odt — not supported by mammoth; guide the user
    if (ext === 'odt') {
      return { content: null, filePath, ext,
        error: 'ODT files are not supported. Open the file in LibreOffice, save as .docx, then re-import.' }
    }

    // Plain-text formats
    const content = await fs.readFile(filePath, 'utf-8')
    return { content, filePath, ext, isHtml: false }
  })

  // ── Save file to known path ────────────────────────────────────────
  ipcMain.handle('file:save', async (_event, content: string, filePath: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      return true
    } catch {
      return false
    }
  })

  // ── Save file (with dialog) ────────────────────────────────────────
  ipcMain.handle('file:saveAs', async (_event, content: string, defaultName = 'document.txt') => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save Document',
      defaultPath: defaultName,
      filters: [
        { name: 'Word Document (.docx)', extensions: ['docx'] },
        { name: 'Text File', extensions: ['txt'] },
        { name: 'Markdown', extensions: ['md'] },
      ],
    })

    if (canceled || !filePath) return null

    await fs.writeFile(filePath, content, 'utf-8')
    return filePath
  })

  // ── Local document persistence (offline fallback) ──────────────────

  // Write one document to disk
  ipcMain.handle('file:localSave', async (_event, doc: LocalDoc) => {
    try {
      const dir  = await ensureDocsDir()
      const file = path.join(dir, `${doc.id}.json`)
      await fs.writeFile(file, JSON.stringify(doc, null, 2), 'utf-8')
      return true
    } catch {
      return false
    }
  })

  // Read one document from disk by ID
  ipcMain.handle('file:localLoad', async (_event, id: string) => {
    try {
      const file    = path.join(docsDir(), `${id}.json`)
      const content = await fs.readFile(file, 'utf-8')
      return JSON.parse(content) as LocalDoc
    } catch {
      return null
    }
  })

  // List all locally saved documents, newest first
  ipcMain.handle('file:localList', async () => {
    try {
      const dir   = await ensureDocsDir()
      const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'))

      const summaries = await Promise.all(
        files.map(async f => {
          try {
            const raw = await fs.readFile(path.join(dir, f), 'utf-8')
            const doc = JSON.parse(raw) as LocalDoc
            return { id: doc.id, title: doc.title, updated_at: doc.updated_at }
          } catch {
            return null
          }
        }),
      )

      return summaries
        .filter(Boolean)
        .sort((a, b) => new Date(b!.updated_at).getTime() - new Date(a!.updated_at).getTime())
    } catch {
      return []
    }
  })

  // Delete one document from disk
  ipcMain.handle('file:localDelete', async (_event, id: string) => {
    try {
      await fs.unlink(path.join(docsDir(), `${id}.json`))
      return true
    } catch {
      return false
    }
  })
}
