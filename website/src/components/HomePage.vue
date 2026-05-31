<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import SiteNav from './SiteNav.vue'
import HeroSection from './HeroSection.vue'
import FeaturesSection from './FeaturesSection.vue'
import HowItWorks from './HowItWorks.vue'
import DownloadSection from './DownloadSection.vue'
import SiteFooter from './SiteFooter.vue'

onMounted(() => {
  nextTick(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.1 },
    )
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
  })
})
</script>

<template>
  <SiteNav />
  <main>
    <HeroSection />
    <FeaturesSection />
    <HowItWorks />
    <DownloadSection />
  </main>
  <SiteFooter />
</template>
