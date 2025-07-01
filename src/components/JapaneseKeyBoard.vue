<script setup>
import { ref } from 'vue';
import { useSounds } from '../composables/useSounds.js';
import KeyButton from './KeyButton.vue';

// Definir las props y eventos que emite este componente
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['text-input', 'clear', 'close']);

const { playKeyboardKey, playButtonClick } = useSounds();

const currentMode = ref('hiragana');
const currentInputText = ref('');
const valorInput = ref('');

// Datos de los caracteres Hiragana organizados por filas
const hiraganaVocals = ['あ', 'い', 'う', 'え', 'お'];
const hiraganaRows = [
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', 'ゆ', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', 'を'],
];
const hiraganaSmallY = ['ゃ', 'ゅ', 'ょ'];

// Datos de los caracteres Katakana (debes completar todas las filas)
const katakanaVocals = ['ア', 'イ', 'ウ', 'エ', 'オ'];
const katakanaRows = [
  ['カ', 'キ', 'ク', 'ケ', 'コ'],
  ['サ', 'シ', 'ス', 'セ', 'ソ'],
  ['タ', 'チ', 'ツ', 'テ', 'ト'],
  ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  ['マ', 'ミ', 'ム', 'メ', 'モ'],
  ['ヤ', 'ユ', 'ヨ'],
  ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  ['ワ', 'ヲ'],
];
const katakanaSmallY = ['ャ', 'ュ', 'ョ'];

// Mapeo para la aplicación de Dakuten (゛)
const dakutenMap = {
  'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
  'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
  'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
  'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ',
  'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ',
  'サ': 'ザ', 'シ': 'ジ', 'ス': 'ズ', 'セ': 'ゼ', 'ソ': 'ゾ',
  'タ': 'ダ', 'チ': 'ヂ', 'ツ': 'ヅ', 'テ': 'デ', 'ト': 'ド',
  'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ',
};

// Mapeo para la aplicación de Handakuten (゜)
const handakutenMap = {
  'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ',
  'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ',
};

/**
 * Añade el carácter pulsado al texto de entrada.
 * @param {string} char - El carácter a añadir.
 */
const handleKeyPress = (char) => {
  playKeyboardKey();
  currentInputText.value += char;
  emit('text-input', char);
};

/**
 * Elimina el último carácter del texto de entrada.
 * @returns {void}
 */

const handleClear = () => {
  playButtonClick();
  currentInputText.value = '';
  emit('clear');
};

/**
 * Cambia el modo de teclado entre Hiragana y Katakana.
 * @param {string} mode - El nuevo modo ('hiragana' o 'katakana').
 */
const changeMode = (mode) => {
  playButtonClick();
  currentMode.value = mode;
};

/**
 * Aplica caracteres especiales (Dakuten o Handakuten) al último carácter del input.
 * @param {string} type - El tipo de carácter especial a aplicar ('dakuten' o 'handakuten').
 */
const applySpecialChar = (type) => {
  if (currentInputText.value.length === 0) return;

  const lastChar = currentInputText.value[currentInputText.value.length - 1];
  let convertedChar = '';

  if (type === 'dakuten') {
    convertedChar = dakutenMap[lastChar];
  } else if (type === 'handakuten') {
    convertedChar = handakutenMap[lastChar];
  }

  // Si se encontró una conversión, reemplaza el último carácter
  if (convertedChar) {
    currentInputText.value = currentInputText.value.slice(0, -1) + convertedChar;
    emit('backspace');
    emit('text-input', convertedChar);
  }
};

</script>

<template>
<div class="japanese-keyboard flex flex-col gap-3 p-4 bg-Marfil backdrop-blur-sm rounded-2xl shadow-xl border border-platinum max-w-md w-full max-h-[calc(100vh-370px)] overflow-y-auto">
    <!-- Header con botón de cerrar -->
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-semibold text-grisTinta">Teclado Japonés</h3>
      <button
        @click="() => { playButtonClick(); emit('close'); }"
        class="btn-3d btn-3d-danger text-xs px-2 py-1"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Botones de modo -->
    <div class="flex justify-center gap-2 mb-2">
      <button
        @click="changeMode('hiragana')"
        :class="currentMode === 'hiragana' ? 'btn-3d btn-3d-green-primary' : 'btn-3d btn-3d-secondary'"
        class="px-3 py-1 text-sm font-semibold"
      >
        ひらがな
      </button>
      <button
        @click="changeMode('katakana')"
        :class="currentMode === 'katakana' ? 'btn-3d btn-3d-green-primary' : 'btn-3d btn-3d-secondary'"
        class="px-3 py-1 text-sm font-semibold"
      >
        カタカナ
      </button>
    </div>

<div class="flex flex-col gap-1">
      <div class="flex justify-center gap-1">
        <KeyButton
          v-for="char in (currentMode === 'hiragana' ? hiraganaVocals : katakanaVocals)"
          :key="char"
          :char="char"
          :buttonClass="'text-sm'"
          @click="handleKeyPress(char)"
        />
      </div>

      <div class="flex justify-center gap-1" v-for="(row, index) in (currentMode === 'hiragana' ? hiraganaRows : katakanaRows)" :key="index">
        <KeyButton
          v-for="char in row"
          :key="char"
          :char="char"
          :buttonClass="'text-sm'"
          @click="handleKeyPress(char)"
        />
      </div>

      <div class="flex justify-center gap-1">
        <KeyButton
          v-for="char in (currentMode === 'hiragana' ? hiraganaSmallY : katakanaSmallY)"
          :key="char"
          :char="char"
          :buttonClass="'text-sm'"
          @click="handleKeyPress(char)"
        />
      </div>

      <div class="flex justify-center gap-1 mt-2">
        <KeyButton char="っ" @click="handleKeyPress('っ')" :buttonClass="'btn-3d-green-light text-xs'" />
        <KeyButton char="ん" @click="handleKeyPress('ん')" :buttonClass="'btn-3d-green-light text-xs'" />
        <KeyButton char="Limpiar" @click="handleClear()" :buttonClass="'btn-3d-danger text-xs'" />
      </div>
    </div>
  </div>

</template>

<style scoped>
/* Estilos para la barra de scroll - WebKit (Chrome, Safari, Edge) */
.japanese-keyboard::-webkit-scrollbar {
  width: 4px;
}

.japanese-keyboard::-webkit-scrollbar-track {
  background: transparent;
}

.japanese-keyboard::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.3);
  border-radius: 2px;
}

.japanese-keyboard::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.5);
}

/* Estilos para Firefox */
.japanese-keyboard {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
}

/* Alternativa: Ocultar completamente la barra de scroll */
/* Descomenta las siguientes líneas si prefieres ocultar completamente la barra */
/*
.japanese-keyboard::-webkit-scrollbar {
  display: none;
}

.japanese-keyboard {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
*/
</style>