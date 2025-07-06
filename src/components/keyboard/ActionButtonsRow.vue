<!--
  ActionButtonsRow.vue
  
  Componente que renderiza los botones de acciones del teclado japonés.
  Incluye botones para aplicar dakuten, handakuten y limpiar el input.
  
  @component
  @author Learn Kanji Project
  @since 1.0.0
-->

<template>
  <div class="grid grid-cols-3 gap-2 mt-4">
    <!-- Botón para aplicar dakuten (゛) -->
    <button
      @click="handleDakuten"
      :title="t('dakutenTooltip')"
      class="action-btn"
    >
      <span class="text-lg">゛</span>
      <span class="text-xs">{{ t('dakuten') }}</span>
    </button>

    <!-- Botón para aplicar handakuten (゜) -->
    <button
      @click="handleHandakuten"
      :title="t('handakutenTooltip')"
      class="action-btn"
    >
      <span class="text-lg">゜</span>
      <span class="text-xs">{{ t('handakuten') }}</span>
    </button>

    <!-- Botón para limpiar -->
    <button
      @click="handleClear"
      :title="t('clearTooltip')"
      class="action-btn clear-btn"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <span class="text-xs">{{ t('clear') }}</span>
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '../../composables/useI18n.js';
import { useSounds } from '../../composables/useSounds.js';

/**
 * Eventos emitidos por el componente
 * @typedef {Object} ActionButtonsRowEmits
 * @property {Function} applyDakuten - Emite cuando se presiona el botón de dakuten
 * @property {Function} applyHandakuten - Emite cuando se presiona el botón de handakuten  
 * @property {Function} clear - Emite cuando se presiona el botón de limpiar
 */
const emit = defineEmits(['applyDakuten', 'applyHandakuten', 'clear']);

// Composables
const { t } = useI18n();
const { playButtonClick } = useSounds();

/**
 * Maneja el clic en el botón de dakuten
 * Reproduce sonido y emite el evento correspondiente
 */
const handleDakuten = () => {
  playButtonClick();
  emit('applyDakuten');
};

/**
 * Maneja el clic en el botón de handakuten
 * Reproduce sonido y emite el evento correspondiente
 */
const handleHandakuten = () => {
  playButtonClick();
  emit('applyHandakuten');
};

/**
 * Maneja el clic en el botón de limpiar
 * Reproduce sonido y emite el evento correspondiente
 */
const handleClear = () => {
  playButtonClick();
  emit('clear');
};
</script>

<style scoped>
/**
 * Estilos base para los botones de acción
 */
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 3.5rem;
  position: relative;
}

.action-btn:hover {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

/**
 * Estilos específicos para el botón de limpiar
 */
.clear-btn {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
}

.clear-btn:hover {
  border-color: #dc2626;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #b91c1c;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.clear-btn:active {
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
}

/**
 * Estilos responsivos para pantallas pequeñas
 */
@media (max-width: 640px) {
  .action-btn {
    padding: 0.5rem;
    min-height: 3rem;
    font-size: 0.875rem;
  }
}
</style>
