import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlagiarismMatch } from '@/types'

export const usePlagiarismStore = defineStore('plagiarism', () => {
  const state = ref<'idle' | 'running' | 'done'>('idle')
  const results = ref<PlagiarismMatch[]>([])
  const overallScore = ref(0)
  const progress = ref(0)

  function reset() {
    state.value = 'idle'
    results.value = []
    overallScore.value = 0
    progress.value = 0
  }

  function startCheck() {
    state.value = 'running'
    progress.value = 0
    results.value = []
  }

  function setProgress(p: number) {
    progress.value = p
  }

  function setResults(matches: PlagiarismMatch[], score: number) {
    results.value = matches
    overallScore.value = score
    state.value = 'done'
    progress.value = 100
  }

  return { state, results, overallScore, progress, reset, startCheck, setProgress, setResults }
})
