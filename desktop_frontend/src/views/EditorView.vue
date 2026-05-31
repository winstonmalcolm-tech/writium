<script setup lang="ts">
import { ref, provide, onBeforeUnmount, computed, nextTick, onMounted, watch } from 'vue'
import { useEditor as createTipTap } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import Focus from '@tiptap/extension-focus'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Image } from '@tiptap/extension-image'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { FontSize, LineHeight } from '@/utils/tiptapExtensions'
import { useMessage } from 'naive-ui'
import { FileText, Settings, Clock, Sun, Moon, BookOpen, Bot, ShieldCheck, ChevronRight, Save, Minus, Square, X, Maximize2, FolderOpen, LogIn, LogOut, UserCircle } from 'lucide-vue-next'
import { useFileSystem } from '@/composables/useFileSystem'
import { apiFetch } from '@/utils/api'
import { useDocuments } from '@/composables/useDocuments'
import { useReferences } from '@/composables/useReferences'
import { useCitations } from '@/composables/useCitations'
import { useAiCommands, type AiCommand } from '@/composables/useAiCommands'
import AiCommandPalette from '@/components/editor/AiCommandPalette.vue'
import AiResultPopover from '@/components/editor/AiResultPopover.vue'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'
import EditorCore from '@/components/editor/EditorCore.vue'
import Toolbar from '@/components/editor/Toolbar.vue'
import AiSidePanel from '@/components/ai/AiSidePanel.vue'
import ReferenceSearch from '@/components/references/ReferenceSearch.vue'
import ReferenceLibrary from '@/components/references/ReferenceLibrary.vue'
import PlagiarismPanel from '@/components/plagiarism/PlagiarismPanel.vue'
import SettingsModal from '@/components/dialogs/SettingsModal.vue'
import VersionHistoryModal from '@/components/dialogs/VersionHistoryModal.vue'
import { useDocumentStore } from '@/stores/document'
import { useAiStore } from '@/stores/ai'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

const docStore = useDocumentStore()
const aiStore  = useAiStore()
const settings = useSettingsStore()
const auth     = useAuthStore()
const message = useMessage()
const { isElectron, openFile, saveFileAs } = useFileSystem()
const { listDocuments, createDocument, loadDocument, saveDocument } = useDocuments()
const { loadLibrary } = useReferences()
const { insertCitation, recordCitation } = useCitations()
const aiCommands = useAiCommands()

const showSettingsModal = ref(false)
const showVersionModal = ref(false)
const editingTitle = ref(false)
const titleInput = ref('')
const titleInputRef = ref<HTMLInputElement>()
const refTab = ref<'search' | 'library'>('search')
const isMaximized = ref(false)

// /ai palette state
const showAiPalette    = ref(false)
const showAiResult     = ref(false)
const aiResultLoading  = ref(false)
const palettePos       = ref({ x: 0, y: 0 })
const aiPendingText    = ref('')
const aiResultText     = ref('')
const aiInsertFromPos  = ref(0)
const aiCurrentCommand = ref<AiCommand | null>(null)
const aiPendingRef     = ref<import('@/types').Reference | null>(null)


function winMinimize() { window.electronAPI?.minimize() }
function winMaximize() { window.electronAPI?.maximize() }
function winClose()    { window.electronAPI?.close() }

