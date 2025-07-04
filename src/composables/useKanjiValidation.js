import { ref, computed } from "vue";
import { useI18n } from "./useI18n";

export function useKanjiValidation(props, initialValidReadings = {}) {
  // Mantenemos las lecturas válidas como ref para poder actualizarlas
  const validReadings = ref({
    AllValidOnReadings: initialValidReadings.AllValidOnReadings || [],
    AllValidKunReadings: initialValidReadings.AllValidKunReadings || [],
  });

  const userInputMeaning = ref("");
  const userInputOn = ref("");
  const userInputKun = ref("");
  const attempts = ref(0);
  const showAnswer = ref(false);
  const isCorrect = ref(null);
  const matchedReadingType = ref("");
  const showHint = ref(false);
  const maxAttempts = 3;

  // Función para actualizar las lecturas válidas cuando cambia el kanji
  const updateValidReadings = (newValidReadings) => {
    console.log(
      "Actualizando lecturas válidas en validación:",
      newValidReadings
    );
    validReadings.value = {
      AllValidOnReadings: newValidReadings.AllValidOnReadings || [],
      AllValidKunReadings: newValidReadings.AllValidKunReadings || [],
    };
  };

  // Computed para verificar qué datos están disponibles
  const meaningAvailable = computed(() => {
    return (
      props.CorrectMeaning && !props.CorrectMeaning.includes("no disponible")
    );
  });

  const onReadingAvailable = computed(() => {
    return (
      props.CorrectReadingOn &&
      !props.CorrectReadingOn.includes("no disponible")
    );
  });

  const kunReadingAvailable = computed(() => {
    return (
      props.CorrectReadingKun &&
      !props.CorrectReadingKun.includes("no disponible")
    );
  });

  const kanjiDataAvailable = computed(() => {
    return (
      meaningAvailable.value ||
      onReadingAvailable.value ||
      kunReadingAvailable.value
    );
  });

  // Computed para verificar si todos los inputs disponibles están llenos
  const allInputsFilled = computed(() => {
    let allFilled = true;

    if (meaningAvailable.value) {
      allFilled = allFilled && userInputMeaning.value.trim();
    }

    if (onReadingAvailable.value) {
      allFilled = allFilled && userInputOn.value.trim();
    }

    if (kunReadingAvailable.value) {
      allFilled = allFilled && userInputKun.value.trim();
    }

    return allFilled;
  });

  // Computed para verificar si se puede validar la respuesta
  const canValidateAnswer = computed(() => {
    return allInputsFilled.value && kanjiDataAvailable.value;
  });

  // Computed para el texto del botón
  const buttonText = computed(() => {
    if (!kanjiDataAvailable.value) {
      return "No hay datos disponibles";
    }
    if (!allInputsFilled.value) {
      return "Completa todas las respuestas disponibles";
    }
    return "Validar Respuestas";
  });

  // Computed para saber si el botón debe estar deshabilitado
  const isButtonDisabled = computed(() => {
    return !canValidateAnswer.value;
  });

  // Computed para el progreso
  const progressPercent = computed(() => {
    if (attempts.value === 0) return 0;
    return Math.min((attempts.value / maxAttempts) * 100, 100);
  });

  // Función para normalizar respuestas
  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return "";

    // Convertir a minúsculas y eliminar espacios
    let normalized = text.toLowerCase().trim().replace(/\s+/g, "");

    // Eliminar signos de puntuación japonesa
    normalized = normalized.replace(/[-・。、～〜.]/g, "");

    // Preservar solo caracteres japoneses (hiragana, katakana) y alfanuméricos
    normalized = normalized.replace(
      /[^\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9]/g,
      ""
    );

    return normalized;
  };

  // Función para validar cada campo individual
  const validateField = (userInput, correctAnswer, fieldName) => {
    const userNormalized = normalizeText(userInput);
    const correctNormalized = normalizeText(correctAnswer);
    const isCorrect = userNormalized === correctNormalized;

    console.log(
      `Validando ${fieldName}:`,
      userNormalized,
      "===",
      correctNormalized,
      "?",
      isCorrect
    );

    return { isCorrect, fieldName };
  };

  // Función especializada para validar lecturas con múltiples opciones válidas
  const validateReadingField = (userInput, validReadings, fieldName) => {
    if (
      !validReadings ||
      !Array.isArray(validReadings) ||
      validReadings.length === 0
    ) {
      console.warn(`No hay lecturas válidas disponibles para ${fieldName}`);
      return { isCorrect: false, fieldName };
    }

    const userNormalized = normalizeText(userInput);

    // Log del input del usuario normalizado
    console.log(
      `Input del usuario normalizado (${fieldName}):`,
      userNormalized
    );

    // Convertir todas las lecturas válidas y mostrarlas para debug
    const normalizedValidReadings = validReadings.map((r) => normalizeText(r));
    console.log(
      `Lecturas válidas normalizadas (${fieldName}):`,
      normalizedValidReadings
    );

    // Verificar si el input del usuario coincide con alguna de las lecturas válidas
    const isCorrect = normalizedValidReadings.includes(userNormalized);

    console.log(
      `Validando ${fieldName}:`,
      userNormalized,
      "contra",
      normalizedValidReadings,
      "?",
      isCorrect
    );

    return { isCorrect, fieldName };
  };

  // Función para obtener una pista
  const getHint = () => {
    const { t } = useI18n();
    const meaning = props.CorrectMeaning || "";
    const onReading = props.CorrectReadingOn || "";
    const kunReading = props.CorrectReadingKun || "";

    const meaningHint = meaning
      ? meaning.substring(0, Math.ceil(meaning.length / 2)) + "..."
      : "N/A";
    const onHint = onReading
      ? onReading.substring(0, Math.ceil(onReading.length / 2)) + "..."
      : "N/A";
    const kunHint = kunReading
      ? kunReading.substring(0, Math.ceil(kunReading.length / 2)) + "..."
      : "N/A";

    return `${t("meaningPrefix")}: ${meaningHint}, ${t(
      "onPrefix"
    )}: ${onHint}, ${t("kunPrefix")}: ${kunHint}`;
  };

  // Función para resetear el estado de validación
  const resetValidation = () => {
    userInputMeaning.value = "";
    userInputOn.value = "";
    userInputKun.value = "";
    showAnswer.value = false;
    isCorrect.value = null;
    attempts.value = 0;
    showHint.value = false;
    matchedReadingType.value = "";
  };

  // Función principal de validación
  const validateAnswer = (
    playButtonClick,
    playCorrectAnswer,
    playIncorrectAnswer,
    animateIn
  ) => {
    playButtonClick();

    if (!kanjiDataAvailable.value) {
      console.error("No hay datos del kanji disponibles para validar");
      isCorrect.value = false;
      matchedReadingType.value = "No hay datos disponibles para validación";
      showAnswer.value = true;
      return;
    }

    if (!allInputsFilled.value) {
      return;
    }

    attempts.value++;

    const correctAnswers = [];
    const incorrectAnswers = [];
    let allCorrect = true;

    // Validar cada campo disponible
    if (meaningAvailable.value) {
      const result = validateField(
        userInputMeaning.value,
        props.CorrectMeaning,
        "significado"
      );
      if (result.isCorrect) {
        correctAnswers.push(result.fieldName);
      } else {
        incorrectAnswers.push(result.fieldName);
        allCorrect = false;
      }
    }

    if (onReadingAvailable.value) {
      // Usar la lista de lecturas On válidas si está disponible, sino usar la respuesta principal
      const validOnReadings =
        validReadings.value &&
        Array.isArray(validReadings.value.AllValidOnReadings) &&
        validReadings.value.AllValidOnReadings.length > 0
          ? validReadings.value.AllValidOnReadings
          : [props.CorrectReadingOn];

      console.log("Validando lectura On con:", validOnReadings);

      const result = validateReadingField(
        userInputOn.value,
        validOnReadings,
        "lectura On"
      );
      if (result.isCorrect) {
        correctAnswers.push(result.fieldName);
      } else {
        incorrectAnswers.push(result.fieldName);
        allCorrect = false;
      }
    }

    if (kunReadingAvailable.value) {
      // Usar la lista de lecturas Kun válidas si está disponible, sino usar la respuesta principal
      const validKunReadings =
        validReadings.value &&
        Array.isArray(validReadings.value.AllValidKunReadings) &&
        validReadings.value.AllValidKunReadings.length > 0
          ? validReadings.value.AllValidKunReadings
          : [props.CorrectReadingKun];

      console.log("Validando lectura Kun con:", validKunReadings);

      const result = validateReadingField(
        userInputKun.value,
        validKunReadings,
        "lectura Kun"
      );
      if (result.isCorrect) {
        correctAnswers.push(result.fieldName);
      } else {
        incorrectAnswers.push(result.fieldName);
        allCorrect = false;
      }
    }

    // Determinar el resultado final
    if (allCorrect && correctAnswers.length > 0) {
      matchedReadingType.value =
        correctAnswers.length === 1
          ? `${correctAnswers[0]} correcta`
          : `todas las respuestas disponibles (${correctAnswers.join(
              ", "
            )}) correctas`;
      isCorrect.value = true;
      showAnswer.value = true;
      playCorrectAnswer();

      animateIn(".success-animation", {
        scale: [0.8, 1.2, 1],
        opacity: [0, 1],
        duration: 0.6,
        easing: "ease-out",
      });
    } else {
      if (correctAnswers.length > 0) {
        matchedReadingType.value = `${correctAnswers.join(" y ")} correcta${
          correctAnswers.length > 1 ? "s" : ""
        }, pero ${incorrectAnswers.join(" y ")} incorrecta${
          incorrectAnswers.length > 1 ? "s" : ""
        }`;
      } else {
        const { t } = useI18n();
        matchedReadingType.value = t("allAnswersIncorrect");
      }
      isCorrect.value = false;
      playIncorrectAnswer();

      if (attempts.value >= maxAttempts) {
        showAnswer.value = true;
      } else if (attempts.value === 2) {
        showHint.value = true;
      }

      animateIn(".error-shake", {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        easing: "ease-in-out",
      });
    }
  };

  return {
    // Estado
    userInputMeaning,
    userInputOn,
    userInputKun,
    attempts,
    showAnswer,
    isCorrect,
    matchedReadingType,
    showHint,
    maxAttempts,

    // Computed
    meaningAvailable,
    onReadingAvailable,
    kunReadingAvailable,
    kanjiDataAvailable,
    allInputsFilled,
    canValidateAnswer,
    buttonText,
    isButtonDisabled,
    progressPercent,

    // Función para actualizar lecturas válidas cuando cambia el kanji
    updateValidReadings,

    // Funciones
    validateAnswer,
    resetValidation,
    getHint,
    normalizeText,
  };
}
