import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AiMessage, RightPanelTab } from '@/types'

export const useAiStore = defineStore('ai', () => {
  const isPanelOpen = ref(false)
  const activeTab = ref<RightPanelTab>('ai')
  const messages = ref<AiMessage[]>([])
  const isLoading = ref(false)

  function addMessage(msg: AiMessage) {
    messages.value.push(msg)
  }

  function clearHistory() {
    messages.value = []
  }

  function togglePanel(tab?: RightPanelTab) {
    if (tab) {
      if (activeTab.value === tab && isPanelOpen.value) {
        isPanelOpen.value = false
      } else {
        activeTab.value = tab
        isPanelOpen.value = true
      }
    } else {
      isPanelOpen.value = !isPanelOpen.value
    }
  }

  function openPanel(tab?: RightPanelTab) {
    if (tab) activeTab.value = tab
    isPanelOpen.value = true
  }

  return { isPanelOpen, activeTab, messages, isLoading, addMessage, clearHistory, togglePanel, openPanel }
})
