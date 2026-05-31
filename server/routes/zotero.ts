import { Router } from 'express'
import { getZoteroLibrary } from '../services/zoteroService'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'

export const zoteroRouter = Router()

// GET /api/v1/zotero/library?userId=...&apiKey=...
zoteroRouter.get('/library', requireAuth, async (req: AuthRequest, res) => {
  const { userId, apiKey } = req.query as { userId?: string; apiKey?: string }

  if (!userId || !apiKey) {
    res.status(400).json({ error: 'userId and apiKey query params are required' })
    return
  }

  try {
    const library = await getZoteroLibrary(userId, apiKey)
    res.json({ library })
  } catch (err: any) {
    console.error('[zotero/library]', err.message)
    res.status(500).json({ error: 'Zotero sync failed', detail: err.message })
  }
})
