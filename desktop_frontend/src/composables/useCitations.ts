import { useEditorInstance } from './useEditorInstance'
import { useReferencesStore } from '@/stores/references'
import { useSettingsStore } from '@/stores/settings'
import { useDocumentStore } from '@/stores/document'
import { formatInlineCitation } from '@/utils/citationFormatter'
import { apiFetch } from '@/utils/api'
import type { Reference, Citation } from '@/types'

export function useCitations() {
  const editor   = useEditorInstance()
  const refStore = useReferencesStore()
  const settings = useSettingsStore()
  const docStore = useDocumentStore()

  async function loadCitations(documentId: string): Promise<void> {
    try {
      const data = await apiFetch<{ citations: Array<{
        id: string; document_id: string; reference_id: string; position: number; style: string
      }> }>(`/library/citations?documentId=${documentId}`)

      refStore.citations = data.citations.map(c => ({
        id:          c.id,
        referenceId: c.reference_id,
        documentId:  c.document_id,
        position:    c.position,
        style:       c.style as Citation['style'],
      }))
    } catch {
      refStore.citations = []
    }
  }

  async function insertCitation(reference: Reference): Promise<void> {
    if (!editor?.value) return
    const inlineText = formatInlineCitation(reference, settings.citationStyle)
    editor.value.chain().focus().insertContent(inlineText).run()
    await recordCitation(reference)
  }

  // Record a citation without inserting text (used when text is inserted externally)
  async function recordCitation(reference: Reference): Promise<void> {
    await persistAddToLibrary(reference)

    const citation: Citation = {
      id:          `cit-${Date.now()}`,
      referenceId: reference.id,
      documentId:  docStore.id,
      position:    editor?.value?.state.selection.from ?? 0,
      style:       settings.citationStyle,
    }

    refStore.addCitation(citation)

    if (docStore.isSynced && docStore.id) {
      try {
        const data = await apiFetch<{ citation: { id: string } }>('/library/citations', {
          method: 'POST',
          body: JSON.stringify({
            document_id:  docStore.id,
            reference_id: reference.id,
            position:     citation.position,
            style:        citation.style,
          }),
        })
        const idx = refStore.citations.findIndex(c => c.id === citation.id)
        if (idx !== -1) refStore.citations[idx].id = data.citation.id
      } catch {}
    }
  }

  return { insertCitation, recordCitation, loadCitations }
}

// Helper — mirrors useReferences.addToLibrary without creating a circular dep
async function persistAddToLibrary(ref: Reference): Promise<void> {
  try {
    await apiFetch('/library/references', {
      method: 'POST',
      body: JSON.stringify(ref),
    })
  } catch {}
}
