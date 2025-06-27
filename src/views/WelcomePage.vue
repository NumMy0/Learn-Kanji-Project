<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useMotion } from '../composables/useMotion.js';

const { animateIn, animateLoading } = useMotion();

const kanjiLevels = ref([
  { 
    level: 'JLPT-5', 
    description: 'Nivel básico, para aquellos que desean aprender los fundamentos del japonés.',
    kanji: '日本語',
    color: 'from-green-400 to-green-600',
    difficulty: 'Fácil',
    estimated: '~80 kanjis'
  },
  { 
    level: 'JLPT-4', 
    description: 'Nivel intermedio, para quienes ya conocen lo básico.',
    kanji: '学習',
    color: 'from-blue-400 to-blue-600',
    difficulty: 'Intermedio',
    estimated: '~160 kanjis'
  },
  { 
    level: 'JLPT-3', 
    description: 'Nivel avanzado, para estudiantes con buen conocimiento de kanjis.',
    kanji: '勉強',
    color: 'from-yellow-400 to-orange-500',
    difficulty: 'Avanzado',
    estimated: '~370 kanjis'
  },
  { 
    level: 'JLPT-2', 
    description: 'Nivel superior, para quienes buscan un dominio más profundo.',
    kanji: '準備',
    color: 'from-purple-400 to-purple-600',
    difficulty: 'Superior',
    estimated: '~1,030 kanjis'
  },
  { 
    level: 'JLPT-1', 
    description: 'Nivel experto, para quienes desean alcanzar la fluidez total.',
    kanji: '完璧',
    color: 'from-red-500 to-red-700',
    difficulty: 'Experto',
    estimated: '~2,136 kanjis'
  }
]);

onMounted(async () => {
  await nextTick();
  
  // Animar título principal
  animateIn('.main-title', {
    y: [-50, 0],
    opacity: [0, 1],
    duration: 0.8,
    easing: 'ease-out'
  });
  
  // Animar subtítulo
  setTimeout(() => {
    animateIn('.subtitle', {
      y: [30, 0],
      opacity: [0, 1],
      duration: 0.6,
      easing: 'ease-out'
    });
  }, 200);
  
  // Animar cards con stagger
  setTimeout(() => {
    animateIn('.level-card', {
      y: [50, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 0.5,
      easing: 'ease-out',
      delay: (i) => i * 0.1
    });
  }, 400);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background via-background to-grisTinta flex flex-col items-center justify-center p-6 relative overflow-hidden">
    
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-10 left-10 text-8xl text-text font-bold rotate-12">漢</div>
      <div class="absolute top-32 right-20 text-6xl text-text font-bold -rotate-6">字</div>
      <div class="absolute bottom-20 left-20 text-7xl text-text font-bold rotate-6">学</div>
      <div class="absolute bottom-32 right-10 text-5xl text-text font-bold -rotate-12">習</div>
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10 max-w-6xl mx-auto text-center">
      
      <!-- Título principal -->
      <div class="main-title mb-8">
        <h1 class="text-7xl md:text-8xl text-RojoCarmesi font-bold mb-6 tracking-wide">
          漢字を学ぼう
        </h1>
        <h2 class="text-4xl md:text-5xl text-text font-semibold mb-4">
          Aprende Kanji
        </h2>
      </div>
      
      <!-- Subtítulo -->
      <div class="subtitle mb-12">
        <p class="text-xl md:text-2xl text-text/80 mb-4 leading-relaxed">
          Domina los caracteres japoneses de forma interactiva
        </p>
        <p class="text-lg text-text/70">
          Selecciona tu nivel JLPT y comienza tu viaje hacia la fluidez
        </p>
      </div>

      <!-- Grid de niveles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <router-link
          v-for="(item, index) in kanjiLevels"
          :key="item.level"
          :to="`/kanji/${item.level.toLowerCase()}`"
          class="level-card group"
        >
          <div class="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 overflow-hidden">
            
            <!-- Gradiente de fondo -->
            <div :class="`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`"></div>
            
            <!-- Contenido de la tarjeta -->
            <div class="relative z-10">
              
              <!-- Kanji decorativo -->
              <div class="text-4xl font-bold text-gray-300 mb-3 group-hover:text-gray-400 transition-colors">
                {{ item.kanji }}
              </div>
              
              <!-- Nivel -->
              <h3 class="text-2xl font-bold text-gray-800 mb-2">
                {{ item.level }}
              </h3>
              
              <!-- Dificultad y estimación -->
              <div class="flex justify-between items-center mb-3">
                <span :class="`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${item.color}`">
                  {{ item.difficulty }}
                </span>
                <span class="text-sm text-gray-600">
                  {{ item.estimated }}
                </span>
              </div>
              
              <!-- Descripción -->
              <p class="text-gray-600 leading-relaxed text-sm">
                {{ item.description }}
              </p>
              
              <!-- Indicador de acción -->
              <div class="mt-4 flex items-center justify-center text-Benibana group-hover:text-[#740615] transition-colors">
                <span class="text-sm font-semibold mr-2">Comenzar</span>
                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
              
            </div>
          </div>
        </router-link>
      </div>

      <div class="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">¿Qué aprenderás?</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>Reconocimiento de kanjis</span>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Pronunciación correcta</span>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span>Significados en español</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>