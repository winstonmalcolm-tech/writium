import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, CitationStyle, PageSize } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('light')
  const citationStyle = ref<CitationStyle>('apa7')
  const fontSize = ref(16)
  const pageSize = ref<PageSize>('a4')
  const geminiApiKey = ref('')
  const firecrawlApiKey = ref('')
  const zoteroApiKey = ref('')

  watch(
    theme,
    (t) => document.documentElement.setAttribute('data-theme', t),
    { immediate: true },
  )

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, citationStyle, fontSize, pageSize, geminiApiKey, firecrawlApiKey, zoteroApiKey, toggleTheme }
})
