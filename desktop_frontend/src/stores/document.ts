import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface LoadRequest {
  id: string
  title: string
  contentJson: unknown
}

export const useDocumentStore = defineStore('document', () => {
  const id          = ref('') // empty until first doc is loaded/created
  const title       = ref('Untitled Document')
  const content     = ref<unknown>(null)
  const isDirty     = ref(false)
  const wordCount   = ref(0)
  const charCount   = ref(0)
  const lastSaved   = ref<Date | null>(null)
  const isSaving    = ref(false)
  const isSynced    = ref(false) // true once backed by a real Supabase row

  // Signal for EditorView to load a document into the TipTap instance
  const loadRequest = ref<LoadRequest | null>(null)

  const saveStatus = computed(() => {
    if (isSaving.value) return 'Saving…'
    if (isDirty.value) return lastSaved.value ? 'Unsaved changes' : 'Unsaved'
    return lastSaved.value ? 'Saved' : ''
  })

  function setContent(c: unknown) {
    content.value = c
    isDirty.value = true
  }

  function setTitle(t: string) {
    title.value = t || 'Untitled Document'
    isDirty.value = true
    document.title = `${title.value} — Writium`
  }

  function updateCounts(words: number, chars: number) {
    wordCount.value = words
    charCount.value = chars
  }

  function markSaved() {
    isDirty.value  = false
    lastSaved.value = new Date()
  }

  function requestLoad(req: LoadRequest) {
    loadRequest.value = req
  }

  return {
    id, title, content, isDirty, wordCount, charCount,
    lastSaved, isSaving, isSynced, saveStatus, loadRequest,
    setContent, setTitle, updateCounts, markSaved, requestLoad,
  }
})
