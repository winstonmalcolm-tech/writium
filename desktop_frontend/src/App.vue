<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

const settings = useSettingsStore()
const auth     = useAuthStore()

onMounted(() => auth.init())

const naiveTheme = computed(() => (settings.theme === 'dark' ? darkTheme : null))

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#EA580C',
    primaryColorHover: '#C2410C',
    primaryColorPressed: '#9A3412',
    primaryColorSuppl: '#F97316',
    borderRadius: '6px',
    fontFamily: "'Lato', sans-serif",
  },
}
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
