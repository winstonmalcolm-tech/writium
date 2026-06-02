<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { FileText, Mail, Lock, ArrowRight, Minus, Square, Maximize2, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const isMaximized = ref(false)

function winMinimize() { window.electronAPI?.minimize() }
function winMaximize() { window.electronAPI?.maximize() }
function winClose()    { window.electronAPI?.close() }

window.electronAPI?.onMaximizeChange((val) => { isMaximized.value = val })

const router  = useRouter()
const message = useMessage()
const auth    = useAuthStore()

const mode          = ref<'login' | 'signup'>('login')
const email         = ref('')
const password      = ref('')
const name          = ref('')
const loading       = ref(false)
const googleLoading = ref(false)

async function handleGoogle() {
  googleLoading.value = true
  try {
    await auth.signInWithGoogle()
    // Supabase redirects the browser — no further action needed here
  } catch (err: any) {
    message.error(err.message ?? 'Google sign-in failed')
    googleLoading.value = false
  }
}

async function handleSubmit() {
  if (!email.value || !password.value) {
    message.warning('Please fill in all fields')
    return
  }
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.signIn(email.value, password.value)
      message.success('Welcome back!')
    } else {
      await auth.signUp(email.value, password.value, name.value || undefined)
      message.success('Account created! Check your email to confirm.')
    }
    router.push('/')
  } catch (err: any) {
    message.error(err.message ?? 'Authentication failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Frameless window titlebar — matches EditorView chrome -->
  <div class="auth-titlebar">
    <span class="auth-titlebar-brand">
      <FileText :size="14" class="auth-brand-icon" />
      Writium
    </span>
    <div class="auth-win-controls">
      <button class="win-btn win-btn--min" @click="winMinimize" title="Minimise">
        <Minus :size="12" />
      </button>
      <button class="win-btn win-btn--max" @click="winMaximize" :title="isMaximized ? 'Restore' : 'Maximise'">
        <Maximize2 v-if="isMaximized" :size="11" />
        <Square v-else :size="11" />
      </button>
      <button class="win-btn win-btn--close" @click="winClose" title="Close">
        <X :size="12" />
      </button>
    </div>
  </div>

  <div class="auth-shell">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <FileText :size="28" />
        <span>Writium</span>
      </div>

      <h1 class="auth-heading">
        {{ mode === 'login' ? 'Sign in to your account' : 'Create your account' }}
      </h1>
      <p class="auth-sub">
        {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
        <button class="auth-link" @click="mode = mode === 'login' ? 'signup' : 'login'">
          {{ mode === 'login' ? 'Sign up' : 'Sign in' }}
        </button>
      </p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <n-form-item v-if="mode === 'signup'" label="Full name" :show-feedback="false">
          <n-input v-model:value="name" placeholder="Your name" size="large">
            <template #prefix><Mail :size="14" /></template>
          </n-input>
        </n-form-item>

        <n-form-item label="Email address" :show-feedback="false">
          <n-input v-model:value="email" type="email" placeholder="you@university.edu" size="large">
            <template #prefix><Mail :size="14" /></template>
          </n-input>
        </n-form-item>

        <n-form-item label="Password" :show-feedback="false">
          <n-input v-model:value="password" type="password" placeholder="••••••••" size="large" show-password-on="click">
            <template #prefix><Lock :size="14" /></template>
          </n-input>
        </n-form-item>

        <n-button
          type="primary"
          size="large"
          block
          :loading="loading"
          attr-type="submit"
          class="auth-btn"
        >
          {{ mode === 'login' ? 'Sign in' : 'Create account' }}
          <template #icon><ArrowRight :size="16" /></template>
        </n-button>
      </form>

      <div class="auth-divider"><span>or</span></div>

      <button class="google-btn" :disabled="googleLoading" @click="handleGoogle">
        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{{ googleLoading ? 'Redirecting…' : 'Continue with Google' }}</span>
      </button>

      <div class="auth-divider"><span>or continue without an account</span></div>

      <n-button size="large" block @click="router.push('/')">
        Continue as guest
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.auth-titlebar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--titlebar-bg);
  border-bottom: 1px solid var(--titlebar-border);
  -webkit-app-region: drag;
  z-index: 100;
}

/* Orange accent line — mirrors the editor titlebar */
.auth-titlebar::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; right: 0;
  height: 2px;
  background: var(--gradient-accent);
}

.auth-titlebar-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-brand-icon {
  color: var(--accent);
  -webkit-text-fill-color: initial;
}

.auth-win-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.win-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  border-radius: 0;
}
.win-btn:hover { background: var(--panel-bg); color: var(--text-primary); }
.win-btn--close:hover { background: #e81123; color: #fff; }

.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--editor-bg);
  padding: 44px 24px 24px; /* top = titlebar height */
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--editor-page-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-lg);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  color: var(--accent);
  margin-bottom: 28px;
}

.auth-heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.auth-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 28px;
}

.auth-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  text-decoration: underline;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.auth-btn {
  margin-top: 4px;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;
  font-size: 12px;
  color: var(--text-muted);
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--editor-page-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Lato', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.google-btn:hover:not(:disabled) {
  background: var(--panel-bg);
  border-color: var(--accent);
}
.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.google-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
