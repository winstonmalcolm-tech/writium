import { adminClient } from './supabaseAdmin'

const db = () => adminClient()

// ── References (saved library) ────────────────────────────────────────

export async function getLibrary(userId: string) {
  const { data, error } = await db()
    .from('references')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertReference(userId: string, ref: Record<string, unknown>) {
  const { data, error } = await db()
    .from('references')
    .upsert({ ...ref, user_id: userId }, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function removeReference(id: string, userId: string) {
  const { error } = await db()
    .from('references')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

// ── Citations ─────────────────────────────────────────────────────────

export async function getCitations(documentId: string) {
  const { data, error } = await db()
    .from('citations')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function saveCitation(citation: {
  document_id: string
  reference_id: string
  position:     number
  style:        string
}) {
  const { data, error } = await db()
    .from('citations')
    .insert(citation)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as { id: string; document_id: string; reference_id: string; position: number; style: string }
}

export async function removeCitation(id: string) {
  const { error } = await db()
    .from('citations')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
