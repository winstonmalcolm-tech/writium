import type { Request, Response, NextFunction } from 'express'
import { adminClient } from '../services/supabaseAdmin'

export interface AuthRequest extends Request {
  user?: { id: string; email?: string }
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Dev bypass — set BYPASS_AUTH=true in server/.env to skip Supabase JWT checks
  if (process.env.BYPASS_AUTH === 'true') {
    req.user = { id: 'dev-user', email: 'dev@localhost' }
    next()
    return
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Bearer token' })
    return
  }

  const token = header.slice(7)
  const { data: { user }, error } = await adminClient().auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.user = { id: user.id, email: user.email ?? undefined }
  next()
}
