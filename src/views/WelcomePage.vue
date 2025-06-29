<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useMotion } from '../composables/useMotion.js';

const { animateIn, animateLoading } = useMotion();

// Estados de los modales
const showConfigModal = ref(false);
const showGuideModal = ref(false);
const showAboutModal = ref(false);

// Funciones para manejar modales
const openConfigModal = () => {
  showConfigModal.value = true;
};

const openGuideModal = () => {
  showGuideModal.value = true;
};

const openAboutModal = () => {
  showAboutModal.value = true;
};

const closeModal = () => {
  showConfigModal.value = false;
  showGuideModal.value = false;
  showAboutModal.value = false;
};

// Cerrar modal al presionar Escape
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

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
  }, 
  {
    level: 'Configuración',
    description: 'Ajustes de la aplicación, personaliza tu experiencia de aprendizaje.',
    kanji: '設定',
    color: 'from-MossGreen to-HunterGree',
    difficulty: 'Ajustes',
    estimated: '',
    isConfig: true
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
        <template v-for="(item, index) in kanjiLevels" :key="item.level">
          <!-- Botón de configuración especial -->
          <button
            v-if="item.isConfig"
            @click="openConfigModal"
            class="level-card btn-3d btn-3d-green-medium text-center block"
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
          </button>
          
          <!-- Enlaces regulares de niveles JLPT -->
          <router-link
            v-else
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
        </template>
      </div>
      
      <!-- Botones de acción adicionales -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center p-3">
        <button @click="openGuideModal" class="btn-3d btn-3d-green-light">
          Guía de uso
        </button>
        <button @click="openAboutModal" class="btn-3d btn-3d-green-medium">
          Acerca del proyecto
        </button>
      </div>

    </div>

    <!-- Modal de Configuración -->
    <div v-if="showConfigModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-md w-full max-h-[80vh] overflow-y-auto custom-scrollbar" 
           style="background-color: var(--color-background); border-color: var(--color-MossGreen);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--color-snow);">Configuración</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-timberWolf);">&times;</button>
        </div>
        
        <div class="space-y-6">
          <!-- Configuración de sonido -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Audio</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" class="mr-3" style="accent-color: var(--color-verdeMatcha);" checked>
                <span style="color: var(--color-platinum);">Reproducir sonidos de pronunciación</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-3" style="accent-color: var(--color-verdeMatcha);" checked>
                <span style="color: var(--color-platinum);">Efectos de sonido de la interfaz</span>
              </label>
            </div>
          </div>

          <!-- Configuración de dificultad -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Dificultad</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" name="difficulty" value="easy" class="mr-3" style="accent-color: var(--color-verdeMatcha);">
                <span style="color: var(--color-platinum);">Mostrar pistas adicionales</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="difficulty" value="normal" class="mr-3" style="accent-color: var(--color-verdeMatcha);" checked>
                <span style="color: var(--color-platinum);">Dificultad estándar</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="difficulty" value="hard" class="mr-3" style="accent-color: var(--color-verdeMatcha);">
                <span style="color: var(--color-platinum);">Modo experto (sin pistas)</span>
              </label>
            </div>
          </div>

          <!-- Configuración de tema -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Tema</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" name="theme" value="dark" class="mr-3" style="accent-color: var(--color-verdeMatcha);" checked>
                <span style="color: var(--color-platinum);">Tema oscuro</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="theme" value="light" class="mr-3" style="accent-color: var(--color-verdeMatcha);">
                <span style="color: var(--color-platinum);">Tema claro</span>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="closeModal" class="btn-3d btn-3d-green-medium flex-1">
            Guardar cambios
          </button>
          <button @click="closeModal" class="btn-3d btn-3d-green-light">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Guía de uso -->
    <div v-if="showGuideModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
           style="background-color: var(--color-background); border-color: var(--color-azulIndigo);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--color-snow);">Guía de uso</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-timberWolf);">&times;</button>
        </div>
        
        <div class="space-y-6" style="color: var(--color-platinum);">
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">🎯 Cómo empezar</h4>
            <p class="mb-2">1. Selecciona tu nivel JLPT (desde principiante hasta experto)</p>
            <p class="mb-2">2. Haz clic en el nivel deseado para comenzar a estudiar</p>
            <p>3. Se te presentarán kanjis aleatorios para practicar</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">📚 Sistema de aprendizaje</h4>
            <p class="mb-2"><strong>Lecturas On (音読み):</strong> Pronunciación china del kanji</p>
            <p class="mb-2"><strong>Lecturas Kun (訓読み):</strong> Pronunciación japonesa nativa</p>
            <p class="mb-2"><strong>Significado:</strong> Traducción al español del kanji</p>
            <p>Puedes usar el teclado japonés virtual para practicar la escritura</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">⌨️ Teclado japonés</h4>
            <p class="mb-2">• Haz clic en "Mostrar teclado" para abrir el teclado virtual</p>
            <p class="mb-2">• Usa las teclas para escribir en hiragana y katakana</p>
            <p class="mb-2">• El teclado se adapta automáticamente al campo que estés editando</p>
            <p>• Presiona "Cerrar" para ocultar el teclado</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">🎮 Controles</h4>
            <p class="mb-2">• <kbd class="px-2 py-1 rounded" style="background-color: var(--color-grisTinta);">Enter</kbd> - Verificar respuesta</p>
            <p class="mb-2">• <kbd class="px-2 py-1 rounded" style="background-color: var(--color-grisTinta);">Escape</kbd> - Cerrar modales</p>
            <p>• <kbd class="px-2 py-1 rounded" style="background-color: var(--color-grisTinta);">Tab</kbd> - Navegar entre campos</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">💡 Consejos</h4>
            <p class="mb-2">• Practica regularmente para mejorar la retención</p>
            <p class="mb-2">• No te preocupes por los errores, son parte del aprendizaje</p>
            <p>• Usa la configuración para ajustar la dificultad a tu nivel</p>
          </div>
        </div>

        <div class="mt-8">
          <button @click="closeModal" class="btn-3d btn-3d-blue w-full">
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Acerca del proyecto -->
    <div v-if="showAboutModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
           style="background-color: var(--color-background); border-color: var(--color-RojoCarmesi);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--color-snow);">Acerca del proyecto</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-timberWolf);">&times;</button>
        </div>
        
        <div class="space-y-6 text-center" style="color: var(--color-platinum);">
          <div class="text-6xl mb-4">漢字を学ぼう</div>
          
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Sobre la aplicación</h4>
            <p class="mb-4">Una aplicación web interactiva diseñada para ayudar a estudiantes de japonés a aprender y practicar kanji de manera efectiva y divertida.</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Características</h4>
            <ul class="text-left space-y-2">
              <li>• Organizado por niveles JLPT (N5 a N1)</li>
              <li>• Teclado japonés virtual integrado</li>
              <li>• Práctica de lecturas On y Kun</li>
              <li>• Interfaz moderna y responsive</li>
              <li>• Sistema de validación inteligente</li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Tecnologías</h4>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-verdeMatcha); color: var(--color-background);">Vue 3</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-azulIndigo); color: var(--color-snow);">Vite</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-RojoCarmesi); color: var(--color-snow);">Tailwind CSS</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-MossGreen); color: var(--color-snow);">JavaScript</span>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-snow);">Versión</h4>
            <p class="text-sm">v1.0.0 - Diciembre 2024</p>
            <p class="text-xs mt-2" style="color: var(--color-timberWolf);">
              Hecho con ❤️ para la comunidad de estudiantes de japonés
            </p>
          </div>
        </div>

        <div class="mt-8">
          <button @click="closeModal" class="btn-3d btn-3d-red w-full">
            Cerrar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>