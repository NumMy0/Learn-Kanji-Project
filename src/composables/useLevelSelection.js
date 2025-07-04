import { ref } from "vue";
import { useI18n } from "./useI18n.js";

export function useLevelSelection(getSublevelsInfo, router) {
  // Estado para subniveles
  const selectedLevel = ref("");
  const availableSublevels = ref([]);
  const loadingSublevels = ref(false);

  // Usar i18n para traducciones
  const { tInterpolate } = useI18n();

  // Función para manejar selección de nivel
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

  // Función para cargar subniveles
  const loadSublevels = async (level) => {
    try {
      loadingSublevels.value = true;
      const info = await getSublevelsInfo(level);

      availableSublevels.value = [];
      for (let i = 1; i <= info.totalSublevels; i++) {
        const startIndex = (i - 1) * 100;
        const endIndex = Math.min(startIndex + 100, info.totalKanjis);
        const kanjiCount = endIndex - startIndex;

        // Determinar dificultad basada en el subnivel
        let difficulty = "sublevelDifficulties.basic";
        if (i > Math.ceil(info.totalSublevels / 3)) {
          difficulty = "sublevelDifficulties.advanced";
        } else if (i > 1) {
          difficulty = "sublevelDifficulties.intermediate";
        }

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

  // Función para seleccionar subnivel
  const selectSublevel = (sublevel, playButtonClick, closeModal) => {
    playButtonClick();
    router.push(`/kanji/${selectedLevel.value}?sublevel=${sublevel}`);
    closeModal();
  };

  return {
    // Estados
    selectedLevel,
    availableSublevels,
    loadingSublevels,

    // Funciones
    handleLevelSelection,
    loadSublevels,
    selectSublevel,
  };
}
