import { ref, computed } from "vue";

export function useKanjiValidation(props) {
  const userInputMeaning = ref("");
  const userInputOn = ref("");
  const userInputKun = ref("");
  const attempts = ref(0);
  const showAnswer = ref(false);
  const isCorrect = ref(null);
  const matchedReadingType = ref("");
  const showHint = ref(false);
  const maxAttempts = 3;

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

    let normalized = text.toLowerCase().trim().replace(/\s+/g, "");
    normalized = normalized.replace(/[-・。、～〜]/g, "");
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

  // Función para obtener una pista
  const getHint = () => {
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

    return `Significado: ${meaningHint}, On: ${onHint}, Kun: ${kunHint}`;
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
      const result = validateField(
        userInputOn.value,
        props.CorrectReadingOn,
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
      const result = validateField(
        userInputKun.value,
        props.CorrectReadingKun,
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
        matchedReadingType.value = `todas las respuestas disponibles incorrectas`;
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

    // Funciones
    validateAnswer,
    resetValidation,
    getHint,
    normalizeText,
  };
}
