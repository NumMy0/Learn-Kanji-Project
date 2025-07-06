<!--
  ModeSelector.vue
  
  Componente selector de modo para el teclado japonés.
  Permite alternar entre hiragana y katakana.
  
  @component
  @example
  <ModeSelector 
    :current-mode="currentMode" 
    @mode-change="handleModeChange" 
  />
-->
<template>
  <div class="mode-selector">
    <button
      @click="() => handleModeChange('hiragana')"
      :class="[
        'mode-button',
        currentMode === 'hiragana' ? 'mode-button--active' : 'mode-button--inactive'
      ]"
      :aria-pressed="currentMode === 'hiragana'"
      type="button"
    >
      ひらがな
    </button>
    <button
      @click="() => handleModeChange('katakana')"
      :class="[
        'mode-button',
        currentMode === 'katakana' ? 'mode-button--active' : 'mode-button--inactive'
      ]"
      :aria-pressed="currentMode === 'katakana'"
      type="button"
    >
      カタカナ
    </button>
  </div>
</template>

<script setup>
/**
 * Props del componente ModeSelector
 * @typedef {Object} ModeSelectorProps
 * @property {string} currentMode - Modo actual del teclado ('hiragana' | 'katakana')
 */
const props = defineProps({
  currentMode: {
    type: String,
    required: true,
    validator: (value) => ['hiragana', 'katakana'].includes(value)
  }
});

/**
 * Eventos emitidos por el componente
 * @typedef {Object} ModeSelectorEmits
 * @property {Function} mode-change - Se emite cuando cambia el modo seleccionado
 */
const emit = defineEmits(['mode-change']);

/**
 * Maneja el cambio de modo del teclado
 * @param {string} mode - Nuevo modo seleccionado
 * @emits mode-change
 */
const handleModeChange = (mode) => {
  if (mode !== props.currentMode) {
    emit('mode-change', mode);
  }
};
</script>

<style scoped>
.mode-selector {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.mode-button {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: 'Arial Unicode MS', 'Meiryo', 'Yu Gothic', sans-serif;
  min-width: 4rem;
  
  &:focus {
    outline: 2px solid var(--color-accent, #4A90E2);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.mode-button--active {
  background: linear-gradient(135deg, var(--color-moss-green, #4A5D23), var(--color-fern-green, #4F7942));
  color: var(--color-snow, #FFFFFF);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  
  &:hover {
    background: linear-gradient(135deg, var(--color-moss-green-dark, #3A4D13), var(--color-fern-green-dark, #3F6932));
    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }
}

.mode-button--inactive {
  background: var(--color-secondary, #F3F4F6);
  color: var(--color-gris-tinta, #374151);
  border: 1px solid var(--color-border, #D1D5DB);
  
  &:hover {
    background: var(--color-secondary-hover, #E5E7EB);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    background: var(--color-secondary-active, #D1D5DB);
  }
}

/* Adaptaciones para dispositivos móviles */
@media (max-width: 640px) {
  .mode-selector {
    gap: 0.25rem;
  }
  
  .mode-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    min-width: 3.5rem;
  }
}
</style>
