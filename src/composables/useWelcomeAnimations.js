import { nextTick } from "vue";

/**
 * Composable específico para las animaciones de la página de bienvenida.
 * Coordina la secuencia de animaciones de entrada para crear una experiencia fluida.
 *
 * @param {Function} animateIn - Función de animación proporcionada por useMotion
 * @returns {Object} Funciones para ejecutar las animaciones de bienvenida
 */
export function useWelcomeAnimations(animateIn) {
  /**
   * Ejecuta la secuencia completa de animaciones de bienvenida.
   * Las animaciones se ejecutan con delays escalonados para crear un efecto fluido:
   * 1. Título principal (inmediato)
   * 2. Subtítulo (200ms delay)
   * 3. Cards de niveles con stagger (400ms delay)
   */
  const playWelcomeAnimations = async () => {
    await nextTick();

    // 1. Animar título principal desde arriba
    animateIn(".main-title", {
      y: [-50, 0], // Movimiento desde arriba
      opacity: [0, 1], // Fade in
      duration: 0.8, // Duración más larga para impacto
      easing: "ease-out",
    });

    // 2. Animar subtítulo desde abajo (delay 200ms)
    setTimeout(() => {
      animateIn(".subtitle", {
        y: [30, 0], // Movimiento desde abajo
        opacity: [0, 1], // Fade in
        duration: 0.6,
        easing: "ease-out",
      });
    }, 200);

    // 3. Animar cards de niveles con stagger (delay 400ms)
    setTimeout(() => {
      animateIn(".level-card", {
        y: [50, 0], // Movimiento desde abajo
        opacity: [0, 1], // Fade in
        scale: [0.9, 1], // Escalado para efecto de "pop"
        duration: 0.5,
        easing: "ease-out",
        delay: (i) => i * 0.1, // Delay incremental entre cards
      });
    }, 400);
  };

  return {
    playWelcomeAnimations,
  };
}
