import { contextBridge, ipcRenderer } from 'electron'

// Confirm preload loaded — visible in DevTools console
console.log('[preload] loaded')

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Window controls ────────────────────────────────────────────────
  minimize: () => ipcRenderer.send('win:minimize'),
  maximize: () => ipcRenderer.send('win:maximize'),
  close:    () => ipcRenderer.send('win:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('win:isMaximized'),

  // One-way: renderer registers a callback; main sends 'win:maximizeChange'
  onMaximizeChange: (cb: (maximized: boolean) => void) => {
    ipcRenderer.on('win:maximizeChange', (_event, value: boolean) => cb(value))
  },

  // ── File system ────────────────────────────────────────────────────
  openFile:   () => ipcRenderer.invoke('file:open'),
  saveFile:   (content: string, filePath: string) =>
    ipcRenderer.invoke('file:save', content, filePath),
  saveFileAs: (content: string | number[], defaultName?: string, isBinary?: boolean) =>
    ipcRenderer.invoke('file:saveAs', content, defaultName, isBinary),

  // ── Local document persistence (offline fallback) ──────────────────
  localSave:   (doc: unknown) => ipcRenderer.invoke('file:localSave', doc),
  localLoad:   (id: string)   => ipcRenderer.invoke('file:localLoad', id),
  localList:   ()             => ipcRenderer.invoke('file:localList'),
  localDelete: (id: string)   => ipcRenderer.invoke('file:localDelete', id),

  // ── Settings ───────────────────────────────────────────────────────
  getSetting:    (key: string)               => ipcRenderer.invoke('settings:get', key),
  setSetting:    (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: ()                          => ipcRenderer.invoke('settings:getAll'),
})
