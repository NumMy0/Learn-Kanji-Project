import { ref } from "vue";

export function useModals() {
  // Estados de los modales
  const showConfigModal = ref(false);
  const showGuideModal = ref(false);
  const showAboutModal = ref(false);
  const showSublevelModal = ref(false);

  // Funciones para abrir modales específicos
  const openConfigModal = (playButtonClick) => {
    playButtonClick();
    showConfigModal.value = true;
  };

  const openGuideModal = (playButtonClick) => {
    playButtonClick();
    showGuideModal.value = true;
  };

  const openAboutModal = (playButtonClick) => {
    playButtonClick();
    showAboutModal.value = true;
  };

  const openSublevelModal = () => {
    showSublevelModal.value = true;
  };

  // Función para cerrar todos los modales
  const closeModal = () => {
    showConfigModal.value = false;
    showGuideModal.value = false;
    showAboutModal.value = false;
    showSublevelModal.value = false;
  };

  // Función para manejar el teclado (cerrar con Escape)
  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  return {
    // Estados
    showConfigModal,
    showGuideModal,
    showAboutModal,
    showSublevelModal,

    // Funciones
    openConfigModal,
    openGuideModal,
    openAboutModal,
    openSublevelModal,
    closeModal,
    handleKeydown,
  };
}
