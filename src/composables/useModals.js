import { ref } from "vue";

/**
 * Composable para manejar el estado y las operaciones de los modales de la aplicación.
 * Proporciona funcionalidad centralizada para abrir, cerrar y gestionar múltiples modales.
 *
 * @returns {Object} Un objeto con estados de modales y funciones de control
 */
export function useModals() {
  // Estados reactivos de los modales
  const showConfigModal = ref(false); // Modal de configuración de la aplicación
  const showGuideModal = ref(false); // Modal con la guía de uso
  const showAboutModal = ref(false); // Modal con información del proyecto
  const showSublevelModal = ref(false); // Modal de selección de subniveles

  /**
   * Abre el modal de configuración y reproduce un sonido de click.
   *
   * @param {Function} playButtonClick - Función para reproducir el sonido del botón
   */
  const openConfigModal = (playButtonClick) => {
    playButtonClick();
    showConfigModal.value = true;
  };

  /**
   * Abre el modal de guía de uso y reproduce un sonido de click.
   *
   * @param {Function} playButtonClick - Función para reproducir el sonido del botón
   */
  const openGuideModal = (playButtonClick) => {
    playButtonClick();
    showGuideModal.value = true;
  };

  /**
   * Abre el modal "Acerca del proyecto" y reproduce un sonido de click.
   *
   * @param {Function} playButtonClick - Función para reproducir el sonido del botón
   */
  const openAboutModal = (playButtonClick) => {
    playButtonClick();
    showAboutModal.value = true;
  };

  /**
   * Abre el modal de selección de subniveles.
   * No reproduce sonido ya que se abre automáticamente en ciertos contextos.
   */
  const openSublevelModal = () => {
    showSublevelModal.value = true;
  };

  /**
   * Cierra todos los modales estableciendo sus estados en false.
   * Útil para limpiar el estado cuando se cambia de ruta o se requiere cerrar todo.
   */
  const closeModal = () => {
    showConfigModal.value = false;
    showGuideModal.value = false;
    showAboutModal.value = false;
    showSublevelModal.value = false;
  };

  /**
   * Maneja eventos de teclado para cerrar modales.
   * Específicamente, cierra todos los modales cuando se presiona la tecla Escape.
   *
   * @param {KeyboardEvent} event - El evento del teclado
   */
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
