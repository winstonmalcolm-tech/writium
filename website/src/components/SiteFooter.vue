<template>
  <footer class="bg-darker border-t border-[#1E1409]">

    <div class="max-w-6xl mx-auto px-8 py-14 flex justify-between items-start gap-10 border-b border-[#1E1409]">

      <!-- Brand -->
      <div class="max-w-[260px]">
        <div class="flex items-center gap-2 mb-3 cursor-pointer" @click="go('hero')">
          <svg class="w-[18px] h-[18px] text-[#FB923C]" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span class="font-black text-[16px] tracking-tight gradient-text">Writium</span>
        </div>
        <p class="text-[13px] text-[#3C2E1E] leading-relaxed">
          The word processor built for writers who mean it.
        </p>
      </div>

      <!-- Links -->
      <div class="flex gap-14">
        <div class="flex flex-col gap-2.5">
          <span class="text-[10px] font-bold tracking-[0.12em] uppercase text-[#4A3828] mb-1">Product</span>
          <button class="text-[13px] text-[#3C2E1E] text-left hover:text-[#FB923C] transition-colors" @click="go('features')">Features</button>
          <button class="text-[13px] text-[#3C2E1E] text-left hover:text-[#FB923C] transition-colors" @click="go('how')">How it works</button>
          <button class="text-[13px] text-[#3C2E1E] text-left hover:text-[#FB923C] transition-colors" @click="go('download')">Download</button>
        </div>
        <div class="flex flex-col gap-2.5">
          <span class="text-[10px] font-bold tracking-[0.12em] uppercase text-[#4A3828] mb-1">Legal</span>
          <a href="#" class="text-[13px] text-[#3C2E1E] hover:text-[#FB923C] transition-colors">Privacy Policy</a>
          <a href="#" class="text-[13px] text-[#3C2E1E] hover:text-[#FB923C] transition-colors">Terms of Service</a>
        </div>
      </div>

    </div>

    <div class="max-w-6xl mx-auto px-8 py-5">
      <span class="text-[12px] text-[#2C1E10]">© 2026 Writium. All rights reserved.</span>
    </div>

  </footer>
</template>

<script setup lang="ts">
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
</script>
