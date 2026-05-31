import { Router } from 'express'
import axios from 'axios'
import { searchSemanticScholar } from '../services/semanticScholar'
import { searchOpenAlex } from '../services/openAlex'
import { searchCrossref, fetchByDoi } from '../services/crossref'
import { extractMetadataFromUrl } from '../services/webReader'
import { referenceRateLimit } from '../middleware/rateLimit'

export const referencesRouter = Router()

// GET /api/v1/references/search?q=...&source=all|semantic|openalex|crossref
referencesRouter.get('/search', referenceRateLimit, async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim()
  const source = (req.query.source as string) || 'all'

  if (!q) {
    res.status(400).json({ error: 'Query parameter q is required' })
    return
  }

  try {
    let results: any[]

    if (source === 'semantic') {
      results = await searchSemanticScholar(q)
    } else if (source === 'openalex') {
      results = await searchOpenAlex(q)
    } else if (source === 'crossref') {
      results = await searchCrossref(q)
    } else {
      // All sources in parallel — merge and deduplicate
      const [ss, oa, cr] = await Promise.allSettled([
        searchSemanticScholar(q, 20),
        searchOpenAlex(q, 20),
        searchCrossref(q, 20),
      ])

      const all = [
        ...(ss.status === 'fulfilled' ? ss.value : []),
        ...(oa.status === 'fulfilled' ? oa.value : []),
        ...(cr.status === 'fulfilled' ? cr.value : []),
      ]

      const seen = new Set<string>()
      results = all.filter(r => {
        const key = (r.doi as string | undefined) ?? r.title.toLowerCase().slice(0, 40)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    res.json({ results })
  } catch (err: any) {
    console.error('[references/search]', err.message)
    res.status(500).json({ error: 'Search failed', detail: err.message })
  }
})

// GET /api/v1/references/doi?doi=10.1145/3571730
referencesRouter.get('/doi', referenceRateLimit, async (req, res) => {
  const doi = (req.query.doi as string | undefined)?.trim()
  if (!doi) {
    res.status(400).json({ error: 'doi query parameter is required' })
    return
  }
  try {
    const result = await fetchByDoi(doi)
    res.json({ result })
  } catch (err: any) {
    res.status(404).json({ error: 'DOI not found', detail: err.message })
  }
})

// GET /api/v1/references/content?url=...  — returns first 1 500 chars of page text
referencesRouter.get('/content', referenceRateLimit, async (req, res) => {
  const url = (req.query.url as string | undefined)?.trim()
  if (!url) {
    res.status(400).json({ error: 'url query parameter is required' })
    return
  }
  try {
    const text = await extractTextFromUrl(url)
    res.json({ content: text ? text.slice(0, 1_500) : '' })
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch content', detail: err.message })
  }
})

// POST /api/v1/references/url
// { url }
referencesRouter.post('/url', referenceRateLimit, async (req, res) => {
  const { url } = req.body as { url?: string }
  if (!url) {
    res.status(400).json({ error: 'url is required' })
    return
  }

  try {
    const result = await extractMetadataFromUrl(url)
    if (!result) {
      res.status(422).json({ error: 'Could not extract metadata from that URL' })
      return
    }
    res.json({ result })
  } catch (err: any) {
    res.status(500).json({ error: 'URL extraction failed', detail: err.message })
  }
})

// GET /api/v1/references/websearch?q=...
referencesRouter.get('/websearch', referenceRateLimit, async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim()
  if (!q) {
    res.status(400).json({ error: 'Query parameter q is required' })
    return
  }

  const key = process.env.TAVILY_API_KEY
  if (!key) {
    res.json({ results: [], noKey: true })
    return
  }

  try {
    const { data } = await axios.post(
      'https://api.tavily.com/search',
      { api_key: key, query: q, search_depth: 'basic', max_results: 12 },
      { timeout: 10_000 },
    )

    const results = ((data as any).results as any[]).map((r: any) => {
      const dateStr = r.published_date as string | undefined
      const year = dateStr ? (new Date(dateStr).getFullYear() || 0) : 0
      return {
        id:       `web-${Buffer.from(r.url).toString('base64').slice(0, 12)}`,
        title:    r.title as string,
        authors:  [] as string[],
        year,
        journal:  new URL(r.url).hostname.replace(/^www\./, ''),
        abstract: r.content as string,
        url:      r.url as string,
        type:     'web' as const,
      }
    })

    res.json({ results })
  } catch (err: any) {
    console.error('[references/websearch]', err.message)
    res.status(500).json({ error: 'Web search failed', detail: err.message })
  }
})
