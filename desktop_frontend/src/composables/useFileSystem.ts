import { useDocumentStore } from '@/stores/document'
import { useMessage } from 'naive-ui'

export function useFileSystem() {
  const docStore = useDocumentStore()
  const message = useMessage()

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI

  async function openFile() {
    if (!isElectron || !window.electronAPI) {
      message.warning('File open is only available in the desktop app')
      return
    }

    const result = await window.electronAPI.openFile()
    if (!result) return

    if ((result as any).error) {
      message.error((result as any).error)
      return
    }

    const name = result.filePath.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, '') ?? 'Untitled'

    // Use requestLoad so EditorView's watcher picks it up and calls
    // editor.commands.setContent() — TipTap accepts both HTML strings and JSON.
    docStore.requestLoad({ id: docStore.id || 'local-import', title: name, contentJson: result.content })
    // Local file — disable Supabase auto-save until user explicitly saves
    docStore.isSynced = false
    message.success(`Opened "${name}"`)
  }

  async function saveFileAs() {
    if (!isElectron || !window.electronAPI) {
      message.warning('File save is only available in the desktop app')
      return
    }

    try {
      const { exportToDocx } = await import('@/utils/docxExporter')
      const bytes     = await exportToDocx(docStore.content)
      const savedPath = await window.electronAPI.saveFileAs(
        Array.from(bytes),
        `${docStore.title}.docx`,
        true,
      )
      if (savedPath) {
        docStore.markSaved()
        message.success('Document saved')
      }
    } catch (err: any) {
      message.error(`Export failed: ${err.message ?? err}`)
    }
  }

  return { isElectron, openFile, saveFileAs }
}
