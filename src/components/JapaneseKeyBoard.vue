<!--
  JapaneseKeyBoard.vue
  
  Componente de teclado japonés virtual que permite la entrada de caracteres hiragana y katakana.
  Incluye funcionalidades avanzadas como aplicación de dakuten y handakuten.
  
  @component
  @example
  <JapaneseKeyBoard 
    @text-input="handleTextInput"
    @clear="handleClear"
    @close="handleClose"
    @apply-special="handleSpecialChar"
  />
-->
<template>
  <div class="japanese-keyboard">
    <!-- Header con título y botón de cerrar -->
    <KeyboardHeader @close="handleClose" />
    
    <!-- Botones de selección de modo (Hiragana/Katakana) -->
    <ModeSelector 
      :current-mode="currentMode" 
      @mode-change="handleModeChange" 
    />
    
    <!-- Grid principal del teclado -->
    <div class="keyboard-grid">
      <!-- Fila de vocales -->
      <div class="keyboard-row">
        <KeyButton
          v-for="char in currentVocals"
          :key="char"
          :char="char"
          @click="handleKeyPress"
        />
      </div>

      <!-- Filas principales de consonantes -->
      <div 
        v-for="(row, index) in currentConsonantRows" 
        :key="`row-${index}`"
        class="keyboard-row"
      >
        <KeyButton
          v-for="char in row"
          :key="char"
          :char="char"
          @click="handleKeyPress"
        />
      </div>

      <!-- Fila de caracteres pequeños Y -->
      <div class="keyboard-row">
        <KeyButton
          v-for="char in currentSmallY"
          :key="char"
          :char="char"
          @click="handleKeyPress"
        />
      </div>

      <!-- Caracteres especiales (tsu pequeño y n) -->
      <SpecialCharacterRow @character-input="handleKeyPress" />

      <!-- Botones de modificadores y funciones -->
      <ActionButtonsRow 
        @apply-dakuten="() => handleSpecialCharacter('dakuten')"
        @apply-handakuten="() => handleSpecialCharacter('handakuten')"
        @clear="handleClearInput"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSounds } from '../composables/useSounds.js';
import { useI18n } from '../composables/useI18n.js';
import KeyButton from './KeyButton.vue';
import KeyboardHeader from './keyboard/KeyboardHeader.vue';
import ModeSelector from './keyboard/ModeSelector.vue';
import SpecialCharacterRow from './keyboard/SpecialCharacterRow.vue';
import ActionButtonsRow from './keyboard/ActionButtonsRow.vue';

/**
 * Props del componente JapaneseKeyBoard
 * @typedef {Object} JapaneseKeyBoardProps
 * @property {string} modelValue - Valor del input actual (v-model)
 */
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

/**
 * Eventos emitidos por el componente
 * @typedef {Object} JapaneseKeyBoardEmits
 * @property {Function} text-input - Se emite cuando se ingresa un carácter
 * @property {Function} clear - Se emite cuando se limpia el input
 * @property {Function} close - Se emite cuando se cierra el teclado
 * @property {Function} apply-special - Se emite cuando se aplica un carácter especial
 */
const emit = defineEmits(['text-input', 'clear', 'close', 'apply-special']);

// Composables
const { playKeyboardKey, playButtonClick } = useSounds();
const { t } = useI18n();

// Estado reactivo
const currentMode = ref('hiragana');

/**
 * Configuración de caracteres japoneses
 * Organizada en estructuras de datos para fácil mantenimiento
 */
const JAPANESE_CHARACTERS = {
  hiragana: {
    vocals: ['あ', 'い', 'う', 'え', 'お'],
    consonantRows: [
      ['か', 'き', 'く', 'け', 'こ'],
      ['さ', 'し', 'す', 'せ', 'そ'],
      ['た', 'ち', 'つ', 'て', 'と'],
      ['な', 'に', 'ぬ', 'ね', 'の'],
      ['は', 'ひ', 'ふ', 'へ', 'ほ'],
      ['ま', 'み', 'む', 'め', 'も'],
      ['や', 'ゆ', 'よ'],
      ['ら', 'り', 'る', 'れ', 'ろ'],
      ['わ', 'を']
    ],
    smallY: ['ゃ', 'ゅ', 'ょ'],
    special: ['っ', 'ん']
  },
  katakana: {
    vocals: ['ア', 'イ', 'ウ', 'エ', 'オ'],
    consonantRows: [
      ['カ', 'キ', 'ク', 'ケ', 'コ'],
      ['サ', 'シ', 'ス', 'セ', 'ソ'],
      ['タ', 'チ', 'ツ', 'テ', 'ト'],
      ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
      ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
      ['マ', 'ミ', 'ム', 'メ', 'モ'],
      ['ヤ', 'ユ', 'ヨ'],
      ['ラ', 'リ', 'ル', 'レ', 'ロ'],
      ['ワ', 'ヲ']
    ],
    smallY: ['ャ', 'ュ', 'ョ'],
    special: ['ッ', 'ン']
  }
};

