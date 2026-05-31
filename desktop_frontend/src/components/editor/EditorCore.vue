<script setup lang="ts">
import { computed } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useSettingsStore } from '@/stores/settings'
import EditorBubbleMenu from './EditorBubbleMenu.vue'
import BibliographyPage from './BibliographyPage.vue'

const editor   = useEditorInstance()
const settings = useSettingsStore()

// Dimensions at 96 dpi (1 mm = 3.7795px, 1 in = 96px)
const PAGE_DIMS: Record<string, { width: number; height: number }> = {
  a4:     { width: 794,  height: 1123 },
  letter: { width: 816,  height: 1056 },
  legal:  { width: 816,  height: 1344 },
  a3:     { width: 1123, height: 1587 },
}

const deskStyle = computed(() => {
  const dims = PAGE_DIMS[settings.pageSize] ?? PAGE_DIMS.a4
  return {
    '--paper-width':  `${dims.width}px`,
    '--paper-height': `${dims.height}px`,
  }
})

function focusEditor() {
  editor?.value?.commands.focus('end')
}
</script>

<template>
  <div class="editor-desk">
    <EditorBubbleMenu />
    <div class="editor-desk-inner" :style="deskStyle" @click.self="focusEditor">
      <div class="editor-paper" @click.self="focusEditor">
        <EditorContent v-if="editor" :editor="editor" />
      </div>
      <BibliographyPage />
    </div>
  </div>
</template>

<style scoped>
/* Warm "desk" surface the page sits on */
.editor-desk {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--editor-bg);
  cursor: text;
}

.editor-desk-inner {
  padding: 24px 32px 80px;
  min-height: 100%;
  cursor: text;
}

/* The "paper" card — white sheet floating on the warm desk */
.editor-paper {
  width: var(--paper-width, 794px);
  min-height: var(--paper-height, 1123px);
  margin: 0 auto;
  background-color: var(--editor-page-bg);
  /* Page-break rule lines every page-height */
  background-image: linear-gradient(
    transparent calc(var(--paper-height, 1123px) - 1px),
    var(--border-color) calc(var(--paper-height, 1123px) - 1px)
  );
  background-size: 100% var(--paper-height, 1123px);
  background-origin: padding-box;
  border-radius: 3px;
  box-shadow: var(--editor-page-shadow);
  /* 1 inch = 96px — matches Word's default Normal margins exactly */
  padding: 96px 96px 96px;
  cursor: text;
  position: relative;
  border-top: 3px solid var(--accent);
}
</style>

<style>
/* TipTap content — unscoped so it reaches .ProseMirror */
.tiptap {
  font-family: 'Times New Roman', 'Times', Georgia, serif;
  font-size: 16px;          /* 12pt at 96 dpi */
  line-height: 1.5;
  color: var(--text-primary);
  outline: none;
  caret-color: var(--accent);
  cursor: text;
  min-height: 200px;
}

/* Word adds 8pt (≈ 10px) spacing after each paragraph, none before */
.tiptap p { margin: 0 0 10px; }

.tiptap h1 {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.25;
  margin: 1.5em 0 0.5em;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  border-bottom: 2px solid var(--accent);
  padding-bottom: 0.25em;
}

.tiptap h2 {
  font-size: 1.45em;
  font-weight: 700;
  line-height: 1.3;
  margin: 1.4em 0 0.45em;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.tiptap h3 {
  font-size: 1.15em;
  font-weight: 700;
  line-height: 1.4;
  margin: 1.2em 0 0.4em;
  color: var(--text-primary);
}

.tiptap blockquote {
  border-left: 4px solid var(--accent);
  margin: 1.4em 0;
  padding: 0.5em 0 0.5em 1.4em;
  color: var(--text-secondary);
  font-style: italic;
  background: var(--accent-light);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.tiptap pre {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-md);
  padding: 1em 1.2em;
  margin: 1em 0;
  overflow-x: auto;
}

.tiptap code {
  font-family: 'FiraCode', 'Fira Code', monospace;
  font-size: 0.87em;
  background: var(--accent-light);
  border: 1px solid var(--accent-border);
  border-radius: 3px;
  padding: 1px 5px;
  color: var(--accent);
}

.tiptap pre code {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-size: 0.9em;
}

.tiptap ul, .tiptap ol {
  padding-left: 1.5em;
  margin: 0.5em 0 0.8em;
}
.tiptap li { margin-bottom: 0.25em; }

.tiptap ul li::marker { color: var(--accent); }
.tiptap ol li::marker { color: var(--accent); font-weight: 700; }

.tiptap hr {
  border: none;
  height: 2px;
  background: var(--gradient-accent);
  margin: 2.5em 0;
  opacity: 0.35;
  border-radius: 99px;
}

.tiptap a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.tiptap img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.10);
}
.tiptap img.ProseMirror-selectednode {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.tiptap mark {
  background: rgba(251, 191, 36, 0.38);
  border-radius: 2px;
  padding: 0 2px;
}

/* Placeholder */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--text-muted);
  font-style: italic;
  pointer-events: none;
  float: left;
  height: 0;
}

/* Tables */
.tiptap table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.2em 0;
  font-size: 0.9em;
}
.tiptap th, .tiptap td {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
}
.tiptap th {
  background: var(--accent-light);
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  font-size: 0.82em;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  border-top: 2px solid var(--accent);
}
.tiptap .selectedCell::after {
  background: var(--accent-light);
  content: '';
  left: 0; right: 0; top: 0; bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}
</style>
