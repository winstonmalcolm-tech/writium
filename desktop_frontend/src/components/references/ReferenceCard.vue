<script setup lang="ts">
import { ref, computed } from 'vue'
import { BookOpen, Plus, Quote, ChevronDown, ChevronUp, ExternalLink } from 'lucide-vue-next'
import type { Reference } from '@/types'

const props = defineProps<{
  reference: Reference
  inLibrary?: boolean
}>()

const emit = defineEmits<{
  addToLibrary: [ref: Reference]
  insertCitation: [ref: Reference]
  remove: [id: string]
}>()

const expanded = ref(false)

const openUrl = computed(() => {
  if (props.reference.url) return props.reference.url
  if (props.reference.doi) return `https://doi.org/${props.reference.doi}`
  return null
})

function openSource() {
  if (openUrl.value) window.open(openUrl.value, '_blank', 'noopener,noreferrer')
}

function authorsDisplay(authors: string[], max = 3) {
  if (authors.length <= max) return authors.join(', ')
  return authors.slice(0, max).join(', ') + ` +${authors.length - max} more`
}

const TYPE_LABELS: Record<string, string> = {
  journal: 'Journal Article',
  book: 'Book',
  conference: 'Conference Paper',
  web: 'Web',
}
</script>

<template>
  <div class="ref-card">
    <div class="ref-card-header">
      <span class="ref-type-badge">{{ TYPE_LABELS[reference.type] }}</span>
      <span v-if="reference.year" class="ref-year">{{ reference.year }}</span>
    </div>

    <h4 class="ref-title">{{ reference.title }}</h4>
    <p class="ref-authors">{{ authorsDisplay(reference.authors) }}</p>

    <p v-if="reference.journal" class="ref-venue">
      <em>{{ reference.journal }}</em>
      <template v-if="reference.volume">, {{ reference.volume }}
        <template v-if="reference.issue">({{ reference.issue }})</template>
      </template>
      <template v-if="reference.pages">, pp. {{ reference.pages }}</template>
    </p>
    <p v-else-if="reference.publisher" class="ref-venue">
      {{ reference.publisher }}
    </p>

    <div v-if="reference.doi" class="ref-doi">
      <ExternalLink :size="10" />
      <span>{{ reference.doi }}</span>
    </div>

    <!-- Abstract -->
    <template v-if="reference.abstract">
      <button class="abstract-toggle" @click="expanded = !expanded">
        <component :is="expanded ? ChevronUp : ChevronDown" :size="12" />
        {{ expanded ? 'Hide' : 'Show' }} abstract
      </button>
      <p v-if="expanded" class="ref-abstract">{{ reference.abstract }}</p>
    </template>

    <!-- Actions -->
    <div class="ref-actions">
      <n-button
        v-if="!inLibrary"
        size="small"
        @click="emit('addToLibrary', reference)"
      >
        <template #icon><Plus :size="13" /></template>
        Add to library
      </n-button>
      <n-button
        size="small"
        type="primary"
        ghost
        @click="emit('insertCitation', reference)"
      >
        <template #icon><Quote :size="13" /></template>
        Cite
      </n-button>
      <n-button
        v-if="inLibrary"
        size="small"
        quaternary
        type="error"
        @click="emit('remove', reference.id)"
      >
        Remove
      </n-button>
      <n-tooltip v-if="openUrl" :delay="400" placement="top">
        <template #trigger>
          <n-button size="small" quaternary @click="openSource">
            <template #icon><ExternalLink :size="13" /></template>
          </n-button>
        </template>
        Open {{ reference.type === 'web' ? 'webpage' : 'article' }}
      </n-tooltip>
    </div>
  </div>
</template>

<style scoped>
.ref-card {
  padding: 12px 14px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ref-card:last-child {
  border-bottom: none;
}

.ref-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ref-type-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  background: var(--accent-light);
  border: 1px solid var(--accent-border);
  border-radius: 3px;
  padding: 1px 5px;
}

.ref-year {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.ref-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0;
}

.ref-authors {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.ref-venue {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.ref-doi {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
  font-family: 'FiraCode', monospace;
}

.abstract-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 11px;
  font-family: 'Lato', sans-serif;
  cursor: pointer;
  padding: 0;
  margin-top: 2px;
}

.ref-abstract {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 2px 0 0;
  padding: 8px 10px;
  background: var(--editor-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.ref-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}
</style>