/**
 * Mapeo de caracteres para dakuten (゛)
 */
const DAKUTEN_MAP = {
  'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
  'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
  'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
  'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ',
  'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ',
  'サ': 'ザ', 'シ': 'ジ', 'ス': 'ズ', 'セ': 'ゼ', 'ソ': 'ゾ',
  'タ': 'ダ', 'チ': 'ヂ', 'ツ': 'ヅ', 'テ': 'デ', 'ト': 'ド',
  'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ'
};

/**
 * Mapeo de caracteres para handakuten (゜)
 */
const HANDAKUTEN_MAP = {
  'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ',
  'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ'
};

// Computed properties para obtener los caracteres según el modo actual
const currentVocals = computed(() => JAPANESE_CHARACTERS[currentMode.value].vocals);
const currentConsonantRows = computed(() => JAPANESE_CHARACTERS[currentMode.value].consonantRows);
const currentSmallY = computed(() => JAPANESE_CHARACTERS[currentMode.value].smallY);

/**
 * Maneja la entrada de un carácter individual
 * @param {string} char - Carácter japonés a procesar
 * @emits text-input
 */
const handleKeyPress = (char) => {
  playKeyboardKey();
  emit('text-input', char);
};

/**
 * Maneja el cambio de modo del teclado
 * @param {string} mode - Nuevo modo ('hiragana' | 'katakana')
 */
const handleModeChange = (mode) => {
  playButtonClick();
  currentMode.value = mode;
};

/**
 * Maneja la aplicación de caracteres especiales (dakuten/handakuten)
 * @param {string} type - Tipo de carácter especial ('dakuten' | 'handakuten')
 * @emits apply-special
 */
const handleSpecialCharacter = (type) => {
  playKeyboardKey();
  emit('apply-special', type);
};

/**
 * Maneja la limpieza del input
 * @emits clear
 */
const handleClearInput = () => {
  playButtonClick();
  emit('clear');
};

/**
 * Maneja el cierre del teclado
 * @emits close
 */
const handleClose = () => {
  playButtonClick();
  emit('close');
};

// Exposición de variables y funciones para testing
defineExpose({
  currentMode,
  JAPANESE_CHARACTERS,
  DAKUTEN_MAP,
  HANDAKUTEN_MAP,
  handleKeyPress,
  handleModeChange,
  handleSpecialCharacter,
  handleClearInput,
  handleClose
});
</script>

<style scoped>
/**
 * Estilos del componente JapaneseKeyBoard
 * Optimizado para múltiples dispositivos y accesibilidad
 */
.japanese-keyboard {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-marfil, #F5F5DC);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-platinum, #E5E7EB);
  max-width: 28rem;
  width: 100%;
  max-height: calc(100vh - 370px);
  overflow-y: auto;
  
  /* Mejoras para dispositivos táctiles */
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.keyboard-grid {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

/* Estilos de scroll optimizados */
.japanese-keyboard::-webkit-scrollbar {
  width: 4px;
}

.japanese-keyboard::-webkit-scrollbar-track {
  background: transparent;
}

.japanese-keyboard::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.3);
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.japanese-keyboard::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.5);
}

/* Soporte para Firefox */
.japanese-keyboard {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
}

/* Adaptaciones para dispositivos móviles */
@media (max-width: 640px) {
  .japanese-keyboard {
    max-width: 100%;
    max-height: calc(100vh - 300px);
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .keyboard-grid {
    gap: 0.5rem;
  }
  
  .keyboard-row {
    gap: 0.5rem;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .japanese-keyboard {
    transition: none;
  }
}

/* Modo de alto contraste */
@media (prefers-contrast: high) {
  .japanese-keyboard {
    border-width: 2px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  }
}
</style>