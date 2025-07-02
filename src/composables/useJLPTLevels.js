import { ref, computed } from "vue";
import { useI18n } from "./useI18n.js";

export function useJLPTLevels() {
  const { t } = useI18n();

  // Datos de los niveles JLPT con traducciones
  const kanjiLevels = computed(() => [
    {
      level: "JLPT-5",
      description:
        "Nivel básico, para aquellos que desean aprender los fundamentos del japonés.",
      kanji: "日本語",
      color: "from-verdeMatcha to-azulIndigo",
      difficulty: t("levels.N5"),
      estimated: t("estimations.N5"),
    },
    {
      level: "JLPT-4",
      description: "Nivel intermedio, para quienes ya conocen lo básico.",
      kanji: "学習",
      color: "from-airForceBlue to-Aonobi",
      difficulty: t("levels.N4"),
      estimated: t("estimations.N4"),
    },
    {
      level: "JLPT-3",
      description:
        "Nivel avanzado, para estudiantes con buen conocimiento de kanjis.",
      kanji: "勉強",
      color: "from-coquelicot to-cardinal",
      difficulty: t("levels.N3"),
      estimated: t("estimations.N3"),
    },
    {
      level: "JLPT-2",
      description:
        "Nivel superior, para quienes buscan un dominio más profundo.",
      kanji: "準備",
      color: "from-Benibana to-firebrick",
      difficulty: t("levels.N2"),
      estimated: t("estimations.N2"),
    },
    {
      level: "JLPT-1",
      description:
        "Nivel experto, para quienes desean alcanzar la fluidez total.",
      kanji: "完璧",
      color: "from-RojoCarmesi to-cardinal",
      difficulty: t("levels.N1"),
      estimated: t("estimations.N1"),
    },
    {
      level: t("levels.CONFIG"),
      description:
        "Ajustes de la aplicación, personaliza tu experiencia de aprendizaje.",
      kanji: "設定",
      color: "from-MossGreen to-HunterGree",
      difficulty: t("levels.CONFIG"),
      estimated: t("estimations.CONFIG"),
      isConfig: true,
    },
  ]);

  return {
    kanjiLevels,
  };
}
