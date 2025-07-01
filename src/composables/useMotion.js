import { ref, onUnmounted, nextTick } from "vue";
import { animate, stagger } from "motion";

export function useMotion() {
  const animations = ref(new Set());

  // Función para limpiar animaciones
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

  // Función para animar entrada
  const animateIn = async (selector, options = {}) => {
    await nextTick();

    const {
      easing = "ease-out",
      duration = 0.6,
      delay,
      repeat,
      ...animatableOptions
    } = options;

    const defaultAnimatableOptions = {
      opacity: [0, 1],
      y: [20, 0],
      ...animatableOptions,
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

  // Función para animar salida
  const animateOut = async (selector, options = {}) => {
    await nextTick();

    const {
      easing = "ease-in",
      duration = 0.4,
      delay,
      repeat,
      ...animatableOptions
    } = options;

    const defaultAnimatableOptions = {
      opacity: [1, 0],
      y: [0, -20],
      ...animatableOptions,
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

  // Función para animar con stagger (elementos secuenciales)
  const animateStagger = async (selector, options = {}) => {
    await nextTick();

    const {
      easing = "ease-out",
      duration = 0.5,
      delay = stagger(0.1),
      repeat,
      ...animatableOptions
    } = options;

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

  // Función para hover animation
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

    const defaultEnter = {
      scale: 1.05,
      ...enterAnimatableOptions,
    };

    const defaultLeave = {
      scale: 1,
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

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  };

  // Función para loading animation
  const animateLoading = async (selector) => {
    await nextTick();

    try {
      const animation = animate(
        selector,
        {
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1, 0.95],
        },
        {
          duration: 2,
          repeat: Infinity,
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

  // Cleanup al desmontar
  onUnmounted(() => {
    animations.value.forEach((animation) => {
      cleanupAnimation(animation);
    });
    animations.value.clear();
  });

  return {
    animateIn,
    animateOut,
    animateStagger,
    animateHover,
    animateLoading,
    cleanupAnimation,
  };
}
