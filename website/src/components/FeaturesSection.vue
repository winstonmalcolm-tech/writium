<script setup lang="ts">
const features = [
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 4 8.5 15.5m6.5-6.5 3-3"/></svg>`,
    title: 'AI Writing Assistant',
    desc: 'Type /ai anywhere to summon the command palette. Suggest, rephrase, humanize, expand, summarize, or fix grammar — powered by Gemini 2.5 Flash.',
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><circle cx="14" cy="10" r="2"/><path d="m19 15.5-2-2"/></svg>`,
    title: 'Academic References',
    desc: 'Search Semantic Scholar, OpenAlex, and Crossref simultaneously. Find any paper, book, or source and insert a formatted citation in seconds.',
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
    title: 'Citation Styles',
    desc: 'Switch between APA 7, MLA 9, Chicago 17th, Harvard, and IEEE at any time. Every citation and bibliography entry re-renders live.',
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
    title: 'Plagiarism Checker',
    desc: "Winnowing fingerprinting and TF-IDF similarity against live web sources. Sources you've already cited are automatically excluded from your score.",
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>`,
    title: '.docx Import & Export',
    desc: 'Open existing Word documents and export finished work as fully compatible .docx files — bibliography included — ready for submission.',
  },
  {
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    title: 'Bibliography Generator',
    desc: 'Your bibliography page is automatically assembled and synced with every citation in your document. Change style and it updates everywhere instantly.',
  },
]
</script>

<template>
  <section id="features" class="bg-dark py-28 px-8">
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-16 reveal">
        <span class="inline-block text-accent text-[11px] font-bold tracking-[0.12em] uppercase mb-4">Features</span>
        <h2 class="font-display font-extrabold text-warm leading-tight tracking-tight mb-4"
          style="font-size: clamp(30px, 4vw, 46px);">
          Everything you need to write,<br>cite, and publish.
        </h2>
        <p class="text-dim text-base max-w-xl mx-auto leading-relaxed">
          Writium brings together the tools academic writers actually need — without juggling separate apps.
        </p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(f, i) in features"
          :key="i"
          class="reveal bg-panel border border-border rounded-xl p-7 transition-all duration-200 group hover:-translate-y-1 hover:border-[rgba(234,88,12,0.4)] hover:shadow-[0_8px_32px_rgba(234,88,12,0.13)]"
          :class="`delay-${(i % 3) + 1}`"
        >
          <!-- Icon -->
          <div class="w-11 h-11 rounded-[10px] bg-[rgba(234,88,12,0.09)] border border-[rgba(234,88,12,0.16)] flex items-center justify-center mb-5 text-accent transition-colors group-hover:bg-[rgba(234,88,12,0.15)] group-hover:border-[rgba(234,88,12,0.32)]"
            v-html="f.svg" />
          <h3 class="text-[15px] font-bold text-ink tracking-tight mb-2.5">{{ f.title }}</h3>
          <p class="text-[13.5px] leading-relaxed text-ink2">{{ f.desc }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* Make SVG icons size correctly when rendered via v-html */
:deep(svg) { width: 20px; height: 20px; }
</style>
