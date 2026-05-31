<script setup lang="ts">
import { NButton } from 'naive-ui'
import AppMockup from './AppMockup.vue'

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
</script>

<template>
  <section id="hero" class="relative min-h-screen flex items-center bg-cream overflow-hidden pt-16">

    <!-- Ambient glow -->
    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(234,88,12,0.13) 0%, rgba(249,115,22,0.05) 50%, transparent 72%);" />

    <div class="max-w-6xl mx-auto px-8 w-full py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

      <!-- Copy -->
      <div class="max-w-[560px]">

        <div class="reveal inline-flex items-center gap-2 text-accent border border-[rgba(234,88,12,0.25)] bg-[rgba(234,88,12,0.07)] text-[11px] font-bold tracking-[0.08em] uppercase px-3 py-1.5 rounded-full mb-7">
          ✦ Now available for Windows
        </div>

        <h1 class="reveal delay-1 font-display font-extrabold leading-[1.08] tracking-tight text-ink mb-6"
          style="font-size: clamp(40px, 5vw, 66px);">
          Write smarter.<br>
          Cite better.<br>
          <em class="not-italic gradient-text">Publish with confidence.</em>
        </h1>

        <p class="reveal delay-2 text-[17px] leading-relaxed text-ink2 mb-9 max-w-[460px]">
          The AI-powered word processor built for academic and professional writers.
          Smart citations, plagiarism detection, and AI writing tools — all in one place.
        </p>

        <div class="reveal delay-3 flex items-center gap-4 flex-wrap mb-5">
          <n-button
            type="primary"
            size="large"
            @click="go('download')"
            :style="{ boxShadow: '0 4px 20px rgba(234,88,12,0.38)', fontWeight: '700' }"
          >
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </template>
            Download for Windows
          </n-button>

          <button
            class="text-[15px] font-bold text-ink border border-border px-6 py-2.5 rounded-[10px] transition-colors hover:border-accent hover:text-accent"
            @click="go('features')"
          >
            See features →
          </button>
        </div>

        <p class="reveal delay-4 text-[12px] text-muted">Free · Windows 10 / 11 · No subscription required</p>
      </div>

      <!-- Mockup -->
      <div class="reveal delay-2">
        <AppMockup />
      </div>

    </div>
  </section>
</template>
