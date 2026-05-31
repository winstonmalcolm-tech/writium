import { Router } from 'express'
import axios from 'axios'
import { tfidfSimilarity, winnowingSimilarity, chunkText } from '../services/plagiarismEngine'
import { plagiarismRateLimit } from '../middleware/rateLimit'
import { requireAuth } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'

export const plagiarismRouter = Router()

interface TavilySource {
  url:     string
  title:   string
  content: string
}

async function searchTavily(query: string): Promise<TavilySource[]> {
  const key = process.env.TAVILY_API_KEY
  if (!key) return []

  try {
    const { data } = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key:             key,
        query,
        search_depth:        'basic',
        max_results:         8,
        include_raw_content: true,   // full page text — better similarity scoring
      },
      { timeout: 15_000 },
    )

    return ((data as any).results ?? [])
      .map((r: any) => ({
        url:     r.url     as string,
        title:   (r.title  as string | undefined) ?? r.url,
        // raw_content is the full extracted page text; fall back to the search snippet
        content: ((r.raw_content || r.content) as string | undefined) ?? '',
      }))
      .filter((s: TavilySource) => s.content.length > 50) as TavilySource[]
  } catch {
    return []
  }
}

// POST /api/v1/plagiarism/check
// { text, title?, citedUrls?, citedDois?, citedTitles? }
plagiarismRouter.post('/check', plagiarismRateLimit, requireAuth, async (req: AuthRequest, res) => {
  const { text, title, citedUrls = [], citedDois = [], citedTitles = [] } =
    req.body as { text?: string; title?: string; citedUrls?: string[]; citedDois?: string[]; citedTitles?: string[] }

  if (!text?.trim() || text.length < 100) {
    res.status(400).json({ error: 'text must be at least 100 characters' })
    return
  }

  try {
    const chunks = chunkText(text, 150)
    const query  = title ?? chunks[0]?.slice(0, 120) ?? text.slice(0, 120)

    const sources = await searchTavily(query)

    if (sources.length === 0) {
      res.json({
        matches:      [],
        overallScore: 0,
        mode:         'fingerprint-only',
        message:      'Add TAVILY_API_KEY to server/.env to enable web source comparison.',
      })
      return
    }

    const normalizeTitle = (t: string) =>
      t.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()

    function isCitedSource(url: string, sourceTitle: string): boolean {
      const urlLower = url.toLowerCase()

      // Exact or substring URL match (bidirectional)
      if (citedUrls.some(u => u && (url === u || urlLower.includes(u.toLowerCase()) || u.toLowerCase().includes(urlLower)))) return true

      for (const d of citedDois) {
        if (!d) continue
        // URL-encoded DOI
        if (urlLower.includes(encodeURIComponent(d).toLowerCase())) return true
        // Slash-encoded DOI variant
        if (urlLower.includes(d.replace('/', '%2F').toLowerCase())) return true
        // doi.org canonical URL
        if (urlLower.includes(`doi.org/${d.toLowerCase()}`)) return true
        // DOI suffix (registrant/suffix after "10.XXXX/") — journals often embed just the suffix
        const doiSuffix = d.split('/').slice(1).join('/').toLowerCase()
        if (doiSuffix.length > 4 && urlLower.includes(doiSuffix)) return true
      }

      // Title-based matching — the most reliable fallback when URL/DOI don't align
      if (citedTitles.length > 0) {
        const srcNorm = normalizeTitle(sourceTitle)
        for (const t of citedTitles) {
          if (!t) continue
          const citedNorm = normalizeTitle(t)
          // Exact normalised match
          if (srcNorm === citedNorm) return true
          // Substring match for titles longer than 30 chars (avoids short false positives)
          if (citedNorm.length >= 30 && (srcNorm.includes(citedNorm) || citedNorm.includes(srcNorm))) return true
        }
      }

      return false
    }

    const matches = sources
      .map(src => {
        const cited   = isCitedSource(src.url, src.title)
        const score   = Math.max(
          tfidfSimilarity(text, src.content),
          winnowingSimilarity(text, src.content) * 0.8,
        )
        const pct     = Math.min(100, Math.round(score * 100))
        const snippet = chunks.find(c => tfidfSimilarity(c, src.content) > 0.08) ?? text.slice(0, 200)

        return {
          sourceUrl:   src.url,
          sourceTitle: src.title,
          similarity:  pct,
          matchedText: snippet.slice(0, 220),
          isCited:     cited,
        }
      })
      .filter(m => m.similarity > 3)
      .sort((a, b) => {
        // Cited matches go to the bottom; uncited sorted by similarity desc
        if (a.isCited !== b.isCited) return a.isCited ? 1 : -1
        return b.similarity - a.similarity
      })

    // Overall score excludes cited sources
    const uncited      = matches.filter(m => !m.isCited)
    const overallScore = uncited.length ? Math.max(...uncited.map(m => m.similarity)) : 0

    res.json({ matches, overallScore, mode: 'full' })
  } catch (err: any) {
    console.error('[plagiarism/check]', err.message)
    res.status(500).json({ error: 'Plagiarism check failed', detail: err.message })
  }
})
