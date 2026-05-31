import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'
import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../services/documentsService'

export const documentsRouter = Router()

// GET /api/v1/documents
documentsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const docs = await listDocuments(req.user!.id)
    res.json({ documents: docs })
  } catch (err: any) {
    console.error('[documents/list]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/v1/documents/:id
documentsRouter.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const doc = await getDocument(req.params.id, req.user!.id)
    res.json({ document: doc })
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// POST /api/v1/documents
documentsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title } = req.body as { title?: string }
  try {
    const doc = await createDocument(req.user!.id, title ?? 'Untitled Document')
    res.status(201).json({ document: doc })
  } catch (err: any) {
    console.error('[documents/create]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/v1/documents/:id
documentsRouter.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { title, content_json } = req.body as { title?: string; content_json?: unknown }
  try {
    const doc = await updateDocument(req.params.id, req.user!.id, title ?? 'Untitled Document', content_json)
    res.json({ document: doc })
  } catch (err: any) {
    console.error('[documents/update]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/v1/documents/:id
documentsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await deleteDocument(req.params.id, req.user!.id)
    res.json({ ok: true })
  } catch (err: any) {
    console.error('[documents/delete]', err.message)
    res.status(500).json({ error: err.message })
  }
})
