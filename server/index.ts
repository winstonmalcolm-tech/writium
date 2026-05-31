// Must be the very first import — sets process.env before any other module loads
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { aiRouter } from './routes/ai'
import { referencesRouter } from './routes/references'
import { plagiarismRouter } from './routes/plagiarism'
import { zoteroRouter } from './routes/zotero'
import { documentsRouter } from './routes/documents'
import { libraryRouter } from './routes/library'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(helmet())
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/references', referencesRouter)
app.use('/api/v1/plagiarism', plagiarismRouter)
app.use('/api/v1/zotero', zoteroRouter)
app.use('/api/v1/documents', documentsRouter)
app.use('/api/v1/library', libraryRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Writium server → http://localhost:${PORT}`)
})

export default app
