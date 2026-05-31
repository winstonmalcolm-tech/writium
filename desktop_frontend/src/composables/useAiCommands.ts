import { useAiStore } from '@/stores/ai'
import { apiFetch } from '@/utils/api'
import type { AiMessage } from '@/types'

export type AiCommand = 'suggest' | 'rephrase' | 'humanize' | 'expand' | 'summarize' | 'grammar' | 'formal' | 'clarity' | 'cite'

export function useAiCommands() {
  const aiStore = useAiStore()

  async function sendMessage(text: string): Promise<string> {
    const userMsg: AiMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    aiStore.addMessage(userMsg)
    aiStore.isLoading = true

    try {
      const history = aiStore.messages.map(m => ({ role: m.role, content: m.content }))
      const data = await apiFetch<{ result: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: history }),
      })

      aiStore.addMessage({
        id: `msg-${Date.now()}-r`,
        role: 'assistant',
        content: data.result,
        timestamp: new Date(),
      })
      return data.result
    } finally {
      aiStore.isLoading = false
    }
  }

  async function runCommand(type: AiCommand, text: string, context?: string): Promise<string> {
    aiStore.isLoading = true
    try {
      const data = await apiFetch<{ result: string }>('/ai/command', {
        method: 'POST',
        body: JSON.stringify({ command: type, text, context }),
      })
      return data.result
    } finally {
      aiStore.isLoading = false
    }
  }

  return { sendMessage, runCommand }
}
