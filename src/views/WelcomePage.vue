<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMotion } from '../composables/useMotion.js';
import { useKanji } from '../composables/useKanji.js';
import { useSounds } from '../composables/useSounds.js';
import { useTheme } from '../composables/useTheme.js';
import { useCursorTrail } from '../composables/useCursorTrail.js';
import { useModals } from '../composables/useModals.js';
import { useLevelSelection } from '../composables/useLevelSelection.js';
import { useJLPTLevels } from '../composables/useJLPTLevels.js';
import { useWelcomeAnimations } from '../composables/useWelcomeAnimations.js';
import { useI18n } from '../composables/useI18n.js';

const router = useRouter();

// Usar composables
const { animateIn } = useMotion();
const { getSublevelsInfo } = useKanji();
const { playButtonClick, soundEnabled, toggleSound } = useSounds();
const { currentTheme, isDarkMode, themeIcon, toggleTheme, setTheme } = useTheme();
const { cursorTrails, initCursorTrail, cleanupCursorTrail } = useCursorTrail();
const { kanjiLevels } = useJLPTLevels();
const { playWelcomeAnimations } = useWelcomeAnimations(animateIn);
const { t, tInterpolate, toggleLanguage, languageFlag, languageName } = useI18n();

// Usar composable de modales
const {
  showConfigModal,
  showGuideModal,
  showAboutModal,
  showSublevelModal,
  openConfigModal,
  openGuideModal,
  openAboutModal,
  openSublevelModal,
  closeModal,
  handleKeydown
} = useModals();

// Función para copiar el correo electrónico al portapapeles
const copyEmail = () => {
  const email = "santiago.rodriguez9@utp.edu.co";
  navigator.clipboard.writeText(email)
    .then(() => {
      alert(t('emailCopied'));
      playButtonClick();
    })
    .catch(err => {
      console.error('Error al copiar el correo: ', err);
      alert(t('emailCopyError'));
    });
};

// Usar composable de selección de niveles
const {
  selectedLevel,
  availableSublevels,
  loadingSublevels,
  handleLevelSelection,
  selectSublevel
} = useLevelSelection(getSublevelsInfo, router);

// Funciones wrapper para pasar dependencias a los composables
const handleLevelSelectionWrapper = (levelItem) => {
  handleLevelSelection(levelItem, playButtonClick, openSublevelModal);
};

const selectSublevelWrapper = (sublevel) => {
  selectSublevel(sublevel, playButtonClick, closeModal);
};

const openConfigModalWrapper = () => {
  openConfigModal(playButtonClick);
};

const openGuideModalWrapper = () => {
  openGuideModal(playButtonClick);
};

const openAboutModalWrapper = () => {
  openAboutModal(playButtonClick);
};

