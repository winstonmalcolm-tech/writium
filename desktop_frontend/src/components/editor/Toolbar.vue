<script setup lang="ts">
import { h, ref, computed } from 'vue'
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
import type { Editor } from '@tiptap/vue-3'
import { useEditorInstance } from '@/composables/useEditorInstance'

const _editorRef = useEditorInstance()
// e() returns the live Editor instance in both script functions and template
// without triggering Vue's ref auto-unwrap confusion.
const e = (): Editor | undefined => _editorRef?.value

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

// pt labels → px values (pt × 96/72). Toolbar shows pt; editor stores px.
const FONT_SIZES = [
  { label: '8',  value: '10.67px' },
  { label: '9',  value: '12px'    },
  { label: '10', value: '13.33px' },
  { label: '11', value: '14.67px' },
  { label: '12', value: '16px'    },
  { label: '14', value: '18.67px' },
  { label: '16', value: '21.33px' },
  { label: '18', value: '24px'    },
  { label: '20', value: '26.67px' },
  { label: '24', value: '32px'    },
  { label: '28', value: '37.33px' },
  { label: '36', value: '48px'    },
  { label: '48', value: '64px'    },
  { label: '72', value: '96px'    },
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

const canUndo = computed(() => e()?.can().undo() ?? false)
const canRedo = computed(() => e()?.can().redo() ?? false)

const DEFAULT_FONT_FAMILY = '"Times New Roman", serif'
const DEFAULT_FONT_SIZE   = '16px'

const currentFontFamily = computed(() => e()?.getAttributes('textStyle').fontFamily ?? DEFAULT_FONT_FAMILY)
const currentFontSize   = computed(() => e()?.getAttributes('textStyle').fontSize   ?? DEFAULT_FONT_SIZE)
const currentColor      = computed(() => e()?.getAttributes('textStyle').color      ?? '#000000')

// ── Helpers ───────────────────────────────────────────────────────────
function isActive(nameOrAttrs: string | Record<string, unknown>, attrs?: Record<string, unknown>) {
  return e()?.isActive(nameOrAttrs as any, attrs as any) ?? false
}

// Left alignment is active when no other alignment is explicitly set.
function isAlignActive(align: string) {
  if (align === 'left') {
    return !isActive({ textAlign: 'center' })
        && !isActive({ textAlign: 'right' })
        && !isActive({ textAlign: 'justify' })
  }
  return isActive({ textAlign: align })
}

function setFontFamily(value: string | null) {
  if (!value) e()?.chain().focus().unsetFontFamily().run()
  else        e()?.chain().focus().setFontFamily(value).run()
}

function setFontSize(value: string | null) {
  const ed = e() as any
  if (!ed) return
  if (!value) ed.chain().focus().unsetFontSize().run()
  else        ed.chain().focus().setFontSize(value).run()
}

function openColorPicker() {
  colorInputRef.value?.click()
}

function onColorChange(ev: Event) {
  const color = (ev.target as HTMLInputElement).value
  e()?.chain().focus().setColor(color).run()
}

function onLineHeightSelect(key: string) {
  ;(e() as any)?.chain().focus().setLineHeight(key).run()
}

function setLink() {
  const prev = e()?.getAttributes('link').href ?? ''
  const url  = window.prompt('URL', prev)
  if (url === null) return
  if (url === '') { e()?.chain().focus().unsetLink().run(); return }
  e()?.chain().focus().setLink({ href: url }).run()
}

function insertImageFromUrl() {
  const src = imageUrl.value.trim()
  if (!src) return
  e()?.chain().focus().setImage({ src }).run()
  showImageModal.value = false
  imageUrl.value = ''
}

function onFileSelected(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = evt => {
    const src = evt.target?.result as string
    if (src) {
      e()?.chain().focus().setImage({ src, alt: file.name }).run()
      showImageModal.value = false
    }
  }
  reader.readAsDataURL(file)
}

function clearFormatting() {
  e()?.chain().focus().clearNodes().unsetAllMarks().run()
}
</script>

<template>
  <div class="toolbar">

    <!-- History -->
    <div class="tool-group">
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :disabled="!canUndo" @click="e()?.chain().focus().undo().run()">
            <Undo2 :size="15" />
          </button>
        </template>Undo
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :disabled="!canRedo" @click="e()?.chain().focus().redo().run()">
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
        :options="FONT_SIZES"
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
            @click="e()?.chain().focus().toggleBold().run()">
            <Bold :size="15" />
          </button>
        </template>Bold
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('italic') }"
            @click="e()?.chain().focus().toggleItalic().run()">
            <Italic :size="15" />
          </button>
        </template>Italic
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('underline') }"
            @click="e()?.chain().focus().toggleUnderline().run()">
            <Underline :size="15" />
          </button>
        </template>Underline
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('strike') }"
            @click="e()?.chain().focus().toggleStrike().run()">
            <Strikethrough :size="15" />
          </button>
        </template>Strikethrough
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('subscript') }"
            @click="e()?.chain().focus().toggleSubscript().run()">
            <Subscript :size="15" />
          </button>
        </template>Subscript
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('superscript') }"
            @click="e()?.chain().focus().toggleSuperscript().run()">
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
            @click="e()?.chain().focus().toggleHighlight().run()">
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
            @click="e()?.chain().focus().setParagraph().run()">
            <Type :size="15" />
          </button>
        </template>Normal text
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('heading', { level: 1 }) }"
            @click="e()?.chain().focus().toggleHeading({ level: 1 }).run()">
            <Heading1 :size="15" />
          </button>
        </template>Heading 1
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('heading', { level: 2 }) }"
            @click="e()?.chain().focus().toggleHeading({ level: 2 }).run()">
            <Heading2 :size="15" />
          </button>
        </template>Heading 2
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('heading', { level: 3 }) }"
            @click="e()?.chain().focus().toggleHeading({ level: 3 }).run()">
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
          <button class="tool-btn" :class="{ 'tool-btn--active': isAlignActive('left') }"
            @click="e()?.chain().focus().setTextAlign('left').run()">
            <AlignLeft :size="15" />
          </button>
        </template>Align left
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isAlignActive('center') }"
            @click="e()?.chain().focus().setTextAlign('center').run()">
            <AlignCenter :size="15" />
          </button>
        </template>Align centre
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isAlignActive('right') }"
            @click="e()?.chain().focus().setTextAlign('right').run()">
            <AlignRight :size="15" />
          </button>
        </template>Align right
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isAlignActive('justify') }"
            @click="e()?.chain().focus().setTextAlign('justify').run()">
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
            @click="e()?.chain().focus().toggleBulletList().run()">
            <List :size="15" />
          </button>
        </template>Bullet list
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('orderedList') }"
            @click="e()?.chain().focus().toggleOrderedList().run()">
            <ListOrdered :size="15" />
          </button>
        </template>Numbered list
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('blockquote') }"
            @click="e()?.chain().focus().toggleBlockquote().run()">
            <Quote :size="15" />
          </button>
        </template>Blockquote
      </n-tooltip>
      <n-tooltip :delay="600" placement="bottom">
        <template #trigger>
          <button class="tool-btn" :class="{ 'tool-btn--active': isActive('codeBlock') }"
            @click="e()?.chain().focus().toggleCodeBlock().run()">
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
