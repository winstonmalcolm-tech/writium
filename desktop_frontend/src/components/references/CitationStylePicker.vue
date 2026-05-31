<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import type { CitationStyle } from '@/types'

const settings = useSettingsStore()

const options = [
  { label: 'APA 7th edition', value: 'apa7' },
  { label: 'APA 6th edition', value: 'apa6' },
  { label: 'MLA 9th edition', value: 'mla9' },
  { label: 'MLA 8th edition', value: 'mla8' },
  { label: 'Chicago NB 17th', value: 'chicago-nb' },
  { label: 'Chicago AD 17th', value: 'chicago-ad' },
  { label: 'Harvard (Anglia 2008)', value: 'harvard' },
  { label: 'IEEE (2024)', value: 'ieee' },
]
</script>

<template>
  <n-select
    v-model:value="settings.citationStyle"
    :options="options"
    size="small"
    style="width: 180px"
  />
</template>
