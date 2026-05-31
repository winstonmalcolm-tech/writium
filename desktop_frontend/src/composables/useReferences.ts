import { useReferencesStore } from '@/stores/references'
import { apiFetch } from '@/utils/api'
import type { Reference } from '@/types'

export function useReferences() {
  const store = useReferencesStore()

  // ── Academic / web search ─────────────────────────────────────────

  async function searchReferences(query: string): Promise<Reference[]> {
    if (!query.trim()) return []
    const data = await apiFetch<{ results: Reference[] }>(`/references/search?q=${encodeURIComponent(query)}`)
    return data.results
  }

  async function searchWeb(query: string): Promise<{ results: Reference[]; noKey: boolean }> {
    if (!query.trim()) return { results: [], noKey: false }
    const data = await apiFetch<{ results: Reference[]; noKey?: boolean }>(
      `/references/websearch?q=${encodeURIComponent(query)}`,
    )
    return { results: data.results, noKey: !!data.noKey }
  }

  async function fetchByDoi(doi: string): Promise<Reference | null> {
    try {
      const data = await apiFetch<{ result: Reference }>(`/references/doi?doi=${encodeURIComponent(doi)}`)
      return data.result
    } catch { return null }
  }

  async function fetchByUrl(url: string): Promise<Reference | null> {
    try {
      const data = await apiFetch<{ result: Reference }>('/references/url', {
        method: 'POST',
        body: JSON.stringify({ url }),
      })
      return data.result
    } catch { return null }
  }

  // ── Persisted library ─────────────────────────────────────────────

  async function loadLibrary(): Promise<void> {
    try {
      const data = await apiFetch<{ references: Reference[] }>('/library/references')
      store.library = data.references
    } catch {
      // server unavailable — keep whatever is in memory
    }
  }

  async function addToLibrary(ref: Reference): Promise<void> {
    // Optimistic update first
    if (!store.library.find(r => r.id === ref.id)) store.library.push(ref)
    try {
      await apiFetch('/library/references', {
        method: 'POST',
        body: JSON.stringify(ref),
      })
    } catch {
      // stay in memory even if persist fails
    }
  }

  async function removeFromLibrary(id: string): Promise<void> {
    store.library = store.library.filter(r => r.id !== id)
    try {
      await apiFetch(`/library/references/${encodeURIComponent(id)}`, { method: 'DELETE' })
    } catch {}
  }

  return {
    library: store.library,
    loadLibrary,
    searchReferences,
    searchWeb,
    fetchByDoi,
    fetchByUrl,
    addToLibrary,
    removeFromLibrary,
  }
}