const editor = createTipTap({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: 'Start writing, or type /ai for AI assistance…' }),
    Typography,
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: true }),
    Link.configure({ openOnClick: false }),
    CharacterCount,
    Focus.configure({ className: 'has-focus', mode: 'all' }),
    TextStyle,
    FontFamily,
    Color,
    FontSize,
    LineHeight,
    Image.configure({ allowBase64: true, inline: false }),
    Subscript,
    Superscript,
  ],
  content: '<p></p>',
  onUpdate({ editor }) {
    docStore.setContent(editor.getJSON())
    const storage = editor.storage.characterCount
    docStore.updateCounts(storage.words(), storage.characters())

    const { state } = editor
    const { from } = state.selection

    // Close palette if cursor moved or text no longer ends with /ai
    if (showAiPalette.value) {
      const textBefore = state.doc.textBetween(Math.max(0, from - 3), from)
      if (textBefore !== '/ai' || from !== aiInsertFromPos.value) {
        showAiPalette.value = false
      }
      return
    }

    // Detect /ai trigger (don't open palette while result is showing)
    if (!showAiResult.value) {
      const textBefore = state.doc.textBetween(Math.max(0, from - 3), from)
      if (textBefore === '/ai') {
        const coords = editor.view.coordsAtPos(from)
        palettePos.value = { x: coords.left, y: coords.bottom + 8 }
        aiInsertFromPos.value = from
        const { $from } = state.selection
        aiPendingText.value = state.doc
          .textBetween($from.start(), $from.end())
          .replace(/\/ai$/, '')
          .trim()
        showAiPalette.value = true
      }
    }
  },
})

provide('editor', editor)

onBeforeUnmount(() => editor.value?.destroy())

// ── Load a document into TipTap when the store signals one ──────────
watch(() => docStore.loadRequest, (req) => {
  if (!req) return
  docStore.id    = req.id
  docStore.title = req.title || 'Untitled Document'
  document.title = `${docStore.title} — Writium Editor`
  editor.value?.commands.setContent((req.contentJson as any) ?? '<p></p>')
  docStore.isDirty      = false
  docStore.lastSaved    = null
  docStore.loadRequest  = null
})

// ── Auto-save (2 s debounce) ────────────────────────────────────────
// Saves to local file unconditionally; also syncs to Supabase when connected.
let saveTimer: ReturnType<typeof setTimeout> | null = null
watch(() => docStore.isDirty, (dirty) => {
  if (!dirty || !docStore.id) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      await saveDocument(docStore.id, docStore.title, docStore.content)
    } catch {
      // silent — local save already ran inside saveDocument
    }
  }, 2_000)
})

// ── On mount: load most recent doc or create a fresh one ────────────
onMounted(async () => {
  // Electron window state (existing)
  if (window.electronAPI) {
    isMaximized.value = await window.electronAPI.isMaximized()
    window.electronAPI.onMaximizeChange((val) => { isMaximized.value = val })
  } else {
    console.warn('[Writium] window.electronAPI is not available — running in browser mode or preload failed to load')
  }

  try {
    const docs = await listDocuments()
    if (docs.length) {
      await loadDocument(docs[0].id)
    } else {
      const doc = await createDocument()
      docStore.requestLoad({ id: doc.id, title: doc.title, contentJson: null })
      docStore.isSynced = true
      await loadLibrary()
    }
  } catch {
    // Supabase unreachable — fall back to locally saved documents
    docStore.isSynced = false
    const localDocs = await window.electronAPI?.localList() ?? []
    if (localDocs.length) {
      const localDoc = await window.electronAPI!.localLoad(localDocs[0].id)
      if (localDoc) {
        docStore.requestLoad({ id: localDoc.id, title: localDoc.title, contentJson: localDoc.content_json })
        message.warning('Working offline — changes are saved locally')
      }
    } else {
      // No local docs either — create a fresh local document
      const newId = `local-${Date.now()}`
      const title  = 'Untitled Document'
      docStore.requestLoad({ id: newId, title, contentJson: null })
      await window.electronAPI?.localSave({ id: newId, title, content_json: null, updated_at: new Date().toISOString() })
      message.warning('Working offline — changes are saved locally')
    }
  }
})

