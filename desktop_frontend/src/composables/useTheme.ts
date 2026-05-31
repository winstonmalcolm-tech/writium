import { computed } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2563EB',
    primaryColorHover: '#1D4ED8',
    primaryColorPressed: '#1E40AF',
    primaryColorSuppl: '#3B82F6',
    borderRadius: '6px',
    fontFamily: "'Lato', 'Inter', sans-serif",
  },
}

export function useTheme() {
  const settings = useSettingsStore()

  const naiveTheme = computed(() =>
    settings.theme === 'dark' ? darkTheme : null,
  )

  return {
    naiveTheme,
    themeOverrides,
    theme: computed(() => settings.theme),
    toggleTheme: () => settings.toggleTheme(),
  }
}
