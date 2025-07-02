import { nextTick } from "vue";

export function useWelcomeAnimations(animateIn) {
  // Función para ejecutar todas las animaciones de entrada
  const playWelcomeAnimations = async () => {
    await nextTick();

    // Animar título principal
    animateIn(".main-title", {
      y: [-50, 0],
      opacity: [0, 1],
      duration: 0.8,
      easing: "ease-out",
    });

    // Animar subtítulo
    setTimeout(() => {
      animateIn(".subtitle", {
        y: [30, 0],
        opacity: [0, 1],
        duration: 0.6,
        easing: "ease-out",
      });
    }, 200);

    // Animar cards con stagger
    setTimeout(() => {
      animateIn(".level-card", {
        y: [50, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 0.5,
        easing: "ease-out",
        delay: (i) => i * 0.1,
      });
    }, 400);
  };

  return {
    playWelcomeAnimations,
  };
}
