<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink, CheckCircle } from 'lucide-vue-next'
import type { PlagiarismMatch } from '@/types'

const props = defineProps<{ matches: PlagiarismMatch[] }>()

const uncited = computed(() => props.matches.filter(m => !m.isCited))
const cited   = computed(() => props.matches.filter(m =>  m.isCited))

function scoreColor(s: number) {
  if (s < 15) return 'var(--success)'
  if (s < 30) return 'var(--warning)'
  return 'var(--danger)'
}
function scoreBg(s: number) {
  if (s < 15) return 'rgba(22, 163, 74, 0.08)'
  if (s < 30) return 'rgba(217, 119, 6, 0.08)'
  return 'rgba(220, 38, 38, 0.08)'
}
</script>

<template>
  <div class="sim-report">

    <!-- Uncited similarity matches -->
    <template v-if="uncited.length">
      <div class="sim-section-label">Potential matches</div>
      <div v-for="(match, i) in uncited" :key="i" class="sim-match">
        <div class="sim-match-header">
          <div class="sim-score-badge"
            :style="{ color: scoreColor(match.similarity), background: scoreBg(match.similarity) }">
            {{ match.similarity }}%
          </div>
          <span class="sim-source-title">{{ match.sourceTitle }}</span>
        </div>
        <p class="sim-matched-text">"{{ match.matchedText }}"</p>
        <a :href="match.sourceUrl" target="_blank" rel="noopener noreferrer" class="sim-source-url">
          <ExternalLink :size="10" />{{ match.sourceUrl }}
        </a>
      </div>
    </template>

    <div v-else-if="matches.length && !uncited.length" class="sim-all-cited">
      All matched sources are already cited in your document.
    </div>

    <!-- Cited matches — collapsed section -->
    <template v-if="cited.length">
      <div class="sim-section-label sim-section-label--cited">
        <CheckCircle :size="11" />
        Cited sources ({{ cited.length }}) — excluded from score
      </div>
      <div v-for="(match, i) in cited" :key="'c' + i" class="sim-match sim-match--cited">
        <div class="sim-match-header">
          <div class="sim-cited-badge">Cited ✓</div>
          <span class="sim-source-title">{{ match.sourceTitle }}</span>
        </div>
        <a :href="match.sourceUrl" target="_blank" rel="noopener noreferrer" class="sim-source-url">
          <ExternalLink :size="10" />{{ match.sourceUrl }}
        </a>
      </div>
    </template>

  </div>
</template>

<style scoped>
.sim-report {
  display: flex;
  flex-direction: column;
}

.sim-section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 10px 14px 4px;
}

.sim-section-label--cited {
  color: var(--success, #16a34a);
  border-top: 1px solid var(--panel-border);
  margin-top: 4px;
  padding-top: 12px;
}

.sim-match {
  padding: 12px 14px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sim-match--cited {
  opacity: 0.65;
}

.sim-match-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sim-score-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 99px;
  flex-shrink: 0;
  margin-top: 1px;
}

.sim-cited-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--success, #16a34a);
  background: rgba(22, 163, 74, 0.1);
}

.sim-source-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.sim-matched-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  padding-left: 8px;
  border-left: 2px solid var(--border-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sim-source-url {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--accent);
  text-decoration: none;
  font-family: 'FiraCode', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sim-source-url:hover { text-decoration: underline; }

.sim-all-cited {
  padding: 20px 14px;
  font-size: 13px;
  color: var(--success, #16a34a);
  text-align: center;
  font-weight: 500;
}
</style>
