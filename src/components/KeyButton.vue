<!--
  KeyButton.vue
  
  Componente de botón individual para el teclado japonés virtual.
  Renderiza un solo carácter japonés (hiragana/katakana) como un botón clickeable.
  
  @component
  @example
  <KeyButton 
    char="あ" 
    button-class="custom-class" 
    @click="handleCharacterInput" 
  />
-->
<template>
  <button 
    @click="handleClick" 
    :class="computedButtonClass"
    class="btn-3d btn-3d-primary text-sm font-bold flex-grow min-w-[32px] min-h-[32px] font-['Arial_Unicode_MS','Meiryo','Yu_Gothic'] transition-transform duration-150 hover:scale-105 active:scale-95"
    :aria-label="`Input character ${char}`"
    type="button"
  >
    {{ char }}
  </button>
</template>

<script setup>
import { computed } from 'vue';

/**
 * Props del componente KeyButton
 * @typedef {Object} KeyButtonProps
 * @property {string} char - Carácter japonés a mostrar en el botón (requerido)
 * @property {string} buttonClass - Clases CSS adicionales para personalizar el estilo del botón
 */
const props = defineProps({
  char: {
    type: String,
    required: true,
    validator: (value) => value.length > 0,
    default: ''
  },
  buttonClass: {
    type: String,
    default: ''
  }
});

/**
 * Eventos emitidos por el componente
 * @typedef {Object} KeyButtonEmits
 * @property {Function} click - Se emite cuando el usuario hace clic en el botón
 */
const emit = defineEmits(['click']);

/**
 * Calcula las clases CSS combinadas para el botón
 * @returns {string} Clases CSS finales aplicadas al botón
 */
const computedButtonClass = computed(() => {
  return props.buttonClass || '';
});

/**
 * Maneja el evento de clic en el botón
 * Emite un evento 'click' al componente padre con el carácter asociado
 * @emits click
 */
const handleClick = () => {
  emit('click', props.char);
};
</script>

<style scoped>
/**
 * Estilos específicos para el componente KeyButton
 * Se asegura de que el botón tenga una apariencia consistente
 * y una buena experiencia de usuario en diferentes dispositivos
 */
button {
  /* Mejora la legibilidad en fuentes japonesas */
  font-feature-settings: "kern" 1;
  letter-spacing: 0.5px;
  
  /* Asegura que el texto esté bien centrado */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Mejora la accesibilidad del foco */
  &:focus {
    outline: 2px solid var(--color-accent, #4A90E2);
    outline-offset: 2px;
  }
  
  /* Estados de interacción mejorados */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
}

/* Mejoras para dispositivos táctiles */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 44px; /* Tamaño mínimo recomendado para touch */
    min-width: 44px;
  }
}
</style>