<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import ReferenceCard from './ReferenceCard.vue'
import { useReferences } from '@/composables/useReferences'
import type { Reference } from '@/types'

const { library, removeFromLibrary } = useReferences()
const message = useMessage()

const grouped = computed(() => {
  const groups: Record<string, Reference[]> = {}
  for (const r of library) {
    const type = r.type === 'journal' ? 'Journal Articles'
      : r.type === 'book' ? 'Books'
      : r.type === 'conference' ? 'Conference Papers'
      : 'Web Sources'
    if (!groups[type]) groups[type] = []
    groups[type].push(r)
  }
  return groups
})

function handleRemove(id: string) {
  removeFromLibrary(id)
  message.success('Removed from library')
}

function handleCite(ref: Reference) {
  message.info('Citation inserted into document')
}
</script>

<template>
  <div class="ref-library">
    <!-- Empty state -->
    <div v-if="!library.length" class="library-empty">
      <BookOpen :size="36" class="library-empty-icon" />
      <p>Your library is empty.</p>
      <p>Search for references and add them here.</p>
    </div>

    <template v-else>
      <div v-for="(refs, groupName) in grouped" :key="groupName" class="library-group">
        <div class="library-group-label">{{ groupName }} ({{ refs.length }})</div>
        <ReferenceCard
          v-for="r in refs"
          :key="r.id"
          :reference="r"
          :in-library="true"
          @insert-citation="handleCite"
          @remove="handleRemove"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.ref-library {
  height: 100%;
  overflow-y: auto;
}

.library-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}
.library-empty p {
  margin: 0;
}
.library-empty-icon {
  color: var(--border-color);
  margin-bottom: 4px;
}

.library-group-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 10px 14px 4px;
  background: var(--panel-bg);
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
