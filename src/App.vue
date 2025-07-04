<script setup>
import { useRoute } from 'vue-router';
import { watch, nextTick, onMounted } from 'vue';
import { useMotion } from './composables/useMotion.js';
import { useSvgFix } from './composables/useSvgFix.js';

const route = useRoute();
const { animateIn } = useMotion();
const { setupSvgFixer } = useSvgFix();

// Initialize SVG fixer to fix any invalid viewBox values
onMounted(() => {
  // This will fix SVG viewBox issues including "0 0 100% 3" which causes errors
  setupSvgFixer();
});

// Animar transiciones de ruta
watch(() => route.path, async () => {
  await nextTick();
  animateIn('.route-content', {
    opacity: [0, 1],
    x: [50, 0],
    duration: 0.3,
    easing: 'ease-out'
  });
});
</script>

<template>
  <div class="w-full h-screen">
    <div class="route-content">
      <router-view></router-view>
    </div>
  </div>
</template>
