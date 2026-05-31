<script setup lang="ts">
import { computed } from 'vue'
import { useReferencesStore } from '@/stores/references'
import { useSettingsStore } from '@/stores/settings'
import { formatBibEntry } from '@/utils/citationFormatter'
import type { CitationStyle } from '@/types'

const refStore = useReferencesStore()
const settings = useSettingsStore()

const HEADING: Record<CitationStyle, string> = {
  apa7:        'References',
  apa6:        'References',
  mla9:        'Works Cited',
  mla8:        'Works Cited',
  'chicago-nb':'Bibliography',
  'chicago-ad':'References',
  harvard:     'References',
  ieee:        'References',
}

// Unique cited references, in insertion order (for IEEE numbering)
const citedReferences = computed(() => {
  const seen = new Set<string>()
  const ordered: typeof refStore.library = []
  for (const c of refStore.citations) {
    if (!seen.has(c.referenceId)) {
      seen.add(c.referenceId)
      const ref = refStore.library.find(r => r.id === c.referenceId)
      if (ref) ordered.push(ref)
    }
  }

  // IEEE stays in citation order; all other styles sort alphabetically
  if (settings.citationStyle === 'ieee') return ordered

  return [...ordered].sort((a, b) => {
    const aName = a.authors[0]?.split(',')[0]?.trim() ?? a.title
    const bName = b.authors[0]?.split(',')[0]?.trim() ?? b.title
    return aName.localeCompare(bName)
  })
})

const heading = computed(() => HEADING[settings.citationStyle] ?? 'References')

const isIeee = computed(() => settings.citationStyle === 'ieee')

// Convert *text* → <em>text</em> for display
function renderEntry(raw: string): string {
  return raw.replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

// Replace the [n] placeholder in IEEE formatted entry with actual number
function ieeeEntry(raw: string, n: number): string {
  return `[${n}] ${raw.replace(/^\[n\]\s*/, '')}`
}
</script>

<template>
  <div v-if="citedReferences.length" class="bib-page">
    <div class="bib-paper">
      <h2 class="bib-heading">{{ heading }}</h2>
      <hr class="bib-rule" />
      <ol v-if="isIeee" class="bib-list bib-list--ieee">
        <li
          v-for="(ref, i) in citedReferences"
          :key="ref.id"
          class="bib-entry"
          v-html="renderEntry(ieeeEntry(formatBibEntry(ref, settings.citationStyle), i + 1))"
        />
      </ol>
      <ul v-else class="bib-list">
        <li
          v-for="ref in citedReferences"
          :key="ref.id"
          class="bib-entry"
          v-html="renderEntry(formatBibEntry(ref, settings.citationStyle))"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.bib-page {
  padding: 32px 32px 60px;
}

.bib-paper {
  width: var(--paper-width, 794px);
  min-height: var(--paper-height, 1123px);
  margin: 0 auto;
  background-color: var(--editor-page-bg);
  border-radius: 3px;
  box-shadow: var(--editor-page-shadow);
  padding: 64px 96px 80px;
  border-top: 3px solid var(--accent);
}

.bib-heading {
  font-family: 'Georgia', serif;
  font-size: 1.3em;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.bib-rule {
  border: none;
  height: 2px;
  background: var(--gradient-accent);
  margin: 0 0 24px;
  opacity: 0.4;
  border-radius: 99px;
}

.bib-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bib-list--ieee {
  counter-reset: none;
}

.bib-entry {
  font-family: 'Georgia', serif;
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-primary);
  padding-left: 2em;
  text-indent: -2em;
}

</style>
