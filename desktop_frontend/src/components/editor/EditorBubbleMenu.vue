<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { Bold, Italic, Underline, Link, Wand2, Sparkles } from 'lucide-vue-next'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useAiCommands } from '@/composables/useAiCommands'
import { useMessage } from 'naive-ui'

const editor = useEditorInstance()
const { runCommand } = useAiCommands()
const message = useMessage()

function setLink() {
  const url = window.prompt('URL')
  if (!url || !editor?.value) return
  editor.value.chain().focus().setLink({ href: url }).run()
}

async function aiAction(type: 'rephrase' | 'humanize') {
  if (!editor?.value) return
  const { from, to } = editor.value.state.selection
  const text = editor.value.state.doc.textBetween(from, to, ' ')
  if (!text.trim()) return
  message.loading('Processing with AI…', { duration: 1500 })
  const result = await runCommand(type, text)
  editor.value.chain().focus().insertContentAt({ from, to }, result).run()
}
</script>

<template>
  <BubbleMenu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 120, placement: 'top' }"
    class="bubble-menu"
  >
    <n-tooltip :delay="600" placement="top">
      <template #trigger>
        <button
          class="bm-btn"
          :class="{ 'bm-btn--active': editor?.isActive('bold') }"
          @click="editor?.chain().focus().toggleBold().run()"
        ><Bold :size="13" /></button>
      </template>
      Bold
    </n-tooltip>

    <n-tooltip :delay="600" placement="top">
      <template #trigger>
        <button
          class="bm-btn"
          :class="{ 'bm-btn--active': editor?.isActive('italic') }"
          @click="editor?.chain().focus().toggleItalic().run()"
        ><Italic :size="13" /></button>
      </template>
      Italic
    </n-tooltip>

    <n-tooltip :delay="600" placement="top">
      <template #trigger>
        <button
          class="bm-btn"
          :class="{ 'bm-btn--active': editor?.isActive('underline') }"
          @click="editor?.chain().focus().toggleUnderline().run()"
        ><Underline :size="13" /></button>
      </template>
      Underline
    </n-tooltip>

    <n-tooltip :delay="600" placement="top">
      <template #trigger>
        <button
          class="bm-btn"
          :class="{ 'bm-btn--active': editor?.isActive('link') }"
          @click="setLink"
        ><Link :size="13" /></button>
      </template>
      Link
    </n-tooltip>

    <div class="bm-sep" />

    <n-tooltip :delay="600" placement="top">
      <template #trigger>
        <button class="bm-btn bm-btn--ai" @click="aiAction('rephrase')">
          <Wand2 :size="13" />
          Rephrase
        </button>
      </template>
      AI Rephrase
    </n-tooltip>

    <n-tooltip :delay="600" placement="top">
      <template #trigger>
        <button class="bm-btn bm-btn--ai" @click="aiAction('humanize')">
          <Sparkles :size="13" />
          Humanize
        </button>
      </template>
      AI Humanize
    </n-tooltip>
  </BubbleMenu>
</template>

<style scoped>
.bubble-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--editor-page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 4px;
  box-shadow: var(--shadow-md);
}

.bm-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-family: 'Lato', sans-serif;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}

.bm-btn:hover {
  background: var(--panel-bg);
  color: var(--text-primary);
}

.bm-btn--active {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent);
}

.bm-btn--ai {
  color: var(--accent);
}
.bm-btn--ai:hover {
  background: rgba(37, 99, 235, 0.08);
}

.bm-sep {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 2px;
}
</style>
