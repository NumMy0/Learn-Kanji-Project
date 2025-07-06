<!--
  KeyboardHeader.vue
  
  Componente del encabezado del teclado japonés.
  Muestra el título y el botón de cerrar.
  
  @component
  @example
  <KeyboardHeader @close="handleClose" />
-->
<template>
  <div class="keyboard-header">
    <h3 class="keyboard-title">
      {{ t('japaneseKeyboard') }}
    </h3>
    <button
      @click="handleClose"
      class="close-button"
      :aria-label="t('close')"
      type="button"
    >
      <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '../../composables/useI18n.js';

/**
 * Eventos emitidos por el componente
 * @typedef {Object} KeyboardHeaderEmits
 * @property {Function} close - Se emite cuando se hace clic en el botón de cerrar
 */
const emit = defineEmits(['close']);

const { t } = useI18n();

/**
 * Maneja el evento de cierre del teclado
 * @emits close
 */
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.keyboard-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-tinta, #374151);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  color: var(--color-danger, #EF4444);
  
  &:hover {
    background-color: var(--color-danger-light, #FEE2E2);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: 2px solid var(--color-danger, #EF4444);
    outline-offset: 2px;
  }
}

.close-icon {
  width: 0.75rem;
  height: 0.75rem;
}
</style>
