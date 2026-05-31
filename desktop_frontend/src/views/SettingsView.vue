<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import SettingsModal from '@/components/dialogs/SettingsModal.vue'
import { ref } from 'vue'

const router = useRouter()
const show = ref(true)

function onClose() {
  router.back()
}
</script>

<template>
  <div class="settings-shell">
    <div class="settings-back">
      <n-button text @click="router.push('/')">
        <template #icon><ArrowLeft :size="16" /></template>
        Back to editor
      </n-button>
    </div>
    <SettingsModal :show="show" @update:show="onClose" />
  </div>
</template>

<style scoped>
.settings-shell {
  min-height: 100vh;
  background: var(--editor-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.settings-back {
  position: fixed;
  top: 20px;
  left: 20px;
}
</style>
