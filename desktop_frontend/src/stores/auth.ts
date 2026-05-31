import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  function applySession(s: Session | null) {
    session.value = s
    user.value    = s?.user ?? null
  }

  async function init() {
    const { data } = await supabase.auth.getSession()
    applySession(data.session)
    loading.value = false

    supabase.auth.onAuthStateChange((_event, s) => {
      applySession(s)
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    applySession(data.session)
  }

  async function signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
    applySession(data.session)
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    applySession(null)
  }

  return { user, session, loading, isAuthenticated, init, signIn, signUp, signInWithGoogle, signOut }
})
