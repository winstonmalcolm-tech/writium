export interface LocalDoc {
  id:           string
  title:        string
  content_json: unknown
  updated_at:   string
}

export interface LocalDocSummary {
  id:         string
  title:      string
  updated_at: string
}

export interface ElectronAPI {
  // Window controls
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizeChange: (cb: (maximized: boolean) => void) => void

  // File system (explicit open/save dialogs)
  openFile:   () => Promise<{ content: string; filePath: string; ext: string } | null>
  saveFile:   (content: string, filePath: string) => Promise<boolean>
  saveFileAs: (content: string | number[], defaultName?: string, isBinary?: boolean) => Promise<string | null>

  // Local document persistence — userData/documents/{id}.json
  localSave:   (doc: LocalDoc)     => Promise<boolean>
  localLoad:   (id: string)        => Promise<LocalDoc | null>
  localList:   ()                  => Promise<LocalDocSummary[]>
  localDelete: (id: string)        => Promise<boolean>

  // Settings
  getSetting:     (key: string)                => Promise<unknown>
  setSetting:     (key: string, value: unknown) => Promise<void>
  getAllSettings: ()                            => Promise<Record<string, unknown>>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