function startEditTitle() {
  titleInput.value = docStore.title
  editingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

function commitTitle() {
  docStore.setTitle(titleInput.value)
  editingTitle.value = false
}

function handleSave() {
  docStore.markSaved()
  message.success('Document saved')
}

const saveStatusColor = computed(() => {
  if (docStore.isDirty) return 'var(--warning)'
  return 'var(--text-muted)'
})

const activeRightTab = computed(() => aiStore.activeTab)

// Build context text for the cite command using a 3-tier strategy:
//   web reference  → fetch first 1 500 chars of full page text
//   has abstract   → use abstract
//   metadata only  → title + authors + year + journal
async function buildCiteContext(reference: import('@/types').Reference): Promise<string> {
  const meta = [
    `Title: ${reference.title}`,
    reference.authors.length ? `Authors: ${reference.authors.slice(0, 5).join(', ')}` : '',
    reference.year   ? `Year: ${reference.year}`          : '',
    reference.journal? `Source: ${reference.journal}`     : '',
  ].filter(Boolean).join('\n')

  let content = ''

  if (reference.type === 'web' && reference.url) {
    try {
      const data = await apiFetch<{ content: string }>(
        `/references/content?url=${encodeURIComponent(reference.url)}`,
      )
      content = data.content ?? ''
    } catch {
      content = reference.abstract ?? ''
    }
  } else {
    content = reference.abstract ?? ''
  }

  return content ? `${meta}\n\nContent:\n${content}` : meta
}

async function runCiteGeneration(reference: import('@/types').Reference) {
  aiResultLoading.value = true
  aiResultText.value = ''
  try {
    const context = await buildCiteContext(reference)
    aiResultText.value = await aiCommands.runCommand('cite', context)
  } catch (err: any) {
    showAiResult.value = false
    aiPendingRef.value = null
    message.error(err.message ?? 'AI cite failed')
  } finally {
    aiResultLoading.value = false
  }
}

async function handleAiCiteRef(reference: import('@/types').Reference) {
  showAiPalette.value = false
  aiCurrentCommand.value = 'cite'
  aiPendingRef.value     = reference
  showAiResult.value     = true

  // Delete the /ai text from the document
  const from = aiInsertFromPos.value
  editor.value?.chain().focus().deleteRange({ from: from - 3, to: from }).run()

  await runCiteGeneration(reference)
}

async function handleAiCommand(command: AiCommand) {
  showAiPalette.value = false
  aiCurrentCommand.value = command
  showAiResult.value = true
  aiResultLoading.value = true
  aiResultText.value = ''

  // Delete the /ai text (3 chars before the stored cursor position)
  const from = aiInsertFromPos.value
  editor.value?.chain().focus().deleteRange({ from: from - 3, to: from }).run()

  try {
    const text = aiPendingText.value || 'Continue writing from here.'
    aiResultText.value = await aiCommands.runCommand(command, text)
  } catch (err: any) {
    showAiResult.value = false
    message.error(err.message ?? 'AI command failed')
  } finally {
    aiResultLoading.value = false
  }
}

async function handleAiAccept() {
  if (aiResultText.value) {
    if (aiPendingRef.value) {
      const { formatInlineCitation } = await import('@/utils/citationFormatter')
      const inlineCite = formatInlineCitation(aiPendingRef.value, settings.citationStyle)
      let finalText = aiResultText.value.trimEnd()
      // If AI included the [CITE] token use it; otherwise append citation at the end
      if (finalText.includes('[CITE]')) {
        finalText = finalText.replace(/\[CITE\]/g, inlineCite)
      } else {
        // Insert before trailing punctuation if present
        const lastChar = finalText.at(-1)
        if (lastChar === '.' || lastChar === '?' || lastChar === '!') {
          finalText = `${finalText.slice(0, -1)} ${inlineCite}${lastChar}`
        } else {
          finalText = `${finalText} ${inlineCite}`
        }
      }
      editor.value?.chain().focus().insertContent(finalText + ' ').run()
      await recordCitation(aiPendingRef.value)
    } else {
      editor.value?.chain().focus().insertContent(aiResultText.value).run()
    }
  }
  showAiResult.value = false
  aiResultText.value = ''
  aiPendingRef.value = null
}

function handleAiDiscard() {
  showAiResult.value = false
  aiResultText.value = ''
  aiPendingRef.value = null
}

async function handleAiRetry() {
  if (!aiCurrentCommand.value) return
  // Cite retries re-use the stored reference
  if (aiCurrentCommand.value === 'cite' && aiPendingRef.value) {
    await runCiteGeneration(aiPendingRef.value)
    return
  }
  aiResultLoading.value = true
  aiResultText.value = ''
  try {
    const text = aiPendingText.value || 'Continue writing from here.'
    aiResultText.value = await aiCommands.runCommand(aiCurrentCommand.value, text)
  } catch (err: any) {
    showAiResult.value = false
    message.error(err.message ?? 'AI command failed')
  } finally {
    aiResultLoading.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <!-- ── Titlebar ──────────────────────────────────────────────── -->
    <div class="titlebar">
      <div class="titlebar-left">
        <span class="app-logo">
          <FileText :size="16" />
          Writium
        </span>
        <span class="titlebar-divider" />
        <!-- Document title -->
        <input
          v-if="editingTitle"
          ref="titleInputRef"
          v-model="titleInput"
          class="title-input"
          @blur="commitTitle"
          @keydown.enter="commitTitle"
          @keydown.escape="editingTitle = false"
        />
        <span v-else class="doc-title" @dblclick="startEditTitle" :title="'Double-click to rename'">
          {{ docStore.title }}
        </span>
        <span class="save-indicator" :style="{ color: saveStatusColor }">
          {{ docStore.saveStatus }}
        </span>
      </div>

      <div class="titlebar-right">
        <span class="word-count">
          {{ docStore.wordCount.toLocaleString() }} words
        </span>

        <n-tooltip v-if="isElectron" :delay="500">
          <template #trigger>
            <button class="tb-btn" @click="openFile">
              <FolderOpen :size="15" />
            </button>
          </template>
          Open file
        </n-tooltip>

        <n-tooltip :delay="500">
          <template #trigger>
            <button class="tb-btn" @click="isElectron ? saveFileAs() : handleSave()">
              <Save :size="15" />
            </button>
          </template>
          Save
        </n-tooltip>

        <n-tooltip :delay="500">
          <template #trigger>
            <button class="tb-btn" @click="showVersionModal = true">
              <Clock :size="15" />
            </button>
          </template>
          Version history
        </n-tooltip>

        <div class="tb-separator" />

        <n-tooltip :delay="500">
          <template #trigger>
            <button
              class="tb-btn"
              :class="{ 'tb-btn--active': aiStore.isPanelOpen && activeRightTab === 'ai' }"
              @click="aiStore.togglePanel('ai')"
            >
              <Bot :size="15" />
            </button>
          </template>
          AI Assistant
        </n-tooltip>

        <n-tooltip :delay="500">
          <template #trigger>
            <button
              class="tb-btn"
              :class="{ 'tb-btn--active': aiStore.isPanelOpen && activeRightTab === 'references' }"
              @click="aiStore.togglePanel('references')"
            >
              <BookOpen :size="15" />
            </button>
          </template>
          References
        </n-tooltip>

        <n-tooltip :delay="500">
          <template #trigger>
            <button
              class="tb-btn"
              :class="{ 'tb-btn--active': aiStore.isPanelOpen && activeRightTab === 'plagiarism' }"
              @click="aiStore.togglePanel('plagiarism')"
            >
              <ShieldCheck :size="15" />
            </button>
          </template>
          Plagiarism check
        </n-tooltip>

        <div class="tb-separator" />

        <!-- Auth: sign-in button or signed-in user indicator -->
        <n-tooltip v-if="!auth.isAuthenticated" :delay="500">
          <template #trigger>
            <button class="tb-btn auth-signin-btn" @click="$router.push('/auth')">
              <LogIn :size="15" />
            </button>
          </template>
          Sign in
        </n-tooltip>

        <n-dropdown
          v-else
          trigger="click"
          :options="[
            { label: auth.user?.email ?? 'Account', key: 'label', disabled: true },
            { type: 'divider', key: 'd' },
            { label: 'Sign out', key: 'signout' },
          ]"
          @select="(k: string) => k === 'signout' && auth.signOut()"
        >
          <n-tooltip :delay="500">
            <template #trigger>
              <button class="tb-btn">
                <UserCircle :size="15" />
              </button>
            </template>
            {{ auth.user?.email }}
          </n-tooltip>
        </n-dropdown>

        <div class="tb-separator" />

        <n-tooltip :delay="500">
          <template #trigger>
            <button class="tb-btn" @click="settings.toggleTheme()">
              <Sun v-if="settings.theme === 'dark'" :size="15" />
              <Moon v-else :size="15" />
            </button>
          </template>
          Toggle theme
        </n-tooltip>

        <n-tooltip :delay="500">
          <template #trigger>
            <button class="tb-btn" @click="showSettingsModal = true">
              <Settings :size="15" />
            </button>
          </template>
          Settings
        </n-tooltip>

        <!-- Window controls -->
        <div class="tb-separator" />
        <button class="win-btn win-btn--min" @click="winMinimize" title="Minimise">
          <Minus :size="12" />
        </button>
        <button class="win-btn win-btn--max" @click="winMaximize" :title="isMaximized ? 'Restore' : 'Maximise'">
          <Maximize2 v-if="isMaximized" :size="11" />
          <Square v-else :size="11" />
        </button>
        <button class="win-btn win-btn--close" @click="winClose" title="Close">
          <X :size="12" />
        </button>
      </div>
    </div>

    <!-- ── Workspace ─────────────────────────────────────────────── -->
    <div class="workspace">
      <!-- Left sidebar -->
      <AppSidebar />

      <!-- Editor column -->
      <div class="editor-column">
        <Toolbar />
        <EditorCore />
        <!-- Status bar -->
        <div class="status-bar">
          <span>{{ docStore.wordCount.toLocaleString() }} words</span>
          <span>{{ docStore.charCount.toLocaleString() }} characters</span>
        </div>
      </div>

      <!-- Right panel -->
      <transition name="panel-slide">
        <div v-if="aiStore.isPanelOpen" class="right-panel">
          <!-- Tab bar -->
          <div class="panel-tabs">
            <button
              class="panel-tab"
              :class="{ 'panel-tab--active': activeRightTab === 'ai' }"
              @click="aiStore.openPanel('ai')"
            >
              <Bot :size="14" />
              AI
            </button>
            <button
              class="panel-tab"
              :class="{ 'panel-tab--active': activeRightTab === 'references' }"
              @click="aiStore.openPanel('references')"
            >
              <BookOpen :size="14" />
              References
            </button>
            <button
              class="panel-tab"
              :class="{ 'panel-tab--active': activeRightTab === 'plagiarism' }"
              @click="aiStore.openPanel('plagiarism')"
            >
              <ShieldCheck :size="14" />
              Plagiarism
            </button>
            <button class="panel-close-btn" @click="aiStore.togglePanel()">
              <ChevronRight :size="14" />
            </button>
          </div>

          <!-- Panel content -->
          <div class="panel-content">
            <AiSidePanel v-if="activeRightTab === 'ai'" />

            <template v-else-if="activeRightTab === 'references'">
              <div class="ref-subtabs">
                <button
                  class="ref-subtab"
                  :class="{ 'ref-subtab--active': refTab === 'search' }"
                  @click="refTab = 'search'"
                >Search</button>
                <button
                  class="ref-subtab"
                  :class="{ 'ref-subtab--active': refTab === 'library' }"
                  @click="refTab = 'library'"
                >Library</button>
              </div>
              <ReferenceSearch v-if="refTab === 'search'" />
              <ReferenceLibrary v-else />
            </template>

            <PlagiarismPanel v-else-if="activeRightTab === 'plagiarism'" />
          </div>
        </div>
      </transition>
    </div>
  </div>

  <SettingsModal v-model:show="showSettingsModal" />
  <VersionHistoryModal v-model:show="showVersionModal" />

  <AiCommandPalette
    v-if="showAiPalette"
    :position="palettePos"
    @run="handleAiCommand"
    @cite-ref="handleAiCiteRef"
    @close="showAiPalette = false"
  />

  <AiResultPopover
    v-if="showAiResult"
    :position="palettePos"
    :text="aiResultText"
    :loading="aiResultLoading"
    @accept="handleAiAccept"
    @discard="handleAiDiscard"
    @retry="handleAiRetry"
  />
</template>

<style scoped>
/* ── Shell ── */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--editor-bg);
}

