import axios from 'axios'

const BASE = 'https://api.zotero.org'

export async function getZoteroLibrary(userId: string, apiKey: string, limit = 50) {
  const { data } = await axios.get(`${BASE}/users/${userId}/items`, {
    params: { limit, format: 'json', itemType: '-attachment' },
    headers: { 'Zotero-API-Key': apiKey },
    timeout: 10_000,
  })

  return (data as any[]).map((item: any) => {
    const d = item.data
    return {
      id: `zot-${item.key as string}`,
      title: (d.title as string | undefined) ?? 'Untitled',
      authors: ((d.creators ?? []) as any[])
        .filter((c: any) => c.creatorType === 'author')
        .map((c: any) =>
          `${(c.lastName as string) ?? ''}${c.firstName ? ', ' + (c.firstName as string) : ''}`.trim()
        )
        .filter(Boolean),
      year: d.date ? parseInt(d.date as string) || 0 : 0,
      journal: (d.publicationTitle as string | undefined) ?? (d.publisher as string | undefined),
      doi: (d.DOI as string | undefined) ?? undefined,
      abstract: (d.abstractNote as string | undefined) ?? undefined,
      type: (d.itemType === 'book' ? 'book' : 'journal') as 'journal' | 'book',
    }
  })
}
