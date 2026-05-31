import axios from 'axios'

const UA      = 'Mozilla/5.0 (compatible; Writium/0.1)'
const TIMEOUT = 12_000

// ── Tavily Extract ────────────────────────────────────────────────────────────
// Sends one or more URLs to Tavily and returns clean extracted text.
// Returns null if the key is absent or the request fails.

async function tavilyExtract(url: string): Promise<string | null> {
  const key = process.env.TAVILY_API_KEY
  if (!key) return null
  try {
    const { data } = await axios.post(
      'https://api.tavily.com/extract',
      { api_key: key, urls: [url] },
      { timeout: TIMEOUT },
    )
    return (data.results?.[0]?.raw_content as string | undefined) ?? null
  } catch {
    return null
  }
}

// ── Lightweight HTML head fetch ───────────────────────────────────────────────
// Fetches just enough of the page to read <head> meta tags — no DOM library needed.

async function fetchHtmlHead(url: string): Promise<string | null> {
  try {
    const { data } = await axios.get<string>(url, {
      timeout: TIMEOUT,
      maxContentLength: 200_000,
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      responseType: 'text',
    })
    const end = (data as string).indexOf('</head>')
    return end !== -1 ? (data as string).slice(0, end + 7) : (data as string).slice(0, 5_000)
  } catch {
    return null
  }
}

// Returns the content attribute of a meta tag matching any of the given name/property values.
function metaContent(html: string, ...names: string[]): string {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m =
      html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["']`, 'i'))
    if (m?.[1]) return decodeHtmlEntities(m[1].trim())
  }
  return ''
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function extractTextFromUrl(url: string): Promise<string | null> {
  // Prefer Tavily — handles JS-rendered pages and returns clean prose
  const tavily = await tavilyExtract(url)
  if (tavily) return tavily

  // Fallback: plain HTTP fetch, strip HTML tags
  try {
    const { data } = await axios.get<string>(url, {
      timeout: TIMEOUT,
      maxContentLength: 5 * 1024 * 1024,
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      responseType: 'text',
    })
    return (data as string)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10_000)
  } catch {
    return null
  }
}

export async function extractMetadataFromUrl(url: string) {
  // Fetch HTML head (for meta tags) and Tavily text content in parallel
  const [html, textContent] = await Promise.all([
    fetchHtmlHead(url),
    tavilyExtract(url),
  ])

  if (!html) return null

  const ogTitle    = metaContent(html, 'og:title')
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title      = ogTitle || decodeHtmlEntities(titleMatch?.[1]?.trim() ?? '') || url

  const description =
    metaContent(html, 'og:description', 'description') ||
    textContent?.slice(0, 300) ||
    ''

  const siteName =
    metaContent(html, 'og:site_name') ||
    new URL(url).hostname.replace(/^www\./, '')

  const authors = [
    metaContent(html, 'author', 'og:author', 'article:author'),
  ].filter(Boolean)

  const dateStr = metaContent(html, 'article:published_time', 'datePublished', 'og:published_time', 'date')
  const year    = dateStr ? (new Date(dateStr).getFullYear() || 0) : 0

  return {
    id:          `web-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    authors,
    description,
    siteName,
    url,
    year,
    type: 'web' as const,
  }
}