/* ── Titlebar ── */
.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 0 0 0;
  background: var(--titlebar-bg);
  border-bottom: 1px solid var(--titlebar-border);
  flex-shrink: 0;
  z-index: 10;
  position: relative;
  /* Makes the whole bar draggable in Electron */
  -webkit-app-region: drag;
}
/* All interactive children must opt out of dragging */
.titlebar button,
.titlebar input,
.titlebar-right > * {
  -webkit-app-region: no-drag;
}
.titlebar::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-accent);
  z-index: 1;
}

.titlebar-left,
.titlebar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.titlebar-right {
  padding-right: 0; /* win-btn--close sits flush at the edge */
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.01em;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex-shrink: 0;
}

.titlebar-divider {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 8px;
}

.doc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: text;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background 0.15s;
}
.doc-title:hover {
  background: var(--panel-bg);
}

.title-input {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--panel-bg);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  outline: none;
  width: 220px;
  font-family: 'Lato', sans-serif;
}

.save-indicator {
  font-size: 11px;
  margin-left: 6px;
  transition: color 0.3s;
}

.word-count {
  font-size: 12px;
  color: var(--text-muted);
  margin-right: 4px;
}

.tb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tb-btn:hover {
  background: var(--panel-bg);
  color: var(--text-primary);
}
.tb-btn--active {
  background: var(--accent-light);
  color: var(--accent);
  box-shadow: var(--accent-glow);
}

