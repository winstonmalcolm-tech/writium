import axios from 'axios'

const BASE = 'https://api.openalex.org/works'

export async function searchOpenAlex(query: string, limit = 8) {
  const { data } = await axios.get(BASE, {
    params: {
      search: query,
      per_page: limit,
      select: 'id,title,authorships,publication_year,primary_location,doi,abstract_inverted_index',
    },
    timeout: 10_000,
    headers: { 'User-Agent': 'Writium/0.1 (mailto:support@writium.app)' },
  })

  return ((data as any).results as any[]).map((w: any) => {
    // Reconstruct abstract from inverted index
    let abstract: string | undefined
    const inv = w.abstract_inverted_index as Record<string, number[]> | null
    if (inv) {
      const words: string[] = []
      for (const [word, positions] of Object.entries(inv)) {
        for (const pos of positions) words[pos] = word
      }
      abstract = words.filter(Boolean).join(' ')
    }

    return {
      id: `oa-${(w.id as string)?.split('/').pop()}`,
      title: (w.title as string | null) ?? 'Untitled',
      authors: ((w.authorships ?? []) as any[])
        .map((a: any) => a.author?.display_name as string)
        .filter(Boolean),
      year: (w.publication_year as number | null) ?? 0,
      journal: w.primary_location?.source?.display_name as string | undefined,
      doi: (w.doi as string | null)?.replace('https://doi.org/', '') ?? undefined,
      abstract,
      type: 'journal' as const,
    }
  })
}