// Lifecycle hooks
onMounted(async () => {
  // Event listeners para el teclado
  document.addEventListener('keydown', handleKeydown);
  
  // Inicializar cursor trail
  initCursorTrail();
  
  // Ejecutar animaciones de bienvenida
  await playWelcomeAnimations();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  cleanupCursorTrail();
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden gradient-background">
    
    <!-- Cursor Trail Effect -->
    <div class="fixed inset-0 pointer-events-none z-50">
      <div
        v-for="trail in cursorTrails"
        :key="trail.id"
        class="absolute rounded-full cursor-trail"
        :style="{
          left: trail.x + 'px',
          top: trail.y + 'px',
          opacity: trail.life * 0.8,
          transform: `translate(-50%, -50%) scale(${trail.life})`,
          background: `radial-gradient(circle, ${trail.color}80 0%, ${trail.color}40 50%, transparent 100%)`,
          width: trail.size + 'px',
          height: trail.size + 'px',
          filter: `blur(${trail.blur}px)`,
          boxShadow: `0 0 ${trail.size * 0.5}px ${trail.color}30`
        }"
      ></div>
    </div>
    <!-- Controles superiores (sonido y tema) -->
    <div class="fixed top-6 right-6 z-20 flex gap-3">
      <!-- Botón de cambio de idioma -->
      <button
        @click="() => { toggleLanguage(); playButtonClick(); }"
        class="btn-3d btn-3d-green-floating w-full h-full flex items-center justify-center gap-2"
        :title="t('languageTooltip')"
      >
        <span class="text-lg">{{ languageFlag }}</span>
      </button>
      
      <!-- Botón de tema -->
      <button
        @click="() => { toggleTheme(); playButtonClick(); }"
        class="btn-3d btn-3d-green-floating w-full h-full flex items-center justify-center"
        :title="tInterpolate('themeTooltip', { theme: currentTheme })"
      >
        <!-- Icono de sol (tema claro) -->
        <svg v-if="themeIcon === 'light'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <!-- Icono de luna (tema oscuro) -->
        <svg v-else-if="themeIcon === 'dark'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
        <!-- Icono de sistema -->
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      </button>
      
      <!-- Botón de sonido -->
      <button
        @click="() => { toggleSound(); playButtonClick(); }"
        class="btn-3d btn-3d-green-floating w-full h-full flex items-center justify-center"
        :title="soundEnabled ? t('soundOnTooltip') : t('soundOffTooltip')"
      >
        <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-music"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13h10v13" /><path d="M9 8h10" /></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
        </svg>
      </button>
    </div>
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 opacity-10 select-none">
      <div class="absolute top-10 left-10 text-8xl font-bold rotate-12" style="color: var(--theme-text-secondary);">漢</div>
      <div class="absolute top-32 right-20 text-6xl font-bold -rotate-6" style="color: var(--theme-text-accent);">字</div>
      <div class="absolute bottom-20 left-20 text-7xl font-bold rotate-6" style="color: var(--theme-border);">学</div>
      <div class="absolute bottom-32 right-10 text-5xl font-bold -rotate-12" style="color: var(--theme-text-primary);">習</div>
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10 max-w-6xl mx-auto text-center">
      
      <!-- Título principal -->
      <div class="main-title mb-8">
        <h1 class="text-7xl md:text-8xl font-bold mb-6 tracking-wide" style="color: var(--theme-text-primary);">
          漢字を学ぼう
        </h1>
        <h2 class="text-4xl md:text-5xl font-semibold mb-4" style="color: var(--theme-text-accent);">
          {{ t('mainTitle') }}
        </h2>
      </div>
      
      <!-- Subtítulo -->
      <div class="subtitle mb-12">
        <p class="text-xl md:text-2xl mb-4 leading-relaxed" style="color: var(--theme-text-secondary);">
          {{ t('subtitle') }}
        </p>
        <p class="text-lg" style="color: var(--theme-text-accent);">
          {{ t('levelSelection') }}
        </p>
      </div>

      <!-- Grid de niveles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <template v-for="(item, index) in kanjiLevels" :key="item.level">
          <!-- Botón de configuración especial -->
          <button
            v-if="item.isConfig"
            @click="openConfigModalWrapper"
            class="level-card btn-3d btn-3d-green-config text-center block"
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
            @click="handleLevelSelectionWrapper(item)"
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
        <button @click="openGuideModalWrapper" class="btn-3d btn-3d-green-light">
          {{ t('usageGuide') }}
        </button>
        <button @click="openAboutModalWrapper" class="btn-3d btn-3d-green-medium">
          {{ t('aboutProject') }}
        </button>
      </div>

    </div>

    <!-- Modal de Selección de Subniveles -->
    <div v-if="showSublevelModal" class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: var(--theme-overlay);">
      <div class="rounded-3xl border-2 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar" 
           style="background-color: var(--theme-surface); border-color: var(--theme-border); box-shadow: 0 20px 25px -5px var(--theme-shadow), 0 10px 10px -5px var(--theme-shadow);">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-2xl font-bold" style="color: var(--theme-text-primary);">{{ t('selectSublevel') }}</h3>
            <p class="text-sm mt-1" style="color: var(--theme-text-secondary);">{{ selectedLevel.toUpperCase() }} {{ t('sublevelDescription') }}</p>
          </div>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--theme-text-accent);">&times;</button>
        </div>
        
        <div v-if="loadingSublevels" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style="border-color: var(--theme-border);"></div>
          <p style="color: var(--theme-text-secondary);">{{ t('loadingSublevels') }}</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="subLevel in availableSublevels"
            :key="subLevel.sublevel"
            @click="selectSublevelWrapper(subLevel.sublevel)"
            class="btn-3d btn-3d-green-sublevel text-left p-6 hover:scale-105 transition-transform duration-200"
          >
            <!-- Número del subnivel -->
            <div class="flex items-center mb-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3" 
                   style="background-color: var(--theme-border); color: var(--theme-surface);">
                {{ subLevel.sublevel }}
              </div>
              <h4 class="text-lg font-bold" style="color: var(--theme-text-primary);">
                {{ subLevel.name }}
              </h4>
            </div>
            
            <!-- Descripción -->
            <p class="text-sm mb-2" style="color: var(--theme-text-secondary);">
              {{ subLevel.description }}
            </p>
            
            <!-- Información adicional -->
            <div class="flex justify-between items-center text-xs">
              <span style="color: var(--theme-text-accent);">
                {{ subLevel.kanjiCount }} {{ t('kanjis') }}
              </span>
              <span class="px-2 py-1 rounded" 
                    style="background-color: var(--theme-border-light); color: var(--theme-text-primary);">
                {{ subLevel.difficulty }}
              </span>
            </div>
          </button>
        </div>

        <div class="mt-6 flex gap-3">
          <button @click="closeModal" class="btn-3d btn-3d-green-light flex-1">
            {{ t('cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración -->
    <div v-if="showConfigModal" class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: var(--theme-overlay);">
      <div class="rounded-3xl border-2 p-8 max-w-md w-full max-h-[80vh] overflow-y-auto custom-scrollbar" 
           style="background-color: var(--theme-surface); border-color: var(--theme-border); box-shadow: 0 20px 25px -5px var(--theme-shadow), 0 10px 10px -5px var(--theme-shadow);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--theme-text-primary);">{{ t('configuration') }}</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--theme-text-accent);">&times;</button>
        </div>
        
        <div class="space-y-6">
          <!-- Configuración de sonido -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-secondary);">{{ t('audio') }}</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3" 
                  style="accent-color: var(--theme-border);" 
                  :checked="soundEnabled"
                  @change="toggleSound"
                >
                <span style="color: var(--theme-text-primary);">{{ t('soundEffects') }}</span>
              </label>
              <div class="text-xs mt-1" style="color: var(--theme-text-secondary);">
                {{ t('soundDescription') }}
              </div>
            </div>
          </div>

          <!-- Configuración de tema -->
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-secondary);">{{ t('theme') }}</h4>
            <div class="space-y-2">
              <label class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="light" 
                  class="mr-3" 
                  style="accent-color: var(--theme-border);" 
                  :checked="currentTheme === 'light'"
                  @change="setTheme('light')"
                >
                <span style="color: var(--theme-text-primary);">{{ t('lightTheme') }}</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark" 
                  class="mr-3" 
                  style="accent-color: var(--theme-border);"
                  :checked="currentTheme === 'dark'"
                  @change="setTheme('dark')"
                >
                <span style="color: var(--theme-text-primary);">{{ t('darkTheme') }}</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="system" 
                  class="mr-3" 
                  style="accent-color: var(--theme-border);"
                  :checked="currentTheme === 'system'"
                  @change="setTheme('system')"
                >
                <span style="color: var(--theme-text-primary);">{{ t('systemTheme') }}</span>
              </label>
              <div class="text-xs mt-2" style="color: var(--theme-text-secondary);">
                {{ t('currentTheme') }}: {{ isDarkMode ? t('dark') : t('light') }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="() => { playButtonClick(); closeModal(); }" class="btn-3d btn-3d-green-medium flex-1">
            {{ t('saveChanges') }}
          </button>
          <button @click="() => { playButtonClick(); closeModal(); }" class="btn-3d btn-3d-green-light">
            {{ t('cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Guía de uso -->
    <div v-if="showGuideModal" class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: var(--theme-overlay);">
      <div class="rounded-3xl border-2 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
           style="background-color: var(--theme-surface); border-color: var(--theme-border); box-shadow: 0 20px 25px -5px var(--theme-shadow), 0 10px 10px -5px var(--theme-shadow);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--theme-text-primary);">{{ t('usageGuideTitle') }}</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--theme-text-accent);">&times;</button>
        </div>

        
        <div class="space-y-6" style="color: var(--theme-text-secondary);">

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('notes') }}</h4>
            <ul class="list-disc text-left space-y-2 list-inside">
              <p class="mb-2">{{ t('note1') }}</p>
              <p class="mb-2">{{ t('note2') }}</p>
              <p class="mb-2">{{ t('note3') }}</p>
              <p class="mb-2">
                {{ t('note4') }}
                <button 
                  @click="copyEmail" 
                  class="ml-2 px-2 py-1 rounded-md text-xs bg-MossGreen/20 text-MossGreen border border-MossGreen/30 hover:bg-MossGreen/30 transition-colors duration-200"
                  :title="t('copyEmail')"
                >
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    {{ t('copyEmail') }}
                  </span>
                </button>
              </p>
              <p class="mb-2">{{ t('note5') }} <a href="https://ko-fi.com/santiagorodriguez2234" target="_blank" style="color: var(--theme-text-accent);">Ko-fi</a>!</p>
            </ul>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('learningSystem') }}</h4>
            <p class="mb-2"><strong>{{ t('onReadings') }}</strong></p>
            <p class="mb-2"><strong>{{ t('kunReadings') }}</strong></p>
            <p>{{ t('keyboardUsage') }}</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('japaneseKeyboard') }}</h4>
            <p class="mb-2">{{ t('keyboardTip1') }}</p>
            <p class="mb-2">{{ t('keyboardTip2') }}</p>
            <p class="mb-2">{{ t('keyboardTip3') }}</p>
            <p>{{ t('keyboardTip4') }}</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('tips') }}</h4>
            <p class="mb-2">{{ t('tip1') }}</p>
            <p class="mb-2">{{ t('tip2') }}</p>
            <p>{{ t('tip3') }}</p>
          </div>
        </div>

        <div class="mt-8">
          <button @click="closeModal" class="btn-3d btn-3d-blue w-full">
            {{ t('understood') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Acerca del proyecto -->
    <div v-if="showAboutModal" class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: var(--theme-overlay);">
      <div class="rounded-3xl border-2 p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
           style="background-color: var(--theme-surface); border-color: var(--theme-border); box-shadow: 0 20px 25px -5px var(--theme-shadow), 0 10px 10px -5px var(--theme-shadow);">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--theme-text-primary);">{{ t('aboutProjectTitle') }}</h3>
          <button @click="closeModal" class="text-2xl transition-opacity duration-200 hover:opacity-60" style="color: var(--theme-text-accent);">&times;</button>
        </div>
        
        <div class="space-y-6 text-center" style="color: var(--theme-text-secondary);">
          <div class="text-6xl mb-4" style="color: var(--theme-text-accent);">漢字を学ぼう</div>
          
          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('aboutApp') }}</h4>
            <p class="mb-4">{{ t('aboutDescription') }}</p>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('features') }}</h4>
            <ul class="text-left space-y-2">
              <li>{{ t('feature1') }}</li>
              <li>{{ t('feature2') }}</li>
              <li>{{ t('feature3') }}</li>
              <li>{{ t('feature4') }}</li>
              <li>{{ t('feature5') }}</li>
              <li>{{ t('feature6') }}</li>
              <li>{{ t('feature7') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('technologies') }}</h4>
            <div class="flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--theme-border); color: var(--theme-surface);">Vue 3</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--theme-text-accent); color: var(--theme-surface);">Vite</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--theme-text-secondary); color: var(--theme-surface);">Tailwind CSS</span>
              <span class="px-3 py-1 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-105 cursor-default" style="background-color: var(--theme-text-primary); color: var(--theme-surface);">JavaScript</span>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-3" style="color: var(--theme-text-primary);">{{ t('version') }}</h4>
            <p class="text-sm">{{ t('versionText') }}</p>
            <p class="text-xs mt-2" style="color: var(--theme-text-accent);">
              {{ t('madeWith') }}
            </p>
          </div>
        </div>

        <div class="mt-8">
          <button @click="closeModal" class="btn-3d btn-3d-red w-full">
            {{ t('close') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>