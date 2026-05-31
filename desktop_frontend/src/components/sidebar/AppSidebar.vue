<script setup lang="ts">
import { ref } from 'vue'
import { FileText, List, FilePlus, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import DocumentTree from './DocumentTree.vue'
import OutlinePanel from './OutlinePanel.vue'
import { useDocuments } from '@/composables/useDocuments'
import { useDocumentStore } from '@/stores/document'

const collapsed     = ref(false)
const activeSection = ref<'docs' | 'outline'>('docs')
const treeRef       = ref<InstanceType<typeof DocumentTree> | null>(null)
const creating      = ref(false)

const { createDocument, loadDocument } = useDocuments()
const docStore = useDocumentStore()
const message  = useMessage()

async function newDocument() {
  creating.value = true
  try {
    const doc = await createDocument()
    // Refresh tree list then load the new blank doc
    await treeRef.value?.refresh()
    await loadDocument(doc.id)
    activeSection.value = 'docs'
    collapsed.value = false
  } catch (err: any) {
    message.error(err.message ?? 'Could not create document')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <span v-if="!collapsed" class="sidebar-brand">
        <FileText :size="15" />
        Writium
      </span>
      <button class="sidebar-collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <ChevronLeft v-if="!collapsed" :size="14" />
        <ChevronRight v-else :size="14" />
      </button>
    </div>

    <!-- Nav icons -->
    <div class="sidebar-nav">
      <n-tooltip placement="right" :disabled="!collapsed" :delay="200">
        <template #trigger>
          <button
            class="nav-btn"
            :class="{ 'nav-btn--active': activeSection === 'docs' }"
            @click="activeSection = 'docs'; collapsed = false"
          >
            <FileText :size="16" />
            <span v-if="!collapsed" class="nav-label">Documents</span>
          </button>
        </template>
        Documents
      </n-tooltip>

      <n-tooltip placement="right" :disabled="!collapsed" :delay="200">
        <template #trigger>
          <button
            class="nav-btn"
            :class="{ 'nav-btn--active': activeSection === 'outline' }"
            @click="activeSection = 'outline'; collapsed = false"
          >
            <List :size="16" />
            <span v-if="!collapsed" class="nav-label">Outline</span>
          </button>
        </template>
        Outline
      </n-tooltip>
    </div>

    <!-- Content -->
    <div v-if="!collapsed" class="sidebar-content">
      <DocumentTree v-if="activeSection === 'docs'" ref="treeRef" />
      <OutlinePanel v-else />
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <n-tooltip placement="right" :disabled="!collapsed" :delay="200">
        <template #trigger>
          <button class="new-doc-btn" :disabled="creating" @click="newDocument">
            <FilePlus :size="15" />
            <span v-if="!collapsed">{{ creating ? 'Creating…' : 'New document' }}</span>
          </button>
        </template>
        New document
      </n-tooltip>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.2s ease;
  z-index: 5;
}

.sidebar--collapsed {
  width: 52px;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 10px 0 14px;
  background: var(--gradient-sidebar-header);
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
  position: relative;
}
.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-accent);
  opacity: 0.5;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  background: linear-gradient(135deg, #FB923C 0%, #F97316 55%, #FBBF24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  margin-left: auto;
}
.sidebar-collapse-btn:hover {
  background: var(--sidebar-item-hover);
  color: var(--sidebar-text-active);
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 6px;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-family: 'Lato', sans-serif;
  font-weight: 500;
  text-align: left;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}
.nav-btn:hover {
  background: var(--sidebar-item-hover);
  color: var(--sidebar-text-hover);
}
.nav-btn--active {
  background: var(--sidebar-item-active);
  color: var(--sidebar-text-active);
  box-shadow: inset 3px 0 0 var(--sidebar-accent);
  padding-left: 5px;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Footer */
.sidebar-footer {
  padding: 8px 6px;
  border-top: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.new-doc-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 10px;
  border: 1px solid rgba(251, 146, 60, 0.30);
  background: rgba(234, 88, 12, 0.12);
  color: var(--sidebar-accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
  text-align: left;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  overflow: hidden;
}
.new-doc-btn:hover {
  background: rgba(234, 88, 12, 0.20);
  box-shadow: 0 0 0 1px rgba(251, 146, 60, 0.45);
}
</style>
