import { ref, computed } from "vue";
import { useI18n } from "./useI18n.js";

/**
 * Composable que proporciona la configuración y datos de los niveles JLPT.
 * Gestiona la información de cada nivel incluyendo descripción, dificultad,
 * colores del tema y estimaciones de cantidad de kanjis.
 *
 * @returns {Object} Un objeto con los datos de los niveles JLPT
 */
export function useJLPTLevels() {
  const { t } = useI18n();

  /**
   * Computed que retorna la configuración completa de todos los niveles JLPT.
   * Incluye los 5 niveles oficiales (N5-N1) más una opción de configuración.
   * Cada nivel contiene:
   * - level: Identificador del nivel (ej: "JLPT-5")
   * - description: Descripción del nivel en el idioma actual
   * - kanji: Caracteres representativos del nivel
   * - color: Clases CSS para gradientes de color
   * - difficulty: Traducción de la dificultad
   * - estimated: Estimación de cantidad de kanjis
   * - isConfig: Marca especial para la opción de configuración
   */
  const kanjiLevels = computed(() => [
    {
      level: "JLPT-5",
      description:
        "Nivel básico, para aquellos que desean aprender los fundamentos del japonés.",
      kanji: "日本語", // "japonés" - caracteres representativos para principiantes
      color: "from-verdeMatcha to-azulIndigo",
      difficulty: t("levels.N5"),
      estimated: t("estimations.N5"),
    },
    {
      level: "JLPT-4",
      description: "Nivel intermedio, para quienes ya conocen lo básico.",
      kanji: "学習", // "aprendizaje" - enfoque en el estudio
      color: "from-airForceBlue to-Aonobi",
      difficulty: t("levels.N4"),
      estimated: t("estimations.N4"),
    },
    {
      level: "JLPT-3",
      description:
        "Nivel avanzado, para estudiantes con buen conocimiento de kanjis.",
      kanji: "勉強", // "estudio" - aprendizaje más serio
      color: "from-coquelicot to-cardinal",
      difficulty: t("levels.N3"),
      estimated: t("estimations.N3"),
    },
    {
      level: "JLPT-2",
      description:
        "Nivel superior, para quienes buscan un dominio más profundo.",
      kanji: "準備", // "preparación" - preparación para nivel avanzado
      color: "from-Benibana to-firebrick",
      difficulty: t("levels.N2"),
      estimated: t("estimations.N2"),
    },
    {
      level: "JLPT-1",
      description:
        "Nivel experto, para quienes desean alcanzar la fluidez total.",
      kanji: "完璧", // "perfección" - dominio completo
      color: "from-RojoCarmesi to-cardinal",
      difficulty: t("levels.N1"),
      estimated: t("estimations.N1"),
    },
    {
      level: t("levels.CONFIG"),
      description:
        "Ajustes de la aplicación, personaliza tu experiencia de aprendizaje.",
      kanji: "設定", // "configuración"
      color: "from-MossGreen to-HunterGree",
      difficulty: t("levels.CONFIG"),
      estimated: t("estimations.CONFIG"),
      isConfig: true, // Marca especial para identificar esta opción como configuración
    },
  ]);

  return {
    kanjiLevels,
  };
}
