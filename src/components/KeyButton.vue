<template>
  <button 
    @click="handleClick" 
    :class="buttonClass"
    class="btn-3d btn-3d-primary text-sm font-bold flex-grow min-w-[32px] min-h-[32px] font-['Arial_Unicode_MS','Meiryo','Yu_Gothic']"
  >
    {{ char }}
  </button>
</template>

<script setup>
const props = defineProps({
  char: {
    type: String,
    required: true
  },
  buttonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

/**
 * Maneja el evento de clic en el botón.
 * Emite un evento 'click' al componente padre.
 */
const handleClick = () => {
  emit('click');
};
</script>
