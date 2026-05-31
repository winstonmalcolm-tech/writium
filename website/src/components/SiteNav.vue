<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NButton } from 'naive-ui'

const scrolled = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 48 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled
      ? 'bg-cream/90 backdrop-blur-sm border-b border-border shadow-sm'
      : 'bg-transparent'"
  >
    <div class="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

      <!-- Logo -->
      <button class="flex items-center gap-2 cursor-pointer" @click="go('hero')">
        <svg class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span class="font-black text-[17px] tracking-tight gradient-text">Writium</span>
      </button>

      <!-- Links -->
      <div class="flex items-center gap-1">
        <button
          class="px-3 py-2 text-sm font-semibold text-ink2 rounded-lg transition-colors hover:text-ink hover:bg-[rgba(234,88,12,0.06)]"
          @click="go('features')"
        >Features</button>
        <button
          class="px-3 py-2 text-sm font-semibold text-ink2 rounded-lg transition-colors hover:text-ink hover:bg-[rgba(234,88,12,0.06)]"
          @click="go('how')"
        >How it works</button>
        <n-button type="primary" size="small" class="ml-2" @click="go('download')">
          Download
        </n-button>
      </div>

    </div>
  </nav>
</template>
