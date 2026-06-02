import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { registerFileHandlers } from './ipc/file'
import { registerSettingsHandlers } from './ipc/settings'

// app.getAppPath() → project root in dev, resources/app in production (asar: false).
// Both cases expose dist/ and dist-electron/ as plain directories, so file:// loads work.
const APP_ROOT = app.getAppPath()
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const PRELOAD_PATH  = path.join(APP_ROOT, 'dist-electron', 'preload.js')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    icon: path.join(APP_ROOT, 'public', 'icon.ico'),
    backgroundColor: '#F5EFE6',
    webPreferences: {
      // Preload is now compiled to .cjs
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  })

  // Open external links in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.once('ready-to-show', () => win?.show())

  // ── Window control IPC ───────────────────────────────────────────────
  ipcMain.on('win:minimize', () => win?.minimize())
  ipcMain.on('win:maximize', () => {
    win?.isMaximized() ? win.unmaximize() : win?.maximize()
  })
  ipcMain.on('win:close', () => win?.close())
  ipcMain.handle('win:isMaximized', () => win?.isMaximized() ?? false)

  win.on('maximize',   () => win?.webContents.send('win:maximizeChange', true))
  win.on('unmaximize', () => win?.webContents.send('win:maximizeChange', false))
}

app.whenReady().then(() => {
  registerFileHandlers()
  registerSettingsHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
