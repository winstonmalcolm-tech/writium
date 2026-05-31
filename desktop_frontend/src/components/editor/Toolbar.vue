<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Type,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code2,
  Link, Image, Highlighter,
  Undo2, Redo2,
  Subscript, Superscript, RemoveFormatting,
  Baseline, AlignVerticalJustifyStart,
} from 'lucide-vue-next'
import { useEditorInstance } from '@/composables/useEditorInstance'

const editor = useEditorInstance()

// ── Font family ───────────────────────────────────────────────────────
const FONT_FAMILIES = [
  { label: 'Default',          value: '' },
  { label: 'Georgia',          value: 'Georgia, serif' },
  { label: 'Times New Roman',  value: '"Times New Roman", serif' },
  { label: 'Arial',            value: 'Arial, sans-serif' },
  { label: 'Helvetica',        value: 'Helvetica, sans-serif' },
  { label: 'Lato',             value: 'Lato, sans-serif' },
  { label: 'Courier New',      value: '"Courier New", monospace' },
]

const FONT_SIZES = [
  '10px','11px','12px','13px','14px','16px',
  '18px','20px','24px','28px','32px','36px','48px',
]

const LINE_HEIGHT_OPTIONS = [
  { label: 'Single  (1.0)',  key: '1'    },
  { label: '1.15',           key: '1.15' },
  { label: '1.5',            key: '1.5'  },
  { label: 'Double  (2.0)',  key: '2'    },
  { label: '2.5',            key: '2.5'  },
  { label: 'Triple  (3.0)',  key: '3'    },
]

// ── Reactive state ────────────────────────────────────────────────────
const colorInputRef   = ref<HTMLInputElement>()
const fileInputRef    = ref<HTMLInputElement>()
const showImageModal  = ref(false)
const imageUrl        = ref('')
const imageModalTab   = ref<'url' | 'upload'>('url')

const canUndo = computed(() => editor?.value?.can().undo() ?? false)
const canRedo = computed(() => editor?.value?.can().redo() ?? false)

const currentFontFamily = computed(
  () => editor?.value?.getAttributes('textStyle').fontFamily ?? '',
)
const currentFontSize = computed(
  () => editor?.value?.getAttributes('textStyle').fontSize ?? null,
)
const currentColor = computed(
  () => editor?.value?.getAttributes('textStyle').color ?? '#000000',
)

// ── Helpers ───────────────────────────────────────────────────────────
function isActive(name: string, attrs?: Record<string, unknown>) {
  return editor?.value?.isActive(name, attrs) ?? false
}

function setFontFamily(value: string | null) {
  const e = editor?.value
  if (!e) return
  if (!value) e.chain().focus().unsetFontFamily().run()
  else        e.chain().focus().setFontFamily(value).run()
}

function setFontSize(value: string | null) {
  const e = editor?.value as any
  if (!e) return
  if (!value) e.chain().focus().unsetFontSize().run()
  else        e.chain().focus().setFontSize(value).run()
}

function openColorPicker() {
  colorInputRef.value?.click()
}

function onColorChange(ev: Event) {
  const color = (ev.target as HTMLInputElement).value
  editor?.value?.chain().focus().setColor(color).run()
}

function onLineHeightSelect(key: string) {
  const e = editor?.value as any
  if (!e) return
  e.chain().focus().setLineHeight(key).run()
}

function setLink() {
  const prev = editor?.value?.getAttributes('link').href ?? ''
  const url  = window.prompt('URL', prev)
  if (url === null) return
  if (url === '') { editor?.value?.chain().focus().unsetLink().run(); return }
  editor?.value?.chain().focus().setLink({ href: url }).run()
}

function insertImageFromUrl() {
  const src = imageUrl.value.trim()
  if (!src) return
  editor?.value?.chain().focus().setImage({ src }).run()
  showImageModal.value = false
  imageUrl.value = ''
}

function onFileSelected(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    const src = e.target?.result as string
    if (src) {
      editor?.value?.chain().focus().setImage({ src, alt: file.name }).run()
      showImageModal.value = false
    }
  }
  reader.readAsDataURL(file)
}

