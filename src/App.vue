<script setup>
import { useRoute } from 'vue-router';
import { watch, nextTick } from 'vue';
import { useMotion } from './composables/useMotion.js';

const route = useRoute();
const { animateIn } = useMotion();

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
