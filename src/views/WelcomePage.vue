<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useMotion } from '../composables/useMotion.js';
import { useKanji } from '../composables/useKanji.js';
import { useSounds } from '../composables/useSounds.js';
import { useRouter } from 'vue-router';

const { animateIn, animateLoading } = useMotion();
const { getSublevelsInfo } = useKanji();
const { playButtonClick, soundEnabled, toggleSound } = useSounds();
const router = useRouter();

// Estados de los modales
const showConfigModal = ref(false);
const showGuideModal = ref(false);
const showAboutModal = ref(false);
const showSublevelModal = ref(false);

// Estado para subniveles
const selectedLevel = ref('');
const availableSublevels = ref([]);
const loadingSublevels = ref(false);

// Funciones para manejar modales
const openConfigModal = () => {
  playButtonClick();
  showConfigModal.value = true;
};

const openGuideModal = () => {
  playButtonClick();
  showGuideModal.value = true;
};

const openAboutModal = () => {
  playButtonClick();
  showAboutModal.value = true;
};

const closeModal = () => {
  showConfigModal.value = false;
  showGuideModal.value = false;
  showAboutModal.value = false;
  showSublevelModal.value = false;
};

// Función para manejar selección de nivel
const handleLevelSelection = async (levelItem) => {
  playButtonClick();
  const level = levelItem.level.toLowerCase();
  
  try {
    // Obtener información de subniveles para el nivel seleccionado
    const info = await getSublevelsInfo(level);
    
    // Si tiene más de un subnivel, mostrar modal de selección
    if (info.totalSublevels > 1) {
      selectedLevel.value = level;
      await loadSublevels(level);
      showSublevelModal.value = true;
    } else {
      // Si solo tiene un subnivel, navegar directamente
      router.push(`/kanji/${level}`);
    }
  } catch (error) {
    console.error('Error checking sublevels for level:', level, error);
    // En caso de error, navegar directamente
    router.push(`/kanji/${level}`);
  }
};

// Función para cargar subniveles
const loadSublevels = async (level) => {
  try {
    loadingSublevels.value = true;
    const info = await getSublevelsInfo(level);
    
    availableSublevels.value = [];
    for (let i = 1; i <= info.totalSublevels; i++) {
      const startIndex = (i - 1) * 100;
      const endIndex = Math.min(startIndex + 100, info.totalKanjis);
      const kanjiCount = endIndex - startIndex;
      
      // Determinar dificultad basada en el subnivel
      let difficulty = 'Básico';
      if (i > Math.ceil(info.totalSublevels / 3)) {
        difficulty = 'Avanzado';
      } else if (i > 1) {
        difficulty = 'Intermedio';
      }
      
      availableSublevels.value.push({
        sublevel: i,
        name: `Subnivel ${i}`,
        description: `Kanjis ${startIndex + 1}-${endIndex}`,
        kanjiCount: kanjiCount,
        difficulty: difficulty
      });
    }
  } catch (error) {
    console.error('Error loading sublevels:', error);
  } finally {
    loadingSublevels.value = false;
  }
};

// Función para seleccionar subnivel
const selectSublevel = (sublevel) => {
  playButtonClick();
  router.push(`/kanji/${selectedLevel.value}?sublevel=${sublevel}`);
  closeModal();
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
    estimated: '~370 kanjis'
  },
  { 
    level: 'JLPT-1', 
    description: 'Nivel experto, para quienes desean alcanzar la fluidez total.',
    kanji: '完璧',
    color: 'from-RojoCarmesi to-cardinal',
    difficulty: 'Experto',
    estimated: '~1200 kanjis'
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
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" 
       style="background: linear-gradient(to bottom right, var(--color-snow), var(--color-Marfil), var(--color-teaGreen));">
    
    <!-- Indicador de sonido -->
    <div class="fixed top-6 right-6 z-20">
      <button
        @click="() => { toggleSound(); playButtonClick(); }"
        class="btn-3d btn-3d-green-floating w-full h-full flex items-center justify-center"
        :title="soundEnabled ? 'Sonido activado - Click para desactivar' : 'Sonido desactivado - Click para activar'"
      >
        <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-music"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13h10v13" /><path d="M9 8h10" /></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
        </svg>
      </button>
    </div>
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 text-8xl font-bold rotate-12" style="color: var(--color-MossGreen);">漢</div>
      <div class="absolute top-32 right-20 text-6xl font-bold -rotate-6" style="color: var(--color-FernGreen);">字</div>
      <div class="absolute bottom-20 left-20 text-7xl font-bold rotate-6" style="color: var(--color-HunterGree);">学</div>
      <div class="absolute bottom-32 right-10 text-5xl font-bold -rotate-12" style="color: var(--color-DarkGreen);">習</div>
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10 max-w-6xl mx-auto text-center">
      
      <!-- Título principal -->
      <div class="main-title mb-8">
        <h1 class="text-7xl md:text-8xl font-bold mb-6 tracking-wide" style="color: var(--color-DarkGreen);">
          漢字を学ぼう
        </h1>
        <h2 class="text-4xl md:text-5xl font-semibold mb-4" style="color: var(--color-HunterGree);">
          Aprende Kanji
        </h2>
      </div>
      
      <!-- Subtítulo -->
      <div class="subtitle mb-12">
        <p class="text-xl md:text-2xl mb-4 leading-relaxed" style="color: var(--color-FernGreen);">
          Domina los caracteres japoneses de forma interactiva
        </p>
        <p class="text-lg" style="color: var(--color-MossGreen);">
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
          <button
            v-else
            @click="handleLevelSelection(item)"
            :class="`level-card btn-3d btn-3d-${item.level.toLowerCase().replace('-', '')} text-center block w-full`"
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

    <!-- Modal de Selección de Subniveles -->
    <div v-if="showSublevelModal" class="fixed inset-0 bg-platinum bg-opacity-100 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar" 
           style="background-color: var(--color-snow); border-color: var(--color-MossGreen); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-2xl font-bold" style="color: var(--color-DarkGreen);">Selecciona un Subnivel</h3>
            <p class="text-sm mt-1" style="color: var(--color-FernGreen);">{{ selectedLevel.toUpperCase() }} está dividido en subniveles para facilitar el aprendizaje</p>
          </div>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-MossGreen);">&times;</button>
        </div>
        
        <div v-if="loadingSublevels" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style="border-color: var(--color-MossGreen);"></div>
          <p style="color: var(--color-FernGreen);">Cargando subniveles...</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="subLevel in availableSublevels"
            :key="subLevel.sublevel"
            @click="selectSublevel(subLevel.sublevel)"
            class="btn-3d btn-3d-green-medium text-left p-6 hover:scale-105 transition-transform duration-200"
          >
            <!-- Número del subnivel -->
            <div class="flex items-center mb-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3" 
                   style="background-color: var(--color-MossGreen); color: var(--color-snow);">
                {{ subLevel.sublevel }}
              </div>
              <h4 class="text-lg font-bold" style="color: var(--color-DarkGreen);">
                {{ subLevel.name }}
              </h4>
            </div>
            
            <!-- Descripción -->
            <p class="text-sm mb-2" style="color: var(--color-FernGreen);">
              {{ subLevel.description }}
            </p>
            
            <!-- Información adicional -->
            <div class="flex justify-between items-center text-xs">
              <span style="color: var(--color-MossGreen);">
                {{ subLevel.kanjiCount }} kanjis
              </span>
              <span class="px-2 py-1 rounded" 
                    style="background-color: var(--color-teaGreen); color: var(--color-DarkGreen);">
                {{ subLevel.difficulty }}
              </span>
            </div>
          </button>
        </div>

        <div class="mt-6 flex gap-3">
          <button @click="closeModal" class="btn-3d btn-3d-green-light flex-1">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración -->
    <div v-if="showConfigModal" class="fixed inset-0 bg-platinum bg-opacity-100 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-md w-full max-h-[80vh] overflow-y-auto custom-scrollbar" 
           style="background-color: var(--color-snow); border-color: var(--color-MossGreen); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--color-DarkGreen);">Configuración</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-MossGreen);">&times;</button>
        </div>
        
        <div class="space-y-6">
          <!-- Configuración de sonido -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Audio</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3" 
                  style="accent-color: var(--color-MossGreen);" 
                  :checked="soundEnabled"
                  @change="toggleSound"
                >
                <span style="color: var(--color-FernGreen);">Efectos de sonido</span>
              </label>
              <div class="text-xs mt-1" style="color: var(--color-Aonobi);">
                Incluye sonidos de botones, respuestas correctas e incorrectas
              </div>
            </div>
          </div>

          <!-- Configuración de dificultad -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Dificultad</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" name="difficulty" value="easy" class="mr-3" style="accent-color: var(--color-MossGreen);">
                <span style="color: var(--color-FernGreen);">Mostrar pistas adicionales</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="difficulty" value="normal" class="mr-3" style="accent-color: var(--color-MossGreen);" checked>
                <span style="color: var(--color-FernGreen);">Dificultad estándar</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="difficulty" value="hard" class="mr-3" style="accent-color: var(--color-MossGreen);">
                <span style="color: var(--color-FernGreen);">Modo experto (sin pistas)</span>
              </label>
            </div>
          </div>

          <!-- Configuración de tema -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Tema</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" name="theme" value="dark" class="mr-3" style="accent-color: var(--color-MossGreen);">
                <span style="color: var(--color-FernGreen);">Tema oscuro</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="theme" value="light" class="mr-3" style="accent-color: var(--color-MossGreen);" checked>
                <span style="color: var(--color-FernGreen);">Tema claro</span>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="() => { playButtonClick(); closeModal(); }" class="btn-3d btn-3d-green-medium flex-1">
            Guardar cambios
          </button>
          <button @click="() => { playButtonClick(); closeModal(); }" class="btn-3d btn-3d-green-light">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Guía de uso -->
    <div v-if="showGuideModal" class="fixed inset-0 bg-platinum bg-opacity-100 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
           style="background-color: var(--color-snow); border-color: var(--color-FernGreen); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--color-DarkGreen);">Guía de uso</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-MossGreen);">&times;</button>
        </div>
        
        <div class="space-y-6" style="color: var(--color-FernGreen);">
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">🎯 Cómo empezar</h4>
            <p class="mb-2">1. Selecciona tu nivel JLPT (desde principiante hasta experto)</p>
            <p class="mb-2">2. Haz clic en el nivel deseado para comenzar a estudiar</p>
            <p>3. Se te presentarán kanjis aleatorios para practicar</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">📚 Sistema de aprendizaje</h4>
            <p class="mb-2"><strong>Lecturas On (音読み):</strong> Pronunciación china del kanji</p>
            <p class="mb-2"><strong>Lecturas Kun (訓読み):</strong> Pronunciación japonesa nativa</p>
            <p class="mb-2"><strong>Significado:</strong> Traducción al español del kanji</p>
            <p>Puedes usar el teclado japonés virtual para practicar la escritura</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">⌨️ Teclado japonés</h4>
            <p class="mb-2">• Haz clic en "Mostrar teclado" para abrir el teclado virtual</p>
            <p class="mb-2">• Usa las teclas para escribir en hiragana y katakana</p>
            <p class="mb-2">• El teclado se adapta automáticamente al campo que estés editando</p>
            <p>• Presiona "Cerrar" para ocultar el teclado</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">🎮 Controles</h4>
            <p class="mb-2">• <kbd class="px-2 py-1 rounded" style="background-color: var(--color-teaGreen); color: var(--color-DarkGreen);">Enter</kbd> - Verificar respuesta</p>
            <p class="mb-2">• <kbd class="px-2 py-1 rounded" style="background-color: var(--color-teaGreen); color: var(--color-DarkGreen);">Escape</kbd> - Cerrar modales</p>
            <p>• <kbd class="px-2 py-1 rounded" style="background-color: var(--color-teaGreen); color: var(--color-DarkGreen);">Tab</kbd> - Navegar entre campos</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">💡 Consejos</h4>
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
    <div v-if="showAboutModal" class="fixed inset-0 bg-platinum bg-opacity-100 flex items-center justify-center z-50 p-4">
      <div class="rounded-3xl border-2 p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
           style="background-color: var(--color-snow); border-color: var(--color-HunterGree); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--color-DarkGreen);">Acerca del proyecto</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--color-MossGreen);">&times;</button>
        </div>
        
        <div class="space-y-6 text-center" style="color: var(--color-FernGreen);">
          <div class="text-6xl mb-4" style="color: var(--color-MossGreen);">漢字を学ぼう</div>
          
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Sobre la aplicación</h4>
            <p class="mb-4">Una aplicación web interactiva diseñada para ayudar a estudiantes de japonés a aprender y practicar kanji de manera efectiva y divertida.</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Características</h4>
            <ul class="text-left space-y-2">
              <li>• Organizado por niveles JLPT (N5 a N1)</li>
              <li>• Teclado japonés virtual integrado</li>
              <li>• Práctica de lecturas On y Kun</li>
              <li>• Interfaz moderna y responsive</li>
              <li>• Sistema de validación inteligente</li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Tecnologías</h4>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-MossGreen); color: var(--color-snow);">Vue 3</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-FernGreen); color: var(--color-snow);">Vite</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-HunterGree); color: var(--color-snow);">Tailwind CSS</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--color-DarkGreen); color: var(--color-Mindaro);">JavaScript</span>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--color-HunterGree);">Versión</h4>
            <p class="text-sm">v1.0.0 - Diciembre 2024</p>
            <p class="text-xs mt-2" style="color: var(--color-MossGreen);">
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