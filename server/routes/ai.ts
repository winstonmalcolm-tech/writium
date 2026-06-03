import { Router } from 'express'
import { runAiCommand, chatWithAi } from '../services/gemini'
import { aiRateLimit } from '../middleware/rateLimit'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'
import type { AiCommand } from '../services/gemini'

export const aiRouter = Router()

// POST /api/v1/ai/command
// { command, text, context? }
aiRouter.post('/command', aiRateLimit, requireAuth, async (req: AuthRequest, res) => {
  const { command, text, context } = req.body as {
    command: AiCommand
    text: string
    context?: string
  }

  if (!command || !text?.trim()) {
    res.status(400).json({ error: 'command and text are required' })
    return
  }

  try {
    const result = await runAiCommand(command, text, context)
    res.json({ result })
  } catch (err: any) {
    console.error('[ai/command]', err.message)
    res.status(500).json({ error: 'AI request failed', detail: err.message })
  }
})

// POST /api/v1/ai/chat
// { messages: [{ role, content }] }
aiRouter.post('/chat', aiRateLimit, requireAuth, async (req: AuthRequest, res) => {
  const { messages, documentContext, documentTitle } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    documentContext?: string
    documentTitle?: string
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  try {
    const result = await chatWithAi(messages, documentContext, documentTitle)
    res.json({ result })
  } catch (err: any) {
    console.error('[ai/chat]', err.message)
    res.status(500).json({ error: 'AI chat failed', detail: err.message })
  }
})
