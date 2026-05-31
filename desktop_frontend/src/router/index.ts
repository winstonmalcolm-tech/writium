import { createRouter, createWebHashHistory } from 'vue-router'
import EditorView from '@/views/EditorView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: EditorView },
    { path: '/auth', component: () => import('@/views/AuthView.vue') },
    { path: '/settings', component: () => import('@/views/SettingsView.vue') },
  ],
})

router.beforeEach(async (to) => {
  if (to.path === '/auth') return true

  const auth = useAuthStore()

  // Wait for the initial session check to complete
  if (auth.loading) {
    await new Promise<void>((resolve) => {
      const stop = auth.$subscribe(() => {
        if (!auth.loading) { stop(); resolve() }
      })
    })
  }

  if (!auth.isAuthenticated) return '/auth'
  return true
})

export default router
