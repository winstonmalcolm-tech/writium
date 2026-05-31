<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { Send, Trash2, Sparkles } from 'lucide-vue-next'
import { useAiStore } from '@/stores/ai'
import { useAiCommands } from '@/composables/useAiCommands'

const aiStore = useAiStore()
const { sendMessage } = useAiCommands()

const input = ref('')
const messagesRef = ref<HTMLElement>()

const QUICK_ACTIONS = [
  { label: 'Suggest next sentence', key: 'suggest' },
  { label: 'Improve clarity', key: 'clarity' },
  { label: 'Make more formal', key: 'formal' },
  { label: 'Simplify language', key: 'humanize' },
]

async function send(text?: string) {
  const msg = (text ?? input.value).trim()
  if (!msg || aiStore.isLoading) return
  input.value = ''
  await sendMessage(msg)
  await nextTick()
  messagesRef.value?.scrollTo({ top: messagesRef.value.scrollHeight, behavior: 'smooth' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="ai-panel">
    <!-- Header -->
    <div class="ai-header">
      <div class="ai-header-left">
        <Sparkles :size="14" class="ai-icon" />
        <span>AI Assistant</span>
      </div>
      <n-tooltip :delay="500">
        <template #trigger>
          <button class="ai-clear-btn" @click="aiStore.clearHistory()" :disabled="!aiStore.messages.length">
            <Trash2 :size="13" />
          </button>
        </template>
        Clear history
      </n-tooltip>
    </div>

    <!-- Messages -->
    <div ref="messagesRef" class="ai-messages">
      <!-- Empty state -->
      <div v-if="!aiStore.messages.length" class="ai-empty">
        <Sparkles :size="32" class="ai-empty-icon" />
        <p>Ask anything about your writing, or use a quick action below.</p>
      </div>

      <template v-else>
        <div
          v-for="msg in aiStore.messages"
          :key="msg.id"
          class="ai-msg"
          :class="[`ai-msg--${msg.role}`]"
        >
          <div class="ai-msg-bubble">{{ msg.content }}</div>
          <span class="ai-msg-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="aiStore.isLoading" class="ai-msg ai-msg--assistant">
        <div class="ai-msg-bubble ai-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="ai-quick-actions">
      <button
        v-for="qa in QUICK_ACTIONS"
        :key="qa.key"
        class="quick-action-btn"
        :disabled="aiStore.isLoading"
        @click="send(qa.label)"
      >
        {{ qa.label }}
      </button>
    </div>

    <!-- Input -->
    <div class="ai-input-row">
      <n-input
        v-model:value="input"
        placeholder="Ask the AI assistant…"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        :disabled="aiStore.isLoading"
        @keydown.enter.exact.prevent="send()"
      />
      <n-button
        type="primary"
        circle
        :disabled="!input.trim() || aiStore.isLoading"
        @click="send()"
      >
        <template #icon><Send :size="14" /></template>
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--panel-border);
}

.ai-header-left {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.01em;
}

.ai-icon {
  color: var(--accent);
}

.ai-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.ai-clear-btn:hover:not(:disabled) {
  background: var(--border-color);
  color: var(--danger);
}
.ai-clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Messages */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}
.ai-empty-icon {
  color: var(--border-color);
}

.ai-msg {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ai-msg--user {
  align-items: flex-end;
}
.ai-msg--assistant {
  align-items: flex-start;
}

.ai-msg-bubble {
  max-width: 90%;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.ai-msg--user .ai-msg-bubble {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 3px;
}

.ai-msg--assistant .ai-msg-bubble {
  background: var(--toolbar-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-bottom-left-radius: 3px;
}

.ai-msg-time {
  font-size: 10px;
  color: var(--text-muted);
  padding: 0 4px;
}

/* Typing indicator */
.ai-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 14px;
}
.ai-typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* Quick actions */
.ai-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid var(--panel-border);
  flex-shrink: 0;
}

.quick-action-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-family: 'Lato', sans-serif;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-light);
  border: 1px solid var(--accent-border);
  border-radius: 99px;
  cursor: pointer;
  transition: background 0.12s, box-shadow 0.12s;
  white-space: nowrap;
}
.quick-action-btn:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.16);
  box-shadow: var(--accent-glow);
}
.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Input */
.ai-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 14px 12px;
  border-top: 1px solid var(--panel-border);
  flex-shrink: 0;
}
</style>
