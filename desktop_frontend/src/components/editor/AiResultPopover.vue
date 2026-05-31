<script setup lang="ts">
import { computed } from 'vue'
import { Check, X, RotateCcw, Bot } from 'lucide-vue-next'

const props = defineProps<{
  position: { x: number; y: number }
  text: string
  loading: boolean
}>()

const emit = defineEmits<{
  accept: []
  discard: []
  retry: []
}>()

const style = computed(() => {
  const POPOVER_W = 320
  const x = Math.min(props.position.x, window.innerWidth - POPOVER_W - 12)
  return { left: `${x}px`, top: `${props.position.y}px` }
})
</script>

<template>
  <teleport to="body">
    <div class="ai-result" :style="style">
      <div class="ai-result-header">
        <Bot :size="12" />
        <span>AI Result</span>
      </div>

      <div v-if="loading" class="ai-result-loading">
        <n-spin :size="16" />
        <span>Generating…</span>
      </div>

      <template v-else>
        <div class="ai-result-body">
          <p class="ai-result-text">{{ text }}</p>
        </div>
        <div class="ai-result-actions">
          <n-button size="small" type="primary" @click="emit('accept')">
            <template #icon><Check :size="12" /></template>
            Accept
          </n-button>
          <n-button size="small" @click="emit('retry')">
            <template #icon><RotateCcw :size="12" /></template>
            Retry
          </n-button>
          <n-button size="small" quaternary @click="emit('discard')">
            <template #icon><X :size="12" /></template>
            Discard
          </n-button>
        </div>
      </template>
    </div>
  </teleport>
</template>

<style scoped>
.ai-result {
  position: fixed;
  z-index: 9999;
  width: 320px;
  background: var(--panel-bg);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  font-family: 'Lato', sans-serif;
}

.ai-result-header {
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

.ai-result-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.ai-result-body {
  padding: 12px 12px 0;
  max-height: 200px;
  overflow-y: auto;
}

.ai-result-text {
  font-family: 'Georgia', serif;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
  white-space: pre-wrap;
}

.ai-result-actions {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid var(--border-color);
  margin-top: 10px;
}
</style>
