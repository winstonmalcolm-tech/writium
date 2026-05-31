<template>
  <section id="download" class="relative bg-dark py-32 px-8 text-center overflow-hidden">

    <!-- Ambient glow -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[560px] h-[560px] rounded-full"
        style="background: radial-gradient(circle, rgba(234,88,12,0.22) 0%, transparent 70%);" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto reveal">

      <span class="inline-block text-[#FB923C] text-[11px] font-bold tracking-[0.12em] uppercase mb-6">Download</span>

      <h2 class="font-display font-extrabold text-warm leading-[1.1] tracking-tight mb-4"
        style="font-size: clamp(34px, 5vw, 58px);">
        Ready to write smarter?
      </h2>
      <p class="text-dim text-[16px] mb-12 leading-relaxed">
        Free to download. No subscription. No account required to start writing.
      </p>

      <!-- Download button -->
      <a
        href="#"
        class="inline-flex flex-col items-center gap-1 gradient-bg text-white font-bold text-[17px] px-14 py-5 rounded-2xl no-underline transition-all duration-200 hover:-translate-y-1"
        style="box-shadow: 0 4px 24px rgba(234,88,12,0.45), 0 12px 48px rgba(234,88,12,0.22); letter-spacing: -0.01em;"
        @click.prevent
      >
        <span class="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download for Windows
        </span>
        <span class="text-[11px] font-normal opacity-75 tracking-wide">v0.1.0 · Windows 10 / 11 (64-bit)</span>
      </a>

      <!-- System requirements -->
      <div class="flex items-center justify-center gap-8 flex-wrap mt-10">
        <div class="flex items-center gap-2 text-[12px] text-[#6B5C4A]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Windows 10 or 11 (64-bit)
        </div>
        <div class="flex items-center gap-2 text-[12px] text-[#6B5C4A]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          4 GB RAM minimum
        </div>
        <div class="flex items-center gap-2 text-[12px] text-[#6B5C4A]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
          </svg>
          500 MB disk space
        </div>
      </div>

    </div>
  </section>
</template>
