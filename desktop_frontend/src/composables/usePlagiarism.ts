import { computed } from 'vue'
import { usePlagiarismStore } from '@/stores/plagiarism'
import { apiFetch } from '@/utils/api'

interface PlagiarismResponse {
  matches: Array<{
    sourceUrl:   string
    sourceTitle: string
    similarity:  number
    matchedText: string
    isCited?:    boolean
  }>
  overallScore: number
  mode: 'full' | 'fingerprint-only'
  message?: string
}

export function usePlagiarism() {
  const store = usePlagiarismStore()

  interface CitedRefs { citedUrls: string[]; citedDois: string[]; citedTitles: string[] }

  async function runCheck(text: string, title?: string, cited: CitedRefs = { citedUrls: [], citedDois: [], citedTitles: [] }) {
    store.startCheck()
    store.setProgress(5)

    // Simulate progress while Tavily fetches and scores (typically 5–15 s)
    let pct = 5
    const ticker = setInterval(() => {
      if (pct < 85) {
        pct += pct < 30 ? 8 : pct < 60 ? 5 : 2
        store.setProgress(Math.min(pct, 85))
      }
    }, 800)

    try {
      const data = await apiFetch<PlagiarismResponse>('/plagiarism/check', {
        method: 'POST',
        body: JSON.stringify({ text, title, ...cited }),
      })

      clearInterval(ticker)
      store.setProgress(100)
      store.setResults(data.matches, data.overallScore)
    } catch (err) {
      clearInterval(ticker)
      store.reset()
      throw err
    }
  }

  return {
    state: computed(() => store.state),
    results: computed(() => store.results),
    overallScore: computed(() => store.overallScore),
    progress: computed(() => store.progress),
    reset: () => store.reset(),
    runCheck,
  }
}
