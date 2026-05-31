<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, SlidersHorizontal, GraduationCap, Globe } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import ReferenceCard from './ReferenceCard.vue'
import { useReferences } from '@/composables/useReferences'
import { useCitations } from '@/composables/useCitations'
import type { Reference } from '@/types'

const { searchReferences, searchWeb, addToLibrary } = useReferences()
const { insertCitation } = useCitations()
const message = useMessage()

const query      = ref('')
const source     = ref('all')
const searchMode = ref<'academic' | 'web'>('academic')
const results    = ref<Reference[]>([])
const loading    = ref(false)
const searched   = ref(false)
const noKey      = ref(false)

// Year filter
const yearFrom    = ref<number | null>(null)
const yearTo      = ref<number | null>(null)
const currentYear = new Date().getFullYear()

// Pagination
const PAGE_SIZE   = 5
const currentPage = ref(1)

const sourceOptions = [
  { label: 'All sources',      value: 'all'      },
  { label: 'Semantic Scholar', value: 'semantic' },
  { label: 'OpenAlex',         value: 'openalex' },
  { label: 'Crossref',         value: 'crossref' },
]

const filteredResults = computed(() => {
  return results.value.filter(r => {
    if (yearFrom.value !== null && r.year && r.year < yearFrom.value) return false
    if (yearTo.value   !== null && r.year && r.year > yearTo.value)   return false
    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredResults.value.length / PAGE_SIZE))

const pagedResults = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredResults.value.slice(start, start + PAGE_SIZE)
})

watch([results, yearFrom, yearTo], () => { currentPage.value = 1 })

// Reset results when mode changes
watch(searchMode, () => {
  results.value  = []
  searched.value = false
  noKey.value    = false
  yearFrom.value = null
  yearTo.value   = null
})

async function search() {
  if (!query.value.trim()) return
  loading.value  = true
  searched.value = true
  noKey.value    = false

  try {
    if (searchMode.value === 'web') {
      const res = await searchWeb(query.value)
      results.value = res.results
      noKey.value   = res.noKey
    } else {
      results.value = await searchReferences(query.value)
    }
  } catch (err: any) {
    message.error(err.message ?? 'Search failed')
  } finally {
    loading.value = false
  }
}

function handleAdd(ref: Reference) {
  addToLibrary(ref)
  message.success(`Added "${ref.title.slice(0, 40)}…" to library`)
}

function handleCite(ref: Reference) {
  insertCitation(ref)
  message.success(`Citation inserted: ${ref.title.slice(0, 40)}…`)
}

function clearFilters() {
  yearFrom.value = null
  yearTo.value   = null
}
</script>

