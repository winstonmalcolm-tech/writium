import { apiFetch } from '@/utils/api'
import { useDocumentStore } from '@/stores/document'
import { useReferencesStore } from '@/stores/references'
import { useReferences } from './useReferences'
import { useCitations } from './useCitations'
import type { LocalDoc } from '@/types/electron'

export interface DocSummary {
  id: string
  title: string
  updated_at: string
}

export interface DocFull extends DocSummary {
  content_json: unknown
}

// ── helpers ──────────────────────────────────────────────────────────────────

function localSave(doc: LocalDoc) {
  return window.electronAPI?.localSave(doc) ?? Promise.resolve(false)
}

function toLocalDoc(doc: DocFull): LocalDoc {
  return {
    id:           doc.id,
    title:        doc.title,
    content_json: doc.content_json,
    updated_at:   doc.updated_at ?? new Date().toISOString(),
  }
}

// ── composable ───────────────────────────────────────────────────────────────

export function useDocuments() {
  const docStore   = useDocumentStore()
  const refStore   = useReferencesStore()
  const references = useReferences()
  const citations  = useCitations()

  // List documents — Supabase first, local files as fallback
  async function listDocuments(): Promise<DocSummary[]> {
    try {
      const data = await apiFetch<{ documents: DocSummary[] }>('/documents')
      return data.documents
    } catch {
      const local = await window.electronAPI?.localList() ?? []
      return local
    }
  }

  // Create document — Supabase first; if offline, create a local-only doc
  async function createDocument(title = 'Untitled Document'): Promise<DocFull> {
    try {
      const data = await apiFetch<{ document: DocFull }>('/documents', {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      const doc = data.document
      // Mirror to local immediately
      await localSave(toLocalDoc(doc))
      return doc
    } catch {
      // Offline — generate a local ID
      const doc: DocFull = {
        id:           `local-${Date.now()}`,
        title,
        content_json: null,
        updated_at:   new Date().toISOString(),
      }
      await localSave(toLocalDoc(doc))
      return doc
    }
  }

  // Load a document into the editor — Supabase first, then local file
  async function loadDocument(id: string): Promise<void> {
    let doc: DocFull | null = null

    try {
      const data = await apiFetch<{ document: DocFull }>(`/documents/${id}`)
      doc = data.document
      docStore.isSynced = true
      // Keep local copy fresh
      await localSave(toLocalDoc(doc))
    } catch {
      // Supabase unreachable — try local file
      const local = await window.electronAPI?.localLoad(id) ?? null
      if (!local) throw new Error(`Document ${id} not found locally or remotely`)
      doc = { ...local }
      docStore.isSynced = false
    }

    docStore.requestLoad({ id: doc.id, title: doc.title, contentJson: doc.content_json })

    await Promise.all([
      citations.loadCitations(doc.id),
      references.loadLibrary(),
    ])
  }

  // Save — always write local file first, then sync to Supabase when connected
  async function saveDocument(id: string, title: string, contentJson: unknown): Promise<void> {
    docStore.isSaving = true
    const updatedAt = new Date().toISOString()

    try {
      // 1. Local file — always, works offline
      await localSave({ id, title, content_json: contentJson, updated_at: updatedAt })

      // 2. Supabase — only if this doc lives there
      if (docStore.isSynced) {
        await apiFetch(`/documents/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ title, content_json: contentJson }),
        })
      }

      docStore.markSaved()
    } catch (err) {
      // Supabase failed but local save already succeeded — still saved
      docStore.markSaved()
    } finally {
      docStore.isSaving = false
    }
  }

  async function deleteDocument(id: string): Promise<void> {
    await Promise.allSettled([
      apiFetch(`/documents/${id}`, { method: 'DELETE' }),
      window.electronAPI?.localDelete(id),
    ])
  }

  async function renameDocument(id: string, title: string): Promise<void> {
    const contentJson = id === docStore.id ? docStore.content : null
    await Promise.allSettled([
      apiFetch(`/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content_json: contentJson }),
      }),
      localSave({ id, title, content_json: contentJson, updated_at: new Date().toISOString() }),
    ])
  }

  return { listDocuments, createDocument, loadDocument, saveDocument, deleteDocument, renameDocument }
}