.auth-signin-btn {
  color: var(--accent);
}

.tb-separator {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 4px;
}

/* ── Workspace ── */
.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Editor column ── */
.editor-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

/* ── Status bar ── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 28px;
  padding: 0 24px;
  background: var(--toolbar-bg);
  border-top: 1px solid var(--toolbar-border);
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ── Right panel ── */
.right-panel {
  display: flex;
  flex-direction: column;
  width: var(--right-panel-width);
  flex-shrink: 0;
  background: var(--panel-bg);
  border-left: 1px solid var(--panel-border);
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  align-items: center;
  height: 40px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--panel-border);
  padding: 0 4px;
  gap: 2px;
  flex-shrink: 0;
}

.panel-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Lato', sans-serif;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.panel-tab:hover {
  background: var(--panel-bg);
  color: var(--text-primary);
}
.panel-tab--active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

.panel-close-btn {
  margin-left: auto;
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
  transition: background 0.15s, color 0.15s;
}
.panel-close-btn:hover {
  background: var(--panel-bg);
  color: var(--text-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Reference sub-tabs */
.ref-subtabs {
  display: flex;
  border-bottom: 1px solid var(--panel-border);
  flex-shrink: 0;
}
.ref-subtab {
  flex: 1;
  padding: 8px;
  font-size: 12px;
  font-family: 'Lato', sans-serif;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  border-bottom: 2px solid transparent;
}
.ref-subtab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* ── Window controls ── */
.win-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  border-radius: 0;
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}
.win-btn:hover {
  background: var(--panel-bg);
  color: var(--text-primary);
}
.win-btn--close:hover {
  background: #e81123;
  color: #ffffff;
}

/* ── Slide transition ── */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: width 0.22s ease, opacity 0.22s ease;
  overflow: hidden;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  width: 0;
  opacity: 0;
}
.panel-slide-enter-to,
.panel-slide-leave-from {
  width: var(--right-panel-width);
  opacity: 1;
}
</style>
