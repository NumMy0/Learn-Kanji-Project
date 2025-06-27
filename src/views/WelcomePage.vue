<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useMotion } from '../composables/useMotion.js';

const { animateIn, animateLoading } = useMotion();

const kanjiLevels = ref([
  { 
    level: 'JLPT-5', 
    description: 'Nivel básico, para aquellos que desean aprender los fundamentos del japonés.',
    kanji: '日本語',
    color: 'from-verdeMatcha to-azulIndigo',
    difficulty: 'Fácil',
    estimated: '~80 kanjis'
  },
  { 
    level: 'JLPT-4', 
    description: 'Nivel intermedio, para quienes ya conocen lo básico.',
    kanji: '学習',
    color: 'from-airForceBlue to-Aonobi',
    difficulty: 'Intermedio',
    estimated: '~160 kanjis'
  },
  { 
    level: 'JLPT-3', 
    description: 'Nivel avanzado, para estudiantes con buen conocimiento de kanjis.',
    kanji: '勉強',
    color: 'from-coquelicot to-cardinal',
    difficulty: 'Avanzado',
    estimated: '~370 kanjis'
  },
  { 
    level: 'JLPT-2', 
    description: 'Nivel superior, para quienes buscan un dominio más profundo.',
    kanji: '準備',
    color: 'from-Benibana to-firebrick',
    difficulty: 'Superior',
    estimated: '~1,030 kanjis'
  },
  { 
    level: 'JLPT-1', 
    description: 'Nivel experto, para quienes desean alcanzar la fluidez total.',
    kanji: '完璧',
    color: 'from-RojoCarmesi to-cardinal',
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
  <div class="min-h-screen bg-gradient-to-br from-background via-grisTinta to-GrisTintaClaro flex flex-col items-center justify-center p-6 relative overflow-hidden">
    
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-10 left-10 text-8xl text-timberWolf font-bold rotate-12">漢</div>
      <div class="absolute top-32 right-20 text-6xl text-timberWolf font-bold -rotate-6">字</div>
      <div class="absolute bottom-20 left-20 text-7xl text-timberWolf font-bold rotate-6">学</div>
      <div class="absolute bottom-32 right-10 text-5xl text-timberWolf font-bold -rotate-12">習</div>
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10 max-w-6xl mx-auto text-center">
      
      <!-- Título principal -->
      <div class="main-title mb-8">
        <h1 class="text-7xl md:text-8xl text-RojoCarmesi font-bold mb-6 tracking-wide">
          漢字を学ぼう
        </h1>
        <h2 class="text-4xl md:text-5xl text-snow font-semibold mb-4">
          Aprende Kanji
        </h2>
      </div>
      
      <!-- Subtítulo -->
      <div class="subtitle mb-12">
        <p class="text-xl md:text-2xl text-platinum mb-4 leading-relaxed">
          Domina los caracteres japoneses de forma interactiva
        </p>
        <p class="text-lg text-timberWolf">
          Selecciona tu nivel JLPT y comienza tu viaje hacia la fluidez
        </p>
      </div>

      <!-- Grid de niveles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <router-link
          v-for="(item, index) in kanjiLevels"
          :key="item.level"
          :to="`/kanji/${item.level.toLowerCase()}`"
          :class="`level-card btn-3d btn-3d-${item.level.toLowerCase().replace('-', '')} text-center block`"
        >
          <!-- Kanji decorativo -->
          <div class="text-3xl font-bold mb-2">
            {{ item.kanji }}
          </div>
          
          <!-- Nivel -->
          <h3 class="text-xl font-bold mb-2">
            {{ item.level }}
          </h3>
          
          <!-- Dificultad -->
          <div class="text-sm font-semibold mb-2">
            {{ item.difficulty }}
          </div>
          
          <!-- Estimación -->
          <div class="text-xs opacity-75">
            {{ item.estimated }}
          </div>
        </router-link>
      </div>

      <!-- Información adicional -->
      <div class="bg-Marfil/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-platinum mb-8">
        <h3 class="text-xl font-semibold text-grisTinta mb-3">¿Qué aprenderás?</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-azulIndigo">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-MossGreen rounded-full mr-3"></div>
            <span>Reconocimiento de kanjis</span>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-FernGreen rounded-full mr-3"></div>
            <span>Significados en español</span>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-HunterGree rounded-full mr-3"></div>
            <span>Práctica interactiva</span>
          </div>
        </div>
      </div>

      <!-- Botones de acción adicionales -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="btn-3d btn-3d-green-light">
          Guía de uso
        </button>
        <button class="btn-3d btn-3d-green-medium">
          Acerca del proyecto
        </button>
      </div>

    </div>
  </div>
</template>