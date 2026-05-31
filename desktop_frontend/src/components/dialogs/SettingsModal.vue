<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Sun, Moon, User, Info } from 'lucide-vue-next'
import CitationStylePicker from '@/components/references/CitationStylePicker.vue'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const settings = useSettingsStore()
const auth     = useAuthStore()
const router   = useRouter()
const activeTab = ref('general')

const tabOptions = [
  { name: 'general', label: 'General', icon: Sun },
  { name: 'account', label: 'Account', icon: User },
  { name: 'about',   label: 'About',   icon: Info },
]

const avatarLetter = computed(() => {
  const email = auth.user?.email ?? ''
  return email.charAt(0).toUpperCase() || '?'
})

async function handleSignOut() {
  await auth.signOut()
  emit('update:show', false)
  router.push('/auth')
}

const fontSizeOptions = [
  { label: '14px', value: 14 },
  { label: '15px', value: 15 },
  { label: '16px (default)', value: 16 },
  { label: '17px', value: 17 },
  { label: '18px', value: 18 },
]

const pageSizeOptions = [
  { label: 'A4  —  210 × 297 mm',      value: 'a4'     },
  { label: 'US Letter  —  8.5 × 11 in', value: 'letter' },
  { label: 'US Legal  —  8.5 × 14 in',  value: 'legal'  },
  { label: 'A3  —  297 × 420 mm',      value: 'a3'     },
]
</script>

<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    title="Settings"
    :style="{ width: '560px' }"
    :bordered="false"
    size="medium"
  >
    <div class="settings-layout">
      <!-- Sidebar tabs -->
      <div class="settings-nav">
        <button
          v-for="tab in tabOptions"
          :key="tab.name"
          class="settings-nav-btn"
          :class="{ 'settings-nav-btn--active': activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          <component :is="tab.icon" :size="14" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Content -->
      <div class="settings-content">
        <!-- General -->
        <template v-if="activeTab === 'general'">
          <div class="settings-section">
            <div class="settings-section-title">Appearance</div>
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-row-label">Theme</span>
                <span class="settings-row-sub">Light or dark interface</span>
              </div>
              <n-button-group>
                <n-button
                  :type="settings.theme === 'light' ? 'primary' : 'default'"
                  size="small"
                  @click="settings.theme = 'light'"
                >
                  <template #icon><Sun :size="13" /></template>
                  Light
                </n-button>
                <n-button
                  :type="settings.theme === 'dark' ? 'primary' : 'default'"
                  size="small"
                  @click="settings.theme = 'dark'"
                >
                  <template #icon><Moon :size="13" /></template>
                  Dark
                </n-button>
              </n-button-group>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-row-label">Editor font size</span>
                <span class="settings-row-sub">Base size for editor content</span>
              </div>
              <n-select
                v-model:value="settings.fontSize"
                :options="fontSizeOptions"
                size="small"
                style="width: 130px"
              />
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-row-label">Page size</span>
                <span class="settings-row-sub">Paper dimensions for the editor canvas</span>
              </div>
              <n-select
                v-model:value="settings.pageSize"
                :options="pageSizeOptions"
                size="small"
                style="width: 200px"
              />
            </div>
          </div>

          <div class="settings-section">
            <div class="settings-section-title">Citations</div>
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-row-label">Default citation style</span>
                <span class="settings-row-sub">Applied to all new citations</span>
              </div>
              <CitationStylePicker />
            </div>
          </div>
        </template>

        <!-- Account -->
        <template v-else-if="activeTab === 'account'">
          <div class="settings-section">
            <div class="settings-section-title">Account</div>
            <template v-if="auth.isAuthenticated">
              <div class="account-card">
                <div class="account-avatar">{{ avatarLetter }}</div>
                <div class="account-info">
                  <span class="account-name">{{ auth.user?.user_metadata?.full_name || auth.user?.email }}</span>
                  <span class="account-email">{{ auth.user?.email }}</span>
                </div>
              </div>
              <n-button type="error" ghost size="small" style="margin-top: 16px" @click="handleSignOut">
                Sign out
              </n-button>
            </template>
            <template v-else>
              <p class="account-guest-note">You are not signed in.</p>
              <n-button type="primary" size="small" @click="() => { emit('update:show', false); router.push('/auth') }">
                Sign in
              </n-button>
            </template>
          </div>
        </template>

        <!-- About -->
        <template v-else-if="activeTab === 'about'">
          <div class="settings-section">
            <div class="about-card">
              <div class="about-logo">Writium</div>
              <div class="about-version">Version 0.1.0</div>
              <p class="about-desc">
                A desktop word processor for students, researchers, and professional writers.
                Combines a rich text editor with AI-assisted writing tools, academic reference
                management, bibliography generation, humanization, and plagiarism detection.
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.settings-layout {
  display: flex;
  gap: 0;
  min-height: 360px;
  margin: -12px -24px -20px;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 8px;
  border-right: 1px solid var(--border-color);
  width: 130px;
  flex-shrink: 0;
}

.settings-nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-family: 'Lato', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}
.settings-nav-btn:hover {
  background: var(--panel-bg);
  color: var(--text-primary);
}
.settings-nav-btn--active {
  background: var(--accent-light);
  color: var(--accent);
}

.settings-content {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
}
.settings-section:last-child { margin-bottom: 0; }

.settings-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}
.settings-row:last-child { border-bottom: none; }

.settings-row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.settings-row-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.settings-row-sub { font-size: 11px; color: var(--text-muted); }

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.settings-field:last-child { margin-bottom: 0; }

.field-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.field-hint { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

.account-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--panel-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.account-info { display: flex; flex-direction: column; gap: 2px; }
.account-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.account-email { font-size: 12px; color: var(--text-muted); }

.account-guest-note { font-size: 13px; color: var(--text-muted); margin: 0 0 12px; }

.about-card { display: flex; flex-direction: column; gap: 8px; }
.about-logo { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.about-version { font-size: 12px; color: var(--text-muted); }
.about-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 4px 0 0; }
</style>
