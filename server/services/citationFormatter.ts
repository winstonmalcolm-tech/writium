// Basic citation formatter — returns inline badge text and bibliography entries.
// Full CSL rendering via citation-js will replace this in a later phase.

export type CitationStyle =
  | 'apa7' | 'apa6'
  | 'mla9' | 'mla8'
  | 'chicago-nb' | 'chicago-ad'
  | 'harvard' | 'ieee'

export interface RefInput {
  authors: string[]
  year: number
  title: string
  journal?: string
  doi?: string
  volume?: string
  issue?: string
  pages?: string
  publisher?: string
}

function lastName(author: string): string {
  if (author.includes(',')) return author.split(',')[0]!.trim()
  const parts = author.trim().split(' ')
  return parts.at(-1) ?? author
}

function authorSummary(authors: string[], style: CitationStyle): string {
  if (!authors.length) return 'Anonymous'
  const first = lastName(authors[0]!)
  if (authors.length === 1) return first
  const second = lastName(authors[1]!)
  if (authors.length === 2) {
    return style.startsWith('mla') ? `${first} and ${second}` : `${first} & ${second}`
  }
  return `${first} et al.`
}

export function formatInlineCitation(ref: RefInput, style: CitationStyle): string {
  const s = authorSummary(ref.authors, style)
  switch (style) {
    case 'apa7': case 'apa6': case 'harvard': return `(${s}, ${ref.year})`
    case 'mla9': case 'mla8': return `(${s} ${ref.year})`
    case 'chicago-ad': return `(${s} ${ref.year})`
    case 'chicago-nb': return `[footnote]`
    case 'ieee': return `[n]`
    default: return `(${s}, ${ref.year})`
  }
}

export function formatBibEntry(ref: RefInput, style: CitationStyle): string {
  const authors = ref.authors.join(', ')
  const doi = ref.doi ? ` https://doi.org/${ref.doi}` : ''
  switch (style) {
    case 'apa7':
    case 'apa6':
      return `${authors} (${ref.year}). ${ref.title}. ${ref.journal ? `*${ref.journal}*${ref.volume ? `, *${ref.volume}*` : ''}${ref.issue ? `(${ref.issue})` : ''}${ref.pages ? `, ${ref.pages}` : ''}.` : ''}${doi}`
    case 'mla9':
    case 'mla8':
      return `${authors}. "${ref.title}." ${ref.journal ? `*${ref.journal}*, ` : ''}${ref.year}.${doi}`
    case 'chicago-nb':
    case 'chicago-ad':
      return `${authors}. "${ref.title}." ${ref.journal ? `*${ref.journal}* ` : ''}(${ref.year}).${doi}`
    default:
      return `${authors} (${ref.year}). ${ref.title}. ${ref.journal ?? ''}.`
  }
}
