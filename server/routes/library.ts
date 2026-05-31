import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'
import {
  getLibrary, upsertReference, removeReference,
  getCitations, saveCitation, removeCitation,
} from '../services/libraryService'

export const libraryRouter = Router()

// ── Reference library ─────────────────────────────────────────────────

// GET /api/v1/library/references
libraryRouter.get('/references', requireAuth, async (req: AuthRequest, res) => {
  try {
    const refs = await getLibrary(req.user!.id)
    res.json({ references: refs })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/v1/library/references  — upsert (add or update)
libraryRouter.post('/references', requireAuth, async (req: AuthRequest, res) => {
  try {
    const ref = await upsertReference(req.user!.id, req.body)
    res.status(201).json({ reference: ref })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/v1/library/references/:id
libraryRouter.delete('/references/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await removeReference(req.params.id, req.user!.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ── Citations ─────────────────────────────────────────────────────────

// GET /api/v1/library/citations?documentId=...
libraryRouter.get('/citations', requireAuth, async (req: AuthRequest, res) => {
  const documentId = req.query.documentId as string | undefined
  if (!documentId) {
    res.status(400).json({ error: 'documentId query param is required' })
    return
  }
  try {
    const citations = await getCitations(documentId)
    res.json({ citations })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/v1/library/citations
libraryRouter.post('/citations', requireAuth, async (req: AuthRequest, res) => {
  const { document_id, reference_id, position, style } = req.body
  if (!document_id || !reference_id) {
    res.status(400).json({ error: 'document_id and reference_id are required' })
    return
  }
  try {
    const citation = await saveCitation({ document_id, reference_id, position: position ?? 0, style: style ?? 'apa7' })
    res.status(201).json({ citation })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/v1/library/citations/:id
libraryRouter.delete('/citations/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await removeCitation(req.params.id)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
