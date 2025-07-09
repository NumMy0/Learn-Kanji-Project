import { ref } from "vue";
import { useI18n } from "./useI18n.js";

/**
 * Composable para manejar la selección de niveles JLPT y subniveles.
 * Proporciona funcionalidad para cargar información de subniveles,
 * determinar la navegación apropiada y gestionar el modal de selección.
 *
 * @param {Function} getSublevelsInfo - Función para obtener información de subniveles
 * @param {Object} router - Router de Vue para navegación
 * @returns {Object} Estados y funciones para la selección de niveles
 */
export function useLevelSelection(getSublevelsInfo, router) {
  // Estados reactivos para el manejo de subniveles
  const selectedLevel = ref(""); // Nivel actualmente seleccionado (ej: "jlpt-5")
  const availableSublevels = ref([]); // Lista de subniveles disponibles para el nivel
  const loadingSublevels = ref(false); // Estado de carga de subniveles

  // Obtener función de interpolación de traducciones
  const { tInterpolate } = useI18n();

  /**
   * Maneja la selección de un nivel JLPT.
   * Determina si debe mostrar el modal de subniveles o navegar directamente.
   *
   * @param {Object} levelItem - Objeto del nivel seleccionado con propiedades como level, description, etc.
   * @param {Function} playButtonClick - Función para reproducir sonido de click
   * @param {Function} openSublevelModal - Función para abrir el modal de subniveles
   */
  const handleLevelSelection = async (
    levelItem,
    playButtonClick,
    openSublevelModal
  ) => {
    playButtonClick();
    const level = levelItem.level.toLowerCase();

    try {
      // Obtener información de subniveles para el nivel seleccionado
      const info = await getSublevelsInfo(level);

      // Si tiene más de un subnivel, mostrar modal de selección
      if (info.totalSublevels > 1) {
        selectedLevel.value = level;
        await loadSublevels(level);
        openSublevelModal();
      } else {
        // Si solo tiene un subnivel, navegar directamente
        router.push(`/kanji/${level}`);
      }
    } catch (error) {
      console.error("Error checking sublevels for level:", level, error);
      // En caso de error, navegar directamente
      router.push(`/kanji/${level}`);
    }
  };

  /**
   * Carga los subniveles disponibles para un nivel específico.
   * Genera la información de cada subnivel incluyendo rango de kanjis,
   * descripción traducida y nivel de dificultad.
   *
   * @param {string} level - El nivel para el cual cargar subniveles (ej: "jlpt-5")
   */
  const loadSublevels = async (level) => {
    try {
      loadingSublevels.value = true;
      const info = await getSublevelsInfo(level);

      availableSublevels.value = [];

      // Generar información para cada subnivel
      for (let i = 1; i <= info.totalSublevels; i++) {
        const startIndex = (i - 1) * 100; // Cada subnivel tiene 100 kanjis máximo
        const endIndex = Math.min(startIndex + 100, info.totalKanjis);
        const kanjiCount = endIndex - startIndex;

        // Determinar dificultad basada en el subnivel
        // Los subniveles iniciales son básicos, medios intermedios, finales avanzados
        let difficulty = "sublevelDifficulties.basic";
        if (i > Math.ceil(info.totalSublevels / 3)) {
          difficulty = "sublevelDifficulties.advanced";
        } else if (i > 1) {
          difficulty = "sublevelDifficulties.intermediate";
        }

        // Agregar subnivel a la lista con toda su información
        availableSublevels.value.push({
          sublevel: i,
          name: tInterpolate("sublevelName", { number: i }),
          description: tInterpolate("sublevelDescription", {
            start: startIndex + 1,
            end: endIndex,
          }),
          kanjiCount: kanjiCount,
          difficulty: tInterpolate(difficulty),
        });
      }
    } catch (error) {
      console.error("Error loading sublevels:", error);
    } finally {
      loadingSublevels.value = false;
    }
  };

  /**
   * Maneja la selección de un subnivel específico.
   * Reproduce sonido, navega a la ruta del subnivel y cierra el modal.
   *
   * @param {number} sublevel - Número del subnivel seleccionado
   * @param {Function} playButtonClick - Función para reproducir sonido de click
   * @param {Function} closeModal - Función para cerrar el modal de subniveles
   */
  const selectSublevel = (sublevel, playButtonClick, closeModal) => {
    playButtonClick();
    router.push(`/kanji/${selectedLevel.value}?sublevel=${sublevel}`);
    closeModal();
  };

  return {
    // Estados reactivos
    selectedLevel,
    availableSublevels,
    loadingSublevels,

    // Funciones públicas
    handleLevelSelection,
    loadSublevels,
    selectSublevel,
  };
}
