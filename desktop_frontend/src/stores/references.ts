import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reference, Citation } from '@/types'

export const useReferencesStore = defineStore('references', () => {
  const library = ref<Reference[]>([])
  const citations = ref<Citation[]>([])

  function addToLibrary(r: Reference) {
    if (!library.value.find((x) => x.id === r.id)) library.value.push(r)
  }

  function removeFromLibrary(id: string) {
    library.value = library.value.filter((r) => r.id !== id)
  }

  function addCitation(c: Citation) {
    citations.value.push(c)
  }

  return { library, citations, addToLibrary, removeFromLibrary, addCitation }
})