<template>
  <div class="ref-search">
    <!-- Search header -->
    <div class="search-header">

      <!-- Mode toggle -->
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ 'mode-btn--active': searchMode === 'academic' }"
          @click="searchMode = 'academic'"
        >
          <GraduationCap :size="12" />
          Academic
        </button>
        <button
          class="mode-btn"
          :class="{ 'mode-btn--active': searchMode === 'web' }"
          @click="searchMode = 'web'"
        >
          <Globe :size="12" />
          Web
        </button>
      </div>

      <!-- Query + search button -->
      <div class="search-row">
        <n-input
          v-model:value="query"
          :placeholder="searchMode === 'web' ? 'Search the web…' : 'Title, author, DOI…'"
          size="small"
          clearable
          @keydown.enter="search"
        >
          <template #prefix><Search :size="13" /></template>
        </n-input>
        <n-button type="primary" size="small" :loading="loading" @click="search">
          Search
        </n-button>
      </div>

      <!-- Source select (academic only) + year filter -->
      <div class="filter-row">
        <n-select
          v-if="searchMode === 'academic'"
          v-model:value="source"
          :options="sourceOptions"
          size="small"
          class="source-select"
        />

        <div class="year-filter" :class="{ 'year-filter--full': searchMode === 'web' }">
          <SlidersHorizontal :size="12" class="year-icon" />
          <n-input-number
            v-model:value="yearFrom"
            placeholder="From"
            size="small"
            :min="1900"
            :max="currentYear"
            :show-button="false"
            class="year-input"
          />
          <span class="year-dash">–</span>
          <n-input-number
            v-model:value="yearTo"
            placeholder="To"
            size="small"
            :min="1900"
            :max="currentYear"
            :show-button="false"
            class="year-input"
          />
          <button
            v-if="yearFrom !== null || yearTo !== null"
            class="clear-btn"
            title="Clear year filter"
            @click="clearFilters"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Active filter summary -->
      <div v-if="searched && (yearFrom !== null || yearTo !== null)" class="filter-summary">
        Showing {{ filteredResults.length }} of {{ results.length }} results
        <template v-if="yearFrom !== null && yearTo !== null">({{ yearFrom }}–{{ yearTo }})</template>
        <template v-else-if="yearFrom !== null">(from {{ yearFrom }})</template>
        <template v-else>(up to {{ yearTo }})</template>
      </div>
    </div>

    <!-- Results list -->
    <div class="search-results">
      <n-spin v-if="loading" size="small" class="search-spinner" />

      <template v-else-if="pagedResults.length">
        <ReferenceCard
          v-for="r in pagedResults"
          :key="r.id"
          :reference="r"
          @add-to-library="handleAdd"
          @insert-citation="handleCite"
        />
      </template>

      <div v-else-if="noKey" class="search-empty">
        <Globe :size="28" class="empty-icon" />
        <p>Web search requires a Tavily API key.</p>
        <p class="empty-sub">Add <code>TAVILY_API_KEY</code> to <code>server/.env</code> to enable it.</p>
      </div>

      <div v-else-if="searched && !loading && results.length && filteredResults.length === 0" class="search-empty">
        No results match the selected year range.
      </div>

      <div v-else-if="searched && !loading" class="search-empty">
        No results found. Try a different query.
      </div>

      <div v-else class="search-hint">
        <template v-if="searchMode === 'academic'">
          Search across Semantic Scholar, OpenAlex, and Crossref for academic papers.
        </template>
        <template v-else>
          Search the web for articles, blog posts, reports, and other online sources.
        </template>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-bar">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-slot="5"
        size="small"
      />
      <span class="page-info">
        {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filteredResults.length) }}
        of {{ filteredResults.length }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.ref-search {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--panel-border);
  flex-shrink: 0;
}

/* Mode toggle */
.mode-toggle {
  display: flex;
  background: var(--editor-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 2px;
  gap: 2px;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  font-family: 'Lato', sans-serif;
  border-radius: calc(var(--radius-sm) - 1px);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.mode-btn--active {
  background: var(--panel-bg);
  color: var(--accent);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-row {
  display: flex;
  gap: 6px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.source-select {
  flex: 1;
  min-width: 0;
}

.year-filter {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.year-filter--full {
  flex: 1;
}

.year-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.year-input {
  width: 60px;
}

.year-filter--full .year-input {
  flex: 1;
  width: auto;
}

.year-dash {
  font-size: 12px;
  color: var(--text-muted);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 3px;
  transition: color 0.1s;
}
.clear-btn:hover { color: var(--text-primary); }

.filter-summary {
  font-size: 11px;
  color: var(--text-muted);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.search-spinner {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.search-empty {
  padding: 24px 16px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.empty-icon {
  color: var(--border-color);
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 11px;
  margin: 0;
}

.empty-sub code {
  font-family: 'FiraCode', monospace;
  font-size: 10px;
  background: var(--editor-bg);
  padding: 1px 4px;
  border-radius: 3px;
}

.search-hint {
  padding: 24px 16px;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid var(--panel-border);
  flex-shrink: 0;
  background: var(--toolbar-bg);
}

.page-info {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
