<script setup lang="ts">
import { computed } from 'vue'
import { useEditorInstance } from '@/composables/useEditorInstance'

const editor = useEditorInstance()

interface HeadingItem {
  level: number
  text: string
  pos: number
}

const headings = computed<HeadingItem[]>(() => {
  if (!editor?.value) return []
  const items: HeadingItem[] = []
  editor.value.state.doc.forEach((node, pos) => {
    if (node.type.name === 'heading') {
      items.push({ level: node.attrs.level as number, text: node.textContent, pos })
    }
  })
  return items
})

function scrollTo(pos: number) {
  if (!editor?.value) return
  editor.value.chain().focus().setTextSelection(pos + 1).scrollIntoView().run()
}

const INDENT: Record<number, string> = { 1: '0px', 2: '12px', 3: '22px' }
</script>

<template>
  <div class="outline">
    <div class="tree-section-label">Outline</div>

    <div v-if="headings.length === 0" class="outline-empty">
      No headings yet. Use H1–H3 to build an outline.
    </div>

    <button
      v-for="(h, i) in headings"
      :key="i"
      class="outline-item"
      :style="{ paddingLeft: `calc(8px + ${INDENT[h.level]})` }"
      :class="[`outline-h${h.level}`]"
      @click="scrollTo(h.pos)"
    >
      {{ h.text || '(untitled)' }}
    </button>
  </div>
</template>

<style scoped>
.outline {
  padding: 8px 6px;
}

.tree-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--sidebar-text);
  opacity: 0.6;
  padding: 4px 8px 6px;
}

.outline-empty {
  font-size: 12px;
  color: var(--sidebar-text);
  opacity: 0.6;
  padding: 6px 8px;
  line-height: 1.5;
}

.outline-item {
  display: block;
  width: 100%;
  padding: 5px 8px;
  border: none;
  background: transparent;
  color: var(--sidebar-text-hover);
  font-family: 'Lato', sans-serif;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
}
.outline-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--sidebar-text-active);
}

.outline-h1 {
  font-size: 12px;
  font-weight: 700;
}
.outline-h2 {
  font-size: 12px;
  font-weight: 500;
}
.outline-h3 {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.85;
}
</style>
