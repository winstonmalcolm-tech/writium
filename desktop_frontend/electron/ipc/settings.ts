import { ipcMain } from 'electron'
import Store from 'electron-store'

interface AppSettings {
  theme: 'light' | 'dark'
  citationStyle: string
  fontSize: number
  geminiApiKey: string
  firecrawlApiKey: string
  zoteroApiKey: string
}

const store = new Store<AppSettings>({
  name: 'writium-settings',
  defaults: {
    theme: 'light',
    citationStyle: 'apa7',
    fontSize: 16,
    geminiApiKey: '',
    firecrawlApiKey: '',
    zoteroApiKey: '',
  },
})

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', (_event, key: keyof AppSettings) => {
    return store.get(key)
  })

  ipcMain.handle('settings:set', (_event, key: keyof AppSettings, value: unknown) => {
    store.set(key, value as AppSettings[typeof key])
  })

  ipcMain.handle('settings:getAll', () => {
    return store.store
  })
}
