/**
 * useCursorTrail.js
 *
 * Composable para crear efectos visuales de rastro del cursor.
 * Genera partículas animadas que siguen el movimiento del mouse con colores
 * adaptativos según el tema actual (claro/oscuro).
 *
 * Características:
 * - Rastro dinámico basado en la velocidad del mouse
 * - Colores adaptativos según el tema
 * - Tamaño variable de partículas según velocidad
 * - Límite automático de partículas para rendimiento
 * - Animaciones suaves con requestAnimationFrame
 *
 * @author Learn Kanji Project
 * @since 1.0.0
 */

import { ref, onMounted, onUnmounted } from "vue";
import { useTheme } from "./useTheme.js";

/**
 * Composable para manejar efectos de rastro del cursor
 *
 * @returns {Object} Objeto con funciones y estados del cursor trail
 * @example
 * const { cursorTrails, initCursorTrail, cleanupCursorTrail } = useCursorTrail();
 * onMounted(() => initCursorTrail());
 * onUnmounted(() => cleanupCursorTrail());
 */
export function useCursorTrail() {
  const { isDarkMode } = useTheme();

  // ===== ESTADO REACTIVO =====
  /** @type {Ref<Array>} Array de partículas del rastro del cursor */
  const cursorTrails = ref([]);

  /** @type {Ref<number>} ID único para cada partícula */
  const trailId = ref(0);

  /** @type {Ref<Object>} Última posición registrada del mouse */
  const lastMousePosition = ref({ x: 0, y: 0 });

  /** @type {Ref<number>} Velocidad actual del mouse */
  const mouseSpeed = ref(0);

  // ===== CONFIGURACIÓN DE COLORES =====
  /**
   * Paleta de colores para tema claro
   * @type {string[]}
   */
  const lightColors = [
    "#90A955", // MossGreen
    "#4F772D", // FernGreen
    "#7FB069", // Asparagus
    "#56876D", // Viridian
  ];

  /**
   * Paleta de colores para tema oscuro
   * @type {string[]}
   */
  const darkColors = [
    "#4F98CD", // ColumbianBlue
    "#2E5BBA", // SapphireBlue
    "#15457B", // PrussianBlue
    "#1E3A5F", // SpaceCadet
  ];

  // ===== FUNCIONES PRINCIPALES =====
  /**
   * Crea una nueva partícula de rastro en la posición del cursor
   * Solo crea partículas si el mouse se mueve con suficiente velocidad
   *
   * @param {MouseEvent} e - Evento de movimiento del mouse
   */
  const createCursorTrail = (e) => {
    // Calcular velocidad del mouse
    const deltaX = e.clientX - lastMousePosition.value.x;
    const deltaY = e.clientY - lastMousePosition.value.y;
    mouseSpeed.value = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    lastMousePosition.value = { x: e.clientX, y: e.clientY };

    // Solo crear trail si el mouse se está moviendo con velocidad mínima
    if (mouseSpeed.value > 2) {
      // Seleccionar colores según el tema actual
      const colors = isDarkMode.value ? darkColors : lightColors;
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Calcular tamaño basado en velocidad (mín: 6, máx: 16)
      const size = Math.min(6 + mouseSpeed.value * 0.3, 16);

      // Crear objeto de partícula
      const trail = {
        id: trailId.value++, // ID único
        x: e.clientX, // Posición X
        y: e.clientY, // Posición Y
        life: 1.0, // Vida inicial (1.0 = 100%)
        size: size, // Tamaño de la partícula
        color: randomColor, // Color seleccionado
        blur: Math.random() * 2 + 1, // Efecto blur aleatorio
      };

      cursorTrails.value.push(trail);

      // Limitar número de partículas para optimizar rendimiento
      const maxTrails = Math.min(15, 8 + Math.floor(mouseSpeed.value * 0.2));
      if (cursorTrails.value.length > maxTrails) {
        cursorTrails.value.shift(); // Eliminar la más antigua
      }
    }
  };

  /**
   * Actualiza y anima todas las partículas del rastro
   * Reduce la vida de cada partícula y elimina las que expiran
   * Se ejecuta continuamente usando requestAnimationFrame
   */
  const updateTrails = () => {
    // Filtrar partículas vivas y actualizar su vida
    cursorTrails.value = cursorTrails.value.filter((trail) => {
      trail.life -= 0.08; // Reducir vida gradualmente
      return trail.life > 0; // Mantener solo las vivas
    });

    // Continuar animación en el siguiente frame
    requestAnimationFrame(updateTrails);
  };

  /**
   * Inicializa el sistema de rastro del cursor
   * Configura el event listener y comienza la animación
   *
   * @example
   * onMounted(() => {
   *   initCursorTrail();
   * });
   */
  const initCursorTrail = () => {
    document.addEventListener("mousemove", createCursorTrail);
    updateTrails(); // Iniciar loop de animación
  };

  /**
   * Limpia el sistema de rastro del cursor
   * Remueve event listeners para evitar memory leaks
   *
   * @example
   * onUnmounted(() => {
   *   cleanupCursorTrail();
   * });
   */
  const cleanupCursorTrail = () => {
    document.removeEventListener("mousemove", createCursorTrail);
  };

  // ===== RETORNO DEL COMPOSABLE =====
  return {
    /** Array reactivo de partículas del rastro */
    cursorTrails,
    /** Función para inicializar el sistema */
    initCursorTrail,
    /** Función para limpiar el sistema */
    cleanupCursorTrail,
  };
}
