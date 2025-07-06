<!--
  SpecialCharacterRow.vue
  
  Componente que renderiza la fila de caracteres especiales japoneses.
  Incluye caracteres como っ (tsu pequeño) y ん (n).
  
  @component
  @example
  <SpecialCharacterRow @character-input="handleCharacterInput" />
-->
<template>
  <div class="special-character-row">
    <KeyButton
      v-for="character in specialCharacters"
      :key="character.char"
      :char="character.char"
      :button-class="character.buttonClass"
      @click="handleCharacterInput"
    />
  </div>
</template>

<script setup>
import KeyButton from '../KeyButton.vue';

/**
 * Lista de caracteres especiales con sus configuraciones
 */
const specialCharacters = [
  {
    char: 'っ',
    buttonClass: 'btn-3d-green-light text-xs'
  },
  {
    char: 'ん',
    buttonClass: 'btn-3d-green-light text-xs'
  }
];

/**
 * Eventos emitidos por el componente
 * @typedef {Object} SpecialCharacterRowEmits
 * @property {Function} character-input - Se emite cuando se selecciona un carácter especial
 */
const emit = defineEmits(['character-input']);

/**
 * Maneja la entrada de un carácter especial
 * @param {string} char - Carácter especial seleccionado
 * @emits character-input
 */
const handleCharacterInput = (char) => {
  emit('character-input', char);
};
</script>

<style scoped>
.special-character-row {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

/* Adaptaciones para dispositivos móviles */
@media (max-width: 640px) {
  .special-character-row {
    gap: 0.5rem;
    margin-top: 0.375rem;
  }
}
</style>
