import axios from 'axios'

const BASE = 'https://api.semanticscholar.org/graph/v1'
const FIELDS = 'title,authors,year,abstract,venue,externalIds,openAccessPdf'

export async function searchSemanticScholar(query: string, limit = 8) {
  const { data } = await axios.get(`${BASE}/paper/search`, {
    params: { query, fields: FIELDS, limit },
    timeout: 10_000,
    headers: { 'User-Agent': 'Writium/0.1' },
  })

  return ((data as any).data as any[]).map((p: any) => ({
    id: `ss-${p.paperId}`,
    title: p.title as string,
    authors: ((p.authors ?? []) as any[]).map((a: any) => a.name as string),
    year: (p.year as number | null) ?? 0,
    journal: (p.venue as string | null) ?? undefined,
    doi: (p.externalIds?.DOI as string | undefined),
    abstract: (p.abstract as string | null) ?? undefined,
    type: 'journal' as const,
    url: (p.openAccessPdf?.url as string | undefined),
  }))
}
