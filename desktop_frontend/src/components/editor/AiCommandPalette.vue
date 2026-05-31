<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  Sparkles, RefreshCw, Feather, Maximize2, AlignLeft,
  Check, GraduationCap, Target, BookMarked, ArrowLeft, Search,
} from 'lucide-vue-next'
import { useReferencesStore } from '@/stores/references'
import type { AiCommand } from '@/composables/useAiCommands'
import type { Reference } from '@/types'

const props = defineProps<{
  position: { x: number; y: number }
}>()

const emit = defineEmits<{
  run:     [command: AiCommand]
  citeRef: [reference: Reference]
  close:   []
}>()

const refStore  = useReferencesStore()
const mode      = ref<'commands' | 'ref-picker'>('commands')
const refSearch = ref('')

const COMMANDS: { label: string; command: AiCommand; description: string; icon: any }[] = [
  { label: 'Suggest',     command: 'suggest',   description: 'Continue writing',    icon: Sparkles      },
  { label: 'Rephrase',    command: 'rephrase',  description: 'Rewrite for clarity',  icon: RefreshCw     },
  { label: 'Humanize',    command: 'humanize',  description: 'Sound more natural',   icon: Feather       },
  { label: 'Expand',      command: 'expand',    description: 'Add more detail',      icon: Maximize2     },
  { label: 'Summarize',   command: 'summarize', description: 'Condense the text',    icon: AlignLeft     },
  { label: 'Fix grammar', command: 'grammar',   description: 'Correct errors',       icon: Check         },
  { label: 'Formal',      command: 'formal',    description: 'Academic register',    icon: GraduationCap },
  { label: 'Clarity',     command: 'clarity',   description: 'Maximum precision',    icon: Target        },
]

const filteredRefs = computed(() => {
  const q = refSearch.value.toLowerCase().trim()
  if (!q) return refStore.library
  return refStore.library.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.authors.some(a => a.toLowerCase().includes(q)) ||
    String(r.year).includes(q),
  )
})

const style = computed(() => {
  const W = mode.value === 'ref-picker' ? 300 : 268
  const x = Math.min(props.position.x, window.innerWidth - W - 12)
  return { left: `${x}px`, top: `${props.position.y}px` }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (mode.value === 'ref-picker') { mode.value = 'commands'; refSearch.value = '' }
    else emit('close')
  }
}

// Close when clicking outside the palette.
// Note: clicks INSIDE are stopped at the root with @mousedown.stop.prevent
// so this handler only fires for genuine outside clicks.
let outsideHandler: (e: MouseEvent) => void
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  requestAnimationFrame(() => {
    outsideHandler = () => emit('close')
    document.addEventListener('mousedown', outsideHandler)
  })
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (outsideHandler) document.removeEventListener('mousedown', outsideHandler)
})
</script>

<template>
  <teleport to="body">
    <!--
      @mousedown.stop.prevent on root:
        .stop  — stops the event reaching the document outsideHandler
        .prevent — prevents the browser from stealing focus from the editor
      Individual buttons use plain @click so they respond normally.
    -->
    <div class="ai-palette" :style="style" @mousedown.stop.prevent>

      <!-- ── Command list ── -->
      <template v-if="mode === 'commands'">
        <div class="ai-palette-header">
          <Sparkles :size="12" />
          <span>AI Commands</span>
        </div>

        <button
          v-for="cmd in COMMANDS"
          :key="cmd.command"
          class="ai-palette-item"
          @click="emit('run', cmd.command)"
        >
          <component :is="cmd.icon" :size="13" class="cmd-icon" />
          <span class="cmd-label">{{ cmd.label }}</span>
          <span class="cmd-desc">{{ cmd.description }}</span>
        </button>

        <div class="palette-divider" />

        <button
          class="ai-palette-item ai-palette-item--cite"
          @click="mode = 'ref-picker'"
        >
          <BookMarked :size="13" class="cmd-icon cmd-icon--cite" />
          <span class="cmd-label">Cite from library</span>
          <span class="cmd-desc">Insert &amp; cite a reference</span>
        </button>
      </template>

      <!-- ── Reference picker ── -->
      <template v-else>
        <div class="ai-palette-header">
          <button class="back-btn" @click="mode = 'commands'; refSearch = ''">
            <ArrowLeft :size="12" />
          </button>
          <span>Select a reference</span>
        </div>

        <div class="ref-search-row">
          <Search :size="12" class="ref-search-icon" />
          <input
            v-model="refSearch"
            class="ref-search-input"
            placeholder="Filter by title, author…"
            autofocus
          />
        </div>

        <div class="ref-list">
          <div v-if="!refStore.library.length" class="ref-empty">
            Your library is empty — save references first.
          </div>
          <div v-else-if="!filteredRefs.length" class="ref-empty">
            No matches.
          </div>
          <button
            v-for="ref in filteredRefs"
            :key="ref.id"
            class="ref-item"
            @click="emit('citeRef', ref)"
          >
            <span class="ref-item-title">{{ ref.title }}</span>
            <span class="ref-item-meta">
              {{ ref.authors[0]?.split(',')[0] ?? '' }}{{ ref.authors.length > 1 ? ' et al.' : '' }}
              <template v-if="ref.year"> · {{ ref.year }}</template>
              <span v-if="!ref.abstract" class="no-abstract-badge">No abstract</span>
            </span>
          </button>
        </div>
      </template>

    </div>
  </teleport>
</template>

<style scoped>
.ai-palette {
  position: fixed;
  z-index: 9999;
  width: 268px;
  background: var(--panel-bg);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  font-family: 'Lato', sans-serif;
}

.ai-palette-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  border-bottom: 1px solid var(--border-color);
  background: var(--accent-light);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--accent);
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.back-btn:hover { background: var(--accent-border); }

.ai-palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.ai-palette-item:hover { background: var(--accent-light); }

.cmd-icon       { color: var(--accent); flex-shrink: 0; }
.cmd-icon--cite { color: var(--text-muted); }
.ai-palette-item--cite:hover .cmd-icon--cite { color: var(--accent); }

.cmd-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 84px;
}
.cmd-desc { font-size: 11px; color: var(--text-muted); }

.palette-divider {
  height: 1px;
  background: var(--border-color);
  margin: 2px 0;
}

/* Ref picker */
.ref-search-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-bottom: 1px solid var(--border-color);
}
.ref-search-icon { color: var(--text-muted); flex-shrink: 0; }
.ref-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-family: 'Lato', sans-serif;
  color: var(--text-primary);
}
.ref-search-input::placeholder { color: var(--text-muted); }

.ref-list {
  max-height: 260px;
  overflow-y: auto;
}

.ref-empty {
  padding: 14px 12px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.ref-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  border-bottom: 1px solid var(--border-color);
}
.ref-item:last-child { border-bottom: none; }
.ref-item:hover { background: var(--accent-light); }

.ref-item-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ref-item-meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.no-abstract-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 4px;
  background: var(--editor-bg);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
