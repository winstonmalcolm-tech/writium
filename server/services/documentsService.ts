import { adminClient } from './supabaseAdmin'

function db() {
  return adminClient()
}

export interface DocRow {
  id: string
  user_id: string
  title: string
  content_json: unknown
  updated_at: string
}

export async function listDocuments(userId: string): Promise<DocRow[]> {
  const { data, error } = await db()
    .from('documents')
    .select('id, user_id, title, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data ?? []) as DocRow[]
}

export async function getDocument(id: string, userId: string): Promise<DocRow> {
  const { data, error } = await db()
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) throw new Error(error.message)
  return data as DocRow
}

export async function createDocument(userId: string, title: string): Promise<DocRow> {
  const { data, error } = await db()
    .from('documents')
    .insert({ user_id: userId, title, content_json: null, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as DocRow
}

export async function updateDocument(
  id: string,
  userId: string,
  title: string,
  contentJson: unknown,
): Promise<DocRow> {
  const { data, error } = await db()
    .from('documents')
    .update({ title, content_json: contentJson, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as DocRow
}

export async function deleteDocument(id: string, userId: string): Promise<void> {
  const { error } = await db()
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}
