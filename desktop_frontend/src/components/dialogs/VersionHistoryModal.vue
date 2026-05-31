<script setup lang="ts">
import { ref } from 'vue'
import { Clock, RotateCcw, Eye } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import type { DocumentVersion } from '@/types'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const message = useMessage()

const versions = ref<DocumentVersion[]>([
  { id: 'v3', documentId: 'doc-1', content: {}, wordCount: 1842, createdAt: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'v2', documentId: 'doc-1', content: {}, wordCount: 1504, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 'v1', documentId: 'doc-1', content: {}, wordCount: 892, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: 'v0', documentId: 'doc-1', content: {}, wordCount: 244, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
])

const selectedId = ref<string | null>(null)

function formatDate(d: Date) {
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function restoreVersion(id: string) {
  message.success('Version restored')
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    title="Version History"
    :style="{ width: '460px' }"
    :bordered="false"
  >
    <div class="version-list">
      <div
        v-for="(v, i) in versions"
        :key="v.id"
        class="version-item"
        :class="{ 'version-item--selected': selectedId === v.id }"
        @click="selectedId = v.id"
      >
        <div class="version-icon">
          <Clock :size="14" />
        </div>
        <div class="version-info">
          <span class="version-title">
            {{ i === 0 ? 'Current version' : `Version ${versions.length - i}` }}
          </span>
          <span class="version-meta">{{ formatDate(v.createdAt) }} · {{ v.wordCount.toLocaleString() }} words</span>
        </div>
        <div class="version-actions">
          <n-tooltip :delay="500">
            <template #trigger>
              <n-button size="small" quaternary circle @click.stop="selectedId = v.id">
                <template #icon><Eye :size="13" /></template>
              </n-button>
            </template>
            Preview
          </n-tooltip>
          <n-tooltip v-if="i > 0" :delay="500">
            <template #trigger>
              <n-button size="small" quaternary circle @click.stop="restoreVersion(v.id)">
                <template #icon><RotateCcw :size="13" /></template>
              </n-button>
            </template>
            Restore this version
          </n-tooltip>
        </div>
      </div>
    </div>

    <template #footer>
      <div style="text-align: right">
        <n-button @click="emit('update:show', false)">Close</n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.version-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.12s;
  border: 1px solid transparent;
}
.version-item:hover {
  background: var(--panel-bg);
}
.version-item--selected {
  background: var(--accent-light);
  border-color: var(--accent-border);
}

.version-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.version-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.version-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.version-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.version-actions {
  display: flex;
  gap: 2px;
}
</style>