function clearFormatting() {
  editor?.value?.chain().focus().clearNodes().unsetAllMarks().run()
}
</script>

<template>
  <div class="toolbar">

    <!-- History -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :disabled="!canUndo" @click="editor?.value?.chain().focus().undo().run()">
            <Undo2 :size="15" />
          </button>
        </template>Undo
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :disabled="!canRedo" @click="editor?.value?.chain().focus().redo().run()">
            <Redo2 :size="15" />
          </button>
        </template>Redo
      </n-tooltip>
    </div>

    <div class="tool-sep" />

    <!-- Font family + size -->
    <div class="tool-group">
      <n-select
        :value="currentFontFamily"
        :options="FONT_FAMILIES.map(f => ({ label: f.label, value: f.value }))"
        size="small"
        placeholder="Font"
        class="font-select"
        :render-label="(opt: any) => h('span', { style: `font-family: ${opt.value || 'inherit'}` }, opt.label)"
        @update:value="setFontFamily"
      />
      <n-select
        :value="currentFontSize"
        :options="FONT_SIZES.map(s => ({ label: s.replace('px',''), value: s }))"
        size="small"
        placeholder="Size"
        class="size-select"
        @update:value="setFontSize"
      />
    </div>

    <div class="tool-sep" />

    <!-- Text formatting -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('bold') }"
            @click="editor?.value?.chain().focus().toggleBold().run()">
            <Bold :size="15" />
          </button>
        </template>Bold
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('italic') }"
            @click="editor?.value?.chain().focus().toggleItalic().run()">
            <Italic :size="15" />
          </button>
        </template>Italic
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('underline') }"
            @click="editor?.value?.chain().focus().toggleUnderline().run()">
            <Underline :size="15" />
          </button>
        </template>Underline
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('strike') }"
            @click="editor?.value?.chain().focus().toggleStrike().run()">
            <Strikethrough :size="15" />
          </button>
        </template>Strikethrough
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('subscript') }"
            @click="editor?.value?.chain().focus().toggleSubscript().run()">
            <Subscript :size="15" />
          </button>
        </template>Subscript
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('superscript') }"
            @click="editor?.value?.chain().focus().toggleSuperscript().run()">
            <Superscript :size="15" />
          </button>
        </template>Superscript
      </n-tooltip>

      <!-- Text colour -->
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn color-btn" @click="openColorPicker">
            <Baseline :size="15" />
            <span class="color-swatch" :style="{ background: currentColor }" />
          </button>
        </template>Text colour
      </n-tooltip>
      <input ref="colorInputRef" type="color" :value="currentColor" class="hidden-color"
        @input="onColorChange" />

      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('highlight') }"
            @click="editor?.value?.chain().focus().toggleHighlight().run()">
            <Highlighter :size="15" />
          </button>
        </template>Highlight
      </n-tooltip>

      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" @click="clearFormatting">
            <RemoveFormatting :size="15" />
          </button>
        </template>Clear formatting
      </n-tooltip>
    </div>

    <div class="tool-sep" />

    <!-- Block style -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('paragraph') }"
            @click="editor?.value?.chain().focus().setParagraph().run()">
            <Type :size="15" />
          </button>
        </template>Normal text
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('heading', { level: 1 }) }"
            @click="editor?.value?.chain().focus().toggleHeading({ level: 1 }).run()">
            <Heading1 :size="15" />
          </button>
        </template>Heading 1
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('heading', { level: 2 }) }"
            @click="editor?.value?.chain().focus().toggleHeading({ level: 2 }).run()">
            <Heading2 :size="15" />
          </button>
        </template>Heading 2
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('heading', { level: 3 }) }"
            @click="editor?.value?.chain().focus().toggleHeading({ level: 3 }).run()">
            <Heading3 :size="15" />
          </button>
        </template>Heading 3
      </n-tooltip>
    </div>

    <div class="tool-sep" />

    <!-- Alignment + line height -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive({ textAlign: 'left' }) }"
            @click="editor?.value?.chain().focus().setTextAlign('left').run()">
            <AlignLeft :size="15" />
          </button>
        </template>Align left
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive({ textAlign: 'center' }) }"
            @click="editor?.value?.chain().focus().setTextAlign('center').run()">
            <AlignCenter :size="15" />
          </button>
        </template>Align centre
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive({ textAlign: 'right' }) }"
            @click="editor?.value?.chain().focus().setTextAlign('right').run()">
            <AlignRight :size="15" />
          </button>
        </template>Align right
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive({ textAlign: 'justify' }) }"
            @click="editor?.value?.chain().focus().setTextAlign('justify').run()">
            <AlignJustify :size="15" />
          </button>
        </template>Justify
      </n-tooltip>

      <!-- Line spacing dropdown -->
      <n-dropdown :options="LINE_HEIGHT_OPTIONS" trigger="click" placement="bottom-start"
        @select="onLineHeightSelect">
        <n-tooltip :delay="600" placement="bottom">
          <template #trigger>
            <button class="tool-btn">
              <AlignVerticalJustifyStart :size="15" />
            </button>
          </template>Line spacing
        </n-tooltip>
      </n-dropdown>
    </div>

    <div class="tool-sep" />

    <!-- Lists & blocks -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('bulletList') }"
            @click="editor?.value?.chain().focus().toggleBulletList().run()">
            <List :size="15" />
          </button>
        </template>Bullet list
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('orderedList') }"
            @click="editor?.value?.chain().focus().toggleOrderedList().run()">
            <ListOrdered :size="15" />
          </button>
        </template>Numbered list
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('blockquote') }"
            @click="editor?.value?.chain().focus().toggleBlockquote().run()">
            <Quote :size="15" />
          </button>
        </template>Blockquote
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('codeBlock') }"
            @click="editor?.value?.chain().focus().toggleCodeBlock().run()">
            <Code2 :size="15" />
          </button>
        </template>Code block
      </n-tooltip>
    </div>

    <div class="tool-sep" />

    <!-- Insert -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('link') }" @click="setLink">
            <Link :size="15" />
          </button>
        </template>Insert link
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" @click="showImageModal = true">
            <Image :size="15" />
          </button>
        </template>Insert image
      </n-tooltip>
    </div>
  </div>

  <!-- ── Image insertion modal ── -->
  <n-modal
    v-model:show="showImageModal"
    preset="card"
    title="Insert image"
    :style="{ width: '420px' }"
    :bordered="false"
    size="small"
  >
    <n-tabs v-model:value="imageModalTab" type="line" size="small">
      <n-tab-pane name="url" tab="From URL">
        <div class="img-modal-body">
          <n-input
            v-model:value="imageUrl"
            placeholder="https://example.com/image.png"
            size="small"
            @keydown.enter="insertImageFromUrl"
          />
          <n-button type="primary" size="small" :disabled="!imageUrl.trim()" @click="insertImageFromUrl">
            Insert
          </n-button>
        </div>
      </n-tab-pane>

      <n-tab-pane name="upload" tab="Upload file">
        <div class="img-modal-body">
          <n-button size="small" @click="fileInputRef?.click()">
            Choose image…
          </n-button>
          <span class="upload-hint">PNG, JPG, GIF, WebP supported</span>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display:none"
          @change="onFileSelected"
        />
      </n-tab-pane>
    </n-tabs>
  </n-modal>
</template>

<script lang="ts">
import { h } from 'vue'
export default { name: 'Toolbar' }
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 5px 10px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--toolbar-border);
  flex-shrink: 0;
  position: relative;
}

.toolbar::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-accent);
  opacity: 0.25;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.tool-sep {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 3px;
  flex-shrink: 0;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
}
.tool-btn:hover:not(:disabled) {
  background: var(--panel-bg);
  color: var(--text-primary);
}
.tool-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.tool-btn--active {
  background: var(--accent-light);
  color: var(--accent);
  box-shadow: var(--accent-glow);
}

/* Colour button */
.color-btn {
  flex-direction: column;
  gap: 1px;
  height: 30px;
  padding-bottom: 3px;
  position: relative;
}
.color-swatch {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 3px;
  border-radius: 2px;
}
.hidden-color {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* Font / size selects */
.font-select { width: 128px; }
.size-select { width:  70px; }

/* Image modal */
.img-modal-body {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0 4px;
}
.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
