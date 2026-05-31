<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { RouterView } from 'vue-router'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor:        '#EA580C',
    primaryColorHover:   '#C2410C',
    primaryColorPressed: '#9A3412',
    primaryColorSuppl:   '#F97316',
    borderRadius:        '8px',
    fontFamily:          "'Lato', sans-serif",
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <RouterView />
  </n-config-provider>
</template>
