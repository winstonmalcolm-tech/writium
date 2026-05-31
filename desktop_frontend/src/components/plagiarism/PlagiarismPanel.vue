<script setup lang="ts">
import { ShieldCheck, Shield } from 'lucide-vue-next'
import { usePlagiarism } from '@/composables/usePlagiarism'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useDocumentStore } from '@/stores/document'
import { useReferencesStore } from '@/stores/references'
import SimilarityReport from './SimilarityReport.vue'

const editor   = useEditorInstance()
const docStore = useDocumentStore()
const refStore = useReferencesStore()
const { state, results, overallScore, progress, runCheck, reset } = usePlagiarism()

// Extract text from the editor, skipping blockquote nodes (direct quotes are
// intentionally verbatim and should not count as plagiarism).
function getCheckableText(): string {
  const json = editor?.value?.getJSON()
  if (!json) return ''
  const parts: string[] = []
  function traverse(node: any) {
    if (node.type === 'blockquote') return
    if (node.text) parts.push(node.text)
    node.content?.forEach(traverse)
  }
  json.content?.forEach(traverse)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

// Collect URLs and DOIs from references the user has already cited so the
// server can mark those matches as properly attributed rather than plagiarism.
function getCitedRefInfo() {
  const citedIds = new Set(refStore.citations.map(c => c.referenceId))
  const cited    = refStore.library.filter(r => citedIds.has(r.id))
  return {
    citedUrls:    cited.map(r => r.url).filter(Boolean) as string[],
    citedDois:    cited.map(r => r.doi).filter(Boolean) as string[],
    citedTitles:  cited.map(r => r.title).filter(Boolean) as string[],
  }
}

function startCheck() {
  const text = getCheckableText()
  if (!text.trim()) return
  runCheck(text, docStore.title, getCitedRefInfo())
}

const scoreColor = (score: number) =>
  score < 15 ? 'var(--success)' : score < 30 ? 'var(--warning)' : 'var(--danger)'

const scoreLabel = (score: number) =>
  score < 15 ? 'Low similarity' : score < 30 ? 'Moderate similarity' : 'High similarity'
</script>

<template>
  <div class="plag-panel">
    <div class="plag-header">
      <ShieldCheck :size="14" class="plag-icon" />
      <span>Plagiarism Check</span>
    </div>

    <!-- Idle -->
    <div v-if="state === 'idle'" class="plag-idle">
      <Shield :size="48" class="plag-idle-icon" />
      <p>Check your document for similarity against online sources.</p>
      <n-button type="primary" block @click="startCheck">
        Run plagiarism check
      </n-button>
      <p class="plag-note">
        Uses Winnowing fingerprinting + TF-IDF cosine similarity against live web sources via Tavily.
      </p>
    </div>

    <!-- Running -->
    <div v-else-if="state === 'running'" class="plag-running">
      <p class="plag-status-text">Analysing document…</p>
      <n-progress
        type="line"
        :percentage="progress"
        :show-indicator="true"
        indicator-placement="inside"
      />
      <p class="plag-sub">Stage {{ progress < 30 ? '1' : progress < 70 ? '2' : '3' }}: {{
        progress < 30 ? 'Fingerprinting' : progress < 70 ? 'Fetching sources' : 'Calculating similarity'
      }}</p>
    </div>

    <!-- Done -->
    <template v-else-if="state === 'done'">
      <!-- Score summary -->
      <div class="plag-score-card">
        <div class="plag-score" :style="{ color: scoreColor(overallScore) }">
          {{ overallScore }}%
        </div>
        <div class="plag-score-label" :style="{ color: scoreColor(overallScore) }">
          {{ scoreLabel(overallScore) }}
        </div>
        <p class="plag-score-sub">
          {{ results.length }} matching source{{ results.length !== 1 ? 's' : '' }} found
        </p>
        <n-button size="small" quaternary @click="reset()">Run again</n-button>
      </div>

      <SimilarityReport :matches="results" />
    </template>
  </div>
</template>

<style scoped>
.plag-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.plag-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 14px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--panel-border);
  flex-shrink: 0;
}

.plag-icon {
  color: var(--accent);
}

.plag-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 20px;
  text-align: center;
}

.plag-idle-icon {
  color: var(--border-color);
}

.plag-idle p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.plag-note {
  font-size: 11px;
  color: var(--text-muted) !important;
}

.plag-running {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plag-status-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.plag-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.plag-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid var(--panel-border);
}

.plag-score {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}

.plag-score-label {
  font-size: 13px;
  font-weight: 700;
}

.plag-score-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0 10px;
}
</style>
