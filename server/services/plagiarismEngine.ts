// Stage 1 — Winnowing fingerprinting (fast, no network)
// Stage 2 — TF-IDF cosine similarity against fetched web sources

// ── Winnowing ────────────────────────────────────────────────────────

function normalise(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
}

function kgrams(text: string, k = 5): string[] {
  const t = normalise(text)
  const out: string[] = []
  for (let i = 0; i <= t.length - k; i++) out.push(t.slice(i, i + k))
  return out
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h >>> 0
}

function winnow(text: string, k = 5, w = 4): Set<number> {
  const hashes = kgrams(text, k).map(hash)
  const fp = new Set<number>()
  for (let i = 0; i <= hashes.length - w; i++) {
    fp.add(Math.min(...hashes.slice(i, i + w)))
  }
  return fp
}

export function winnowingSimilarity(a: string, b: string): number {
  const fa = winnow(a)
  const fb = winnow(b)
  if (!fa.size || !fb.size) return 0
  let shared = 0
  for (const f of fa) if (fb.has(f)) shared++
  return shared / Math.min(fa.size, fb.size)
}

// ── TF-IDF cosine similarity ─────────────────────────────────────────

function tokenise(text: string): string[] {
  return normalise(text).split(/\s+/).filter(w => w.length > 2)
}

function tf(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of tokens) map.set(t, (map.get(t) ?? 0) + 1)
  for (const [k, v] of map) map.set(k, v / tokens.length)
  return map
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0
  for (const [k, v] of a) { dot += v * (b.get(k) ?? 0); na += v * v }
  for (const [, v] of b) nb += v * v
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  return denom ? dot / denom : 0
}

export function tfidfSimilarity(doc: string, source: string): number {
  const td = tokenise(doc)
  const ts = tokenise(source)
  if (!td.length || !ts.length) return 0
  return cosine(tf(td), tf(ts))
}

// ── Chunking ─────────────────────────────────────────────────────────

export function chunkText(text: string, wordsPerChunk = 150): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ')
    if (chunk.length > 60) chunks.push(chunk)
  }
  return chunks
}
