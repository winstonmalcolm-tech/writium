<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, MoreHorizontal } from 'lucide-vue-next'
import { useMessage, useDialog } from 'naive-ui'
import { useDocuments, type DocSummary } from '@/composables/useDocuments'
import { useDocumentStore } from '@/stores/document'

const { listDocuments, loadDocument, deleteDocument, renameDocument } = useDocuments()
const docStore = useDocumentStore()
const message  = useMessage()
const dialog   = useDialog()

const docs       = ref<DocSummary[]>([])
const loading    = ref(true)
const renamingId = ref<string | null>(null)
const renameVal  = ref('')

const contextMenu = ref({ show: false, x: 0, y: 0, docId: '' })
const menuOptions = [
  { label: 'Rename', key: 'rename' },
  { type: 'divider', key: 'd1' },
  { label: 'Delete', key: 'delete' },
]

onMounted(refresh)

async function refresh() {
  loading.value = true
  try {
    docs.value = await listDocuments()
  } catch {
    // server may not be running yet; fail silently
  } finally {
    loading.value = false
  }
}

async function openDoc(doc: DocSummary) {
  if (doc.id === docStore.id) return
  try {
    await loadDocument(doc.id)
  } catch (err: any) {
    message.error(err.message ?? 'Failed to load document')
  }
}

function showContext(e: MouseEvent, id: string) {
  e.preventDefault()
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, docId: id }
}

async function handleMenuSelect(key: string) {
  const id = contextMenu.value.docId
  contextMenu.value.show = false

  if (key === 'rename') {
    const doc = docs.value.find(d => d.id === id)
    if (!doc) return
    renamingId.value = id
    renameVal.value  = doc.title
  }

  if (key === 'delete') {
    const doc = docs.value.find(d => d.id === id)
    if (!doc) return
    dialog.warning({
      title: 'Delete document',
      content: `"${doc.title}" will be permanently deleted.`,
      positiveText: 'Delete',
      negativeText: 'Cancel',
      onPositiveClick: async () => {
        try {
          await deleteDocument(id)
          docs.value = docs.value.filter(d => d.id !== id)
          // If it was the active doc, clear the editor
          if (docStore.id === id) {
            docStore.requestLoad({ id: '', title: 'Untitled Document', contentJson: null })
            docStore.isSynced = false
          }
          message.success('Document deleted')
        } catch (err: any) {
          message.error(err.message ?? 'Delete failed')
        }
      },
    })
  }
}

async function commitRename() {
  const id = renamingId.value
  if (!id || !renameVal.value.trim()) { renamingId.value = null; return }

  const title = renameVal.value.trim()
  try {
    await renameDocument(id, title)
    const doc = docs.value.find(d => d.id === id)
    if (doc) doc.title = title
    if (docStore.id === id) docStore.setTitle(title)
  } catch (err: any) {
    message.error(err.message ?? 'Rename failed')
  } finally {
    renamingId.value = null
  }
}

// Expose refresh so AppSidebar can trigger it after new-doc creation
defineExpose({ refresh })

function formatDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)     return 'Just now'
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 604_800_000)return `${Math.floor(diff / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString()
}
</script>

<template>
  <div class="doc-tree">
    <div class="tree-section-label">Recent</div>

    <div v-if="loading" class="tree-loading">
      <n-spin size="small" />
    </div>

    <div v-else-if="!docs.length" class="tree-empty">
      No documents yet
    </div>

    <template v-else>
      <div
        v-for="doc in docs"
        :key="doc.id"
        class="doc-item"
        :class="{ 'doc-item--active': docStore.id === doc.id }"
        @click="openDoc(doc)"
        @contextmenu="showContext($event, doc.id)"
      >
        <FileText :size="13" class="doc-icon" />

        <div class="doc-info">
          <!-- Inline rename -->
          <input
            v-if="renamingId === doc.id"
            class="rename-input"
            v-model="renameVal"
            @keydown.enter="commitRename"
            @keydown.escape="renamingId = null"
            @blur="commitRename"
            @click.stop
            autofocus
          />
          <span v-else class="doc-name">{{ doc.title }}</span>
          <span class="doc-date">{{ formatDate(doc.updated_at) }}</span>
        </div>

        <button
          class="doc-more"
          @click.stop="showContext($event, doc.id)"
          title="More options"
        >
          <MoreHorizontal :size="12" />
        </button>
      </div>
    </template>

    <n-dropdown
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :options="menuOptions"
      placement="bottom-start"
      trigger="manual"
      @clickoutside="contextMenu.show = false"
      @select="handleMenuSelect"
    />
  </div>
</template>

<style scoped>
.doc-tree {
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

.tree-loading,
.tree-empty {
  padding: 16px 8px;
  font-size: 12px;
  color: var(--sidebar-text);
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
}
.doc-item:hover { background: var(--sidebar-item-hover); }
.doc-item--active { background: var(--sidebar-item-active); }

.doc-item:hover .doc-more { opacity: 1; }

.doc-icon {
  color: var(--sidebar-text);
  flex-shrink: 0;
  margin-top: 2px;
  opacity: 0.7;
}

.doc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.doc-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--sidebar-text-hover);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.doc-item--active .doc-name { color: var(--sidebar-text-active); }

.doc-date {
  font-size: 10px;
  color: var(--sidebar-text);
  opacity: 0.6;
}

.doc-more {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s, background 0.12s;
  margin-top: 1px;
}
.doc-more:hover { background: var(--sidebar-item-hover); opacity: 1; }

.rename-input {
  width: 100%;
  font-size: 12px;
  font-family: 'Lato', sans-serif;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--editor-page-bg);
  border: 1px solid var(--accent);
  border-radius: 3px;
  padding: 1px 5px;
  outline: none;
}
</style>
