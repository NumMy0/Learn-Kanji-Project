import { ref, onUnmounted, nextTick } from "vue";
import { animate, stagger } from "motion";

/**
 * Composable para manejar animaciones con la librería Motion.
 * Proporciona funciones de alto nivel para animaciones comunes y gestión automática
 * de la limpieza de animaciones para evitar memory leaks.
 *
 * @returns {Object} Funciones para diferentes tipos de animaciones
 */
export function useMotion() {
  // Set para mantener referencias a todas las animaciones activas
  const animations = ref(new Set());

  /**
   * Limpia una animación específica y la remueve del set de tracking.
   * Previene memory leaks deteniendo animaciones activas.
   *
   * @param {Object} animation - Instancia de animación de Motion
   */
  const cleanupAnimation = (animation) => {
    if (animation && animations.value.has(animation)) {
      try {
        animation.stop?.();
        animations.value.delete(animation);
      } catch (error) {
        console.warn("Error stopping animation:", error);
      }
    }
  };

  /**
   * Anima la entrada de elementos al DOM.
   * Por defecto aplica fade-in con movimiento desde abajo.
   *
   * @param {string|HTMLElement|NodeList} selector - Selector CSS o elemento(s) a animar
   * @param {Object} options - Opciones de animación
   * @param {string} options.easing - Tipo de easing (default: "ease-out")
   * @param {number} options.duration - Duración en segundos (default: 0.6)
   * @param {number|Function} options.delay - Delay antes de iniciar
   * @param {number} options.repeat - Número de repeticiones
   * @returns {Object|null} Instancia de animación o null si falla
   */
  const animateIn = async (selector, options = {}) => {
    await nextTick();

    // Validar que existan elementos antes de animar
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : selector;
    if (!elements || (elements.length !== undefined && elements.length === 0)) {
      console.warn(`No elements found for selector: ${selector}`);
      return null;
    }

    const {
      easing = "ease-out",
      duration = 0.6,
      delay,
      repeat,
      ...animatableOptions
    } = options;

    // Propiedades por defecto para animación de entrada
    const defaultAnimatableOptions = {
      opacity: [0, 1], // Fade in
      y: [20, 0], // Movimiento desde abajo
      ...animatableOptions, // Permite override de defaults
    };

    const configOptions = {
      duration,
      easing,
      ...(delay !== undefined && { delay }),
      ...(repeat !== undefined && { repeat }),
    };

    try {
      const animation = animate(
        selector,
        defaultAnimatableOptions,
        configOptions
      );
      animations.value.add(animation);
      return animation;
    } catch (error) {
      console.warn("Animation error:", error);
      return null;
    }
  };

  /**
   * Anima la salida de elementos del DOM.
   * Por defecto aplica fade-out con movimiento hacia arriba.
   *
   * @param {string|HTMLElement|NodeList} selector - Selector CSS o elemento(s) a animar
   * @param {Object} options - Opciones de animación (similar a animateIn)
   * @returns {Object|null} Instancia de animación o null si falla
   */
  const animateOut = async (selector, options = {}) => {
    await nextTick();

    // Validar que existan elementos antes de animar
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : selector;
    if (!elements || (elements.length !== undefined && elements.length === 0)) {
      console.warn(`No elements found for selector: ${selector}`);
      return null;
    }

    const {
      easing = "ease-in",
      duration = 0.4,
      delay,
      repeat,
      ...animatableOptions
    } = options;

    // Propiedades por defecto para animación de salida
    const defaultAnimatableOptions = {
      opacity: [1, 0], // Fade out
      y: [0, -20], // Movimiento hacia arriba
      ...animatableOptions, // Permite override
    };

    const configOptions = {
      duration,
      easing,
      ...(delay !== undefined && { delay }),
      ...(repeat !== undefined && { repeat }),
    };

    try {
      const animation = animate(
        selector,
        defaultAnimatableOptions,
        configOptions
      );
      animations.value.add(animation);
      return animation;
    } catch (error) {
      console.warn("Animation error:", error);
      return null;
    }
  };

  /**
   * Anima múltiples elementos con efecto stagger (secuencial).
   * Útil para animar listas o grids con un retraso entre cada elemento.
   *
   * @param {string|HTMLElement|NodeList} selector - Selector CSS o elementos a animar
   * @param {Object} options - Opciones de animación
   * @param {number|Function} options.delay - Delay stagger (default: stagger(0.1))
   * @returns {Object|null} Instancia de animación o null si falla
   */
  const animateStagger = async (selector, options = {}) => {
    await nextTick();

    // Validar que existan elementos antes de animar
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : selector;
    if (!elements || (elements.length !== undefined && elements.length === 0)) {
      console.warn(`No elements found for selector: ${selector}`);
      return null;
    }

    const {
      easing = "ease-out",
      duration = 0.5,
      delay = stagger(0.1), // Delay de 0.1s entre cada elemento
      repeat,
      ...animatableOptions
    } = options;

    // Propiedades por defecto para stagger
    const defaultAnimatableOptions = {
      opacity: [0, 1],
      y: [30, 0],
      ...animatableOptions,
    };

    const configOptions = {
      duration,
      easing,
      delay,
      ...(repeat !== undefined && { repeat }),
    };

    try {
      const animation = animate(
        selector,
        defaultAnimatableOptions,
        configOptions
      );
      animations.value.add(animation);
      return animation;
    } catch (error) {
      console.warn("Animation error:", error);
      return null;
    }
  };

  /**
   * Configura animaciones de hover para un elemento.
   * Aplica escalado por defecto en mouseenter/mouseleave.
   *
   * @param {HTMLElement} element - Elemento DOM para aplicar hover
   * @param {Object} enterOptions - Opciones para animación de entrada
   * @param {Object} leaveOptions - Opciones para animación de salida
   * @returns {Function} Función de cleanup para remover event listeners
   */
  const animateHover = (element, enterOptions = {}, leaveOptions = {}) => {
    if (!element) return;

    const {
      easing: enterEasing = "ease-out",
      duration: enterDuration = 0.2,
      ...enterAnimatableOptions
    } = enterOptions;

    const {
      easing: leaveEasing = "ease-out",
      duration: leaveDuration = 0.2,
      ...leaveAnimatableOptions
    } = leaveOptions;

    // Configuraciones por defecto para hover
    const defaultEnter = {
      scale: 1.05, // Escalado ligero en hover
      ...enterAnimatableOptions,
    };

    const defaultLeave = {
      scale: 1, // Volver al tamaño original
      ...leaveAnimatableOptions,
    };

    const enterConfig = {
      duration: enterDuration,
      easing: enterEasing,
    };

    const leaveConfig = {
      duration: leaveDuration,
      easing: leaveEasing,
    };

    // Event handlers
    const handleMouseEnter = () => {
      try {
        const animation = animate(element, defaultEnter, enterConfig);
        animations.value.add(animation);
      } catch (error) {
        console.warn("Hover enter animation error:", error);
      }
    };

    const handleMouseLeave = () => {
      try {
        const animation = animate(element, defaultLeave, leaveConfig);
        animations.value.add(animation);
      } catch (error) {
        console.warn("Hover leave animation error:", error);
      }
    };

    // Agregar event listeners
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    // Retornar función de cleanup
    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  };

  /**
   * Crea una animación de loading infinita.
   * Aplica pulso de opacidad y escala para indicar carga.
   *
   * @param {string|HTMLElement|NodeList} selector - Selector o elementos a animar
   * @returns {Object|null} Instancia de animación o null si falla
   */
  const animateLoading = async (selector) => {
    await nextTick();

    // Validar que existan elementos antes de animar
    const elements =
      typeof selector === "string"
        ? document.querySelectorAll(selector)
        : selector;
    if (!elements || (elements.length !== undefined && elements.length === 0)) {
      console.warn(`No elements found for selector: ${selector}`);
      return null;
    }

    try {
      const animation = animate(
        selector,
        {
          opacity: [0.5, 1, 0.5], // Pulso de opacidad
          scale: [0.95, 1, 0.95], // Pulso de escala
        },
        {
          duration: 2,
          repeat: Infinity, // Repetir infinitamente
          easing: "ease-in-out",
        }
      );
      animations.value.add(animation);
      return animation;
    } catch (error) {
      console.warn("Loading animation error:", error);
      return null;
    }
  };

  /**
   * Cleanup automático al desmontar el componente.
   * Detiene todas las animaciones activas para prevenir memory leaks.
   */
  onUnmounted(() => {
    animations.value.forEach((animation) => {
      cleanupAnimation(animation);
    });
    animations.value.clear();
  });

  return {
    // Funciones principales de animación
    animateIn, // Animación de entrada
    animateOut, // Animación de salida
    animateStagger, // Animación con retraso secuencial
    animateHover, // Configurar hover animations
    animateLoading, // Animación de loading infinita
    cleanupAnimation, // Limpiar animación específica
  };
}
