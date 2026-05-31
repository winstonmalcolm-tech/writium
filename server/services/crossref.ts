import axios from 'axios'

const BASE = 'https://api.crossref.org'
const HEADERS = { 'User-Agent': 'Writium/0.1 (mailto:support@writium.app)' }

function mapItem(item: any) {
  return {
    id: `cr-${(item.DOI as string | undefined)?.replace(/[^a-z0-9]/gi, '-') ?? Date.now()}`,
    title: Array.isArray(item.title) ? (item.title[0] as string) : ((item.title as string) ?? 'Untitled'),
    authors: ((item.author ?? []) as any[])
      .map((a: any) => `${(a.family as string) ?? ''}${a.given ? ', ' + (a.given as string) : ''}`.trim())
      .filter(Boolean),
    year: (item.published?.['date-parts'] as number[][] | undefined)?.[0]?.[0] ?? 0,
    journal: Array.isArray(item['container-title'])
      ? (item['container-title'][0] as string | undefined)
      : undefined,
    doi: item.DOI as string | undefined,
    abstract: (item.abstract as string | undefined)?.replace(/<\/?[^>]+(>|$)/g, '') ?? undefined,
    type: 'journal' as const,
  }
}

export async function searchCrossref(query: string, limit = 8) {
  const { data } = await axios.get(`${BASE}/works`, {
    params: { query, rows: limit, select: 'DOI,title,author,published,container-title,abstract' },
    timeout: 10_000,
    headers: HEADERS,
  })
  return ((data as any).message.items as any[]).map(mapItem)
}

export async function fetchByDoi(doi: string) {
  const { data } = await axios.get(`${BASE}/works/${encodeURIComponent(doi)}`, {
    timeout: 10_000,
    headers: HEADERS,
  })
  return mapItem((data as any).message)
}
