<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabase'
import type { EmailOtpType } from '@supabase/supabase-js'

type Status = 'verifying' | 'success' | 'error'

const status  = ref<Status>('verifying')
const message = ref('')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const hash   = new URLSearchParams(window.location.hash.slice(1))

  // ── 1. Implicit / link-based flow (Supabase default "Confirm email" template) ──
  // Supabase redirects with #access_token=...&refresh_token=...&type=signup
  // after verifying the link on their end. We use setSession() to register it.
  const access_token  = hash.get('access_token')
  const refresh_token = hash.get('refresh_token') ?? ''
  if (access_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
    status.value  = data.session ? 'success' : 'error'
    message.value = error?.message ?? ''
    return
  }

  // ── 2. PKCE / code flow ───────────────────────────────────────────
  const code = params.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    status.value  = error ? 'error' : 'success'
    message.value = error?.message ?? ''
    return
  }

  // ── 3. Token-hash OTP flow ────────────────────────────────────────
  const token_hash = params.get('token_hash')
  const type       = params.get('type') as EmailOtpType | null
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    status.value  = error ? 'error' : 'success'
    message.value = error?.message ?? ''
    return
  }

  status.value  = 'error'
  message.value = 'No verification token was found in this link.'
})
</script>

<template>
  <div class="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-24">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 mb-12">
      <svg class="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <span class="font-black text-[18px] tracking-tight gradient-text">Writium</span>
    </a>

    <!-- Card -->
    <div class="bg-white border border-border rounded-2xl shadow-lg p-10 w-full max-w-md text-center">

      <!-- Verifying -->
      <template v-if="status === 'verifying'">
        <div class="w-12 h-12 rounded-full border-4 border-border border-t-accent animate-spin mx-auto mb-6" />
        <h1 class="font-display font-bold text-[22px] text-ink mb-2">Verifying your email…</h1>
        <p class="text-sm text-muted">Please wait a moment.</p>
      </template>

      <!-- Success -->
      <template v-else-if="status === 'success'">
        <div class="w-14 h-14 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6 shadow-[0_4px_18px_rgba(234,88,12,0.35)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" width="26" height="26">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 class="font-display font-bold text-[24px] text-ink mb-3">Email confirmed!</h1>
        <p class="text-[15px] text-ink2 leading-relaxed mb-8">
          Your account is ready. Open the <strong>Writium</strong> desktop app
          and sign in with your email and password to get started.
        </p>
        <a
          href="/"
          class="inline-block gradient-bg text-white font-bold text-[14px] px-8 py-3 rounded-xl no-underline hover:opacity-90 transition-opacity"
        >
          Back to homepage
        </a>
      </template>

      <!-- Error -->
      <template v-else>
        <div class="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 class="font-display font-bold text-[22px] text-ink mb-3">Verification failed</h1>
        <p class="text-[14px] text-ink2 leading-relaxed mb-2">
          This link may have expired or already been used.
        </p>
        <p v-if="message" class="text-[12px] text-muted font-mono bg-[#FBF7F2] border border-border rounded-lg px-3 py-2 mb-8 break-all">
          {{ message }}
        </p>
        <p class="text-[14px] text-ink2 mb-8" v-else>
          Please open Writium and request a new confirmation email.
        </p>
        <a
          href="/"
          class="inline-block text-accent font-bold text-[14px] border border-border px-8 py-3 rounded-xl no-underline hover:border-accent transition-colors"
        >
          Back to homepage
        </a>
      </template>

    </div>

    <p class="text-[12px] text-muted mt-8">
      Need help? Contact support from within the Writium app.
    </p>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 0.8s linear infinite; }
</style>
