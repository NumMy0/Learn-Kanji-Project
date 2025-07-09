import { ref, computed } from "vue";
import { useI18n } from "./useI18n";

/**
 * Composable para manejar la validación de respuestas de kanji.
 * Proporciona lógica completa para validar significados y lecturas On/Kun,
 * con soporte para múltiples respuestas válidas y normalización de texto.
 *
 * @param {Object} props - Props del componente con datos del kanji
 * @param {Object} initialValidReadings - Lecturas válidas iniciales
 * @returns {Object} Estados y funciones para validación de kanji
 */
export function useKanjiValidation(props, initialValidReadings = {}) {
  // Estado reactivo para las lecturas válidas (se actualiza dinámicamente)
  const validReadings = ref({
    AllValidOnReadings: initialValidReadings.AllValidOnReadings || [],
    AllValidKunReadings: initialValidReadings.AllValidKunReadings || [],
    AllValidMeanings: initialValidReadings.AllValidMeanings || [],
  });

  // Estados de entrada del usuario
  const userInputMeaning = ref(""); // Entrada de significado
  const userInputOn = ref(""); // Entrada de lectura On
  const userInputKun = ref(""); // Entrada de lectura Kun

  // Estados de validación
  const attempts = ref(0); // Número de intentos realizados
  const showAnswer = ref(false); // Mostrar respuesta correcta
  const isCorrect = ref(null); // Resultado de validación (true/false/null)
  const matchedReadingType = ref(""); // Tipo de lectura que coincidió
  const showHint = ref(false); // Mostrar pista al usuario
  const maxAttempts = 3; // Máximo número de intentos permitidos

  /**
   * Actualiza las lecturas válidas cuando cambia el kanji.
   * Permite al composable trabajar con datos dinámicos.
   *
   * @param {Object} newValidReadings - Nuevas lecturas válidas
   */
  const updateValidReadings = (newValidReadings) => {
    validReadings.value = {
      AllValidOnReadings: newValidReadings.AllValidOnReadings || [],
      AllValidKunReadings: newValidReadings.AllValidKunReadings || [],
      AllValidMeanings: newValidReadings.AllValidMeanings || [],
    };
  };

  /**
   * Computed que verifica si el significado está disponible para validación.
   * Excluye datos marcados como "no disponible".
   */
  const meaningAvailable = computed(() => {
    return (
      props.CorrectMeaning && !props.CorrectMeaning.includes("no disponible")
    );
  });

  /**
   * Computed que verifica si la lectura On está disponible para validación.
   */
  const onReadingAvailable = computed(() => {
    return (
      props.CorrectReadingOn &&
      !props.CorrectReadingOn.includes("no disponible")
    );
  });

  /**
   * Computed que verifica si la lectura Kun está disponible para validación.
   */
  const kunReadingAvailable = computed(() => {
    return (
      props.CorrectReadingKun &&
      !props.CorrectReadingKun.includes("no disponible")
    );
  });

  /**
   * Computed que verifica si hay al menos un tipo de dato disponible.
   */
  const kanjiDataAvailable = computed(() => {
    return (
      meaningAvailable.value ||
      onReadingAvailable.value ||
      kunReadingAvailable.value
    );
  });

  /**
   * Computed que verifica si todos los inputs disponibles están completos.
   * Solo considera los campos que están disponibles para validación.
   */
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

  /**
   * Computed que determina si se puede validar la respuesta.
   * Requiere que todos los inputs estén llenos y que haya datos disponibles.
   */
  const canValidateAnswer = computed(() => {
    return allInputsFilled.value && kanjiDataAvailable.value;
  });

  /**
   * Computed para el texto dinámico del botón de validación.
   */
  const buttonText = computed(() => {
    if (!kanjiDataAvailable.value) {
      return "No hay datos disponibles";
    }
    if (!allInputsFilled.value) {
      return "Completa todas las respuestas disponibles";
    }
    return "Validar Respuestas";
  });

  /**
   * Computed que determina si el botón debe estar deshabilitado.
   */
  const isButtonDisabled = computed(() => {
    return !canValidateAnswer.value;
  });

  /**
   * Computed para calcular el progreso basado en intentos.
   */
  const progressPercent = computed(() => {
    if (attempts.value === 0) return 0;
    return Math.min((attempts.value / maxAttempts) * 100, 100);
  });

  /**
   * Normaliza texto para comparación de respuestas.
   * Elimina espacios, puntuación y caracteres especiales, manteniendo solo
   * caracteres japoneses y alfanuméricos.
   *
   * @param {string} text - Texto a normalizar
   * @returns {string} Texto normalizado
   */
  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return "";

    // Convertir a minúsculas y eliminar espacios
    let normalized = text.toLowerCase().trim().replace(/\s+/g, "");

    // Eliminar signos de puntuación japonesa comunes
    normalized = normalized.replace(/[-・。、～〜.]/g, "");

    // Preservar solo caracteres japoneses (hiragana, katakana) y alfanuméricos
    normalized = normalized.replace(
      /[^\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9]/g,
      ""
    );

    return normalized;
  };

  /**
   * Valida un campo individual contra una respuesta correcta.
   * Método simple para validación directa.
   *
   * @param {string} userInput - Entrada del usuario
   * @param {string} correctAnswer - Respuesta correcta
   * @param {string} fieldName - Nombre del campo para identificación
   * @returns {Object} Resultado de validación con isCorrect y fieldName
   */
  const validateField = (userInput, correctAnswer, fieldName) => {
    const userNormalized = normalizeText(userInput);
    const correctNormalized = normalizeText(correctAnswer);
    const isCorrect = userNormalized === correctNormalized;

    return { isCorrect, fieldName };
  };

  /**
   * Valida un campo contra múltiples respuestas válidas.
   * Especializado para lecturas On/Kun y significados que pueden tener múltiples variantes.
   *
   * @param {string} userInput - Entrada del usuario
   * @param {Array} validReadings - Array de respuestas válidas
   * @param {string} fieldName - Nombre del campo para identificación
   * @returns {Object} Resultado de validación
   */
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

    // Normalizar todas las lecturas válidas para comparación
    const normalizedValidReadings = validReadings.map((r) => normalizeText(r));

    // Verificar si el input del usuario coincide con alguna lectura válida
    const fieldIsCorrect = normalizedValidReadings.includes(userNormalized);

    return { isCorrect: fieldIsCorrect, fieldName };
  };

  /**
   * Genera una pista mostrando las primeras letras de cada respuesta.
   * Útil cuando el usuario ha fallado múltiples veces.
   *
   * @returns {string} Texto de pista con prefijos de las respuestas
   */
  const getHint = () => {
    const { t } = useI18n();
    const meaning = props.CorrectMeaning || "";
    const onReading = props.CorrectReadingOn || "";
    const kunReading = props.CorrectReadingKun || "";

    // Generar pistas mostrando la mitad de cada respuesta
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

  /**
   * Resetea todos los estados de validación.
   * Utilizado al cambiar de kanji o reiniciar el ejercicio.
   */
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

  /**
   * Función principal de validación de respuestas.
   * Valida todos los campos disponibles y maneja el flujo de intentos,
   * pistas y animaciones de feedback.
   *
   * @param {Function} playButtonClick - Función para sonido de click
   * @param {Function} playCorrectAnswer - Función para sonido de respuesta correcta
   * @param {Function} playIncorrectAnswer - Función para sonido de respuesta incorrecta
   * @param {Function} animateIn - Función para animaciones de feedback
   */
  const validateAnswer = (
    playButtonClick,
    playCorrectAnswer,
    playIncorrectAnswer,
    animateIn
  ) => {
    playButtonClick();

    // Verificar que hay datos disponibles
    if (!kanjiDataAvailable.value) {
      console.error("No hay datos del kanji disponibles para validar");
      isCorrect.value = false;
      matchedReadingType.value = "No hay datos disponibles para validación";
      showAnswer.value = true;
      return;
    }

    // Verificar que todos los campos están llenos
    if (!allInputsFilled.value) {
      return;
    }

    attempts.value++;

    const correctAnswers = [];
    const incorrectAnswers = [];
    let allCorrect = true;

    // Validar significado si está disponible
    if (meaningAvailable.value) {
      // Usar la lista de significados válidos si está disponible, sino usar el significado principal
      const validMeanings =
        validReadings.value &&
        Array.isArray(validReadings.value.AllValidMeanings) &&
        validReadings.value.AllValidMeanings.length > 0
          ? validReadings.value.AllValidMeanings
          : [props.CorrectMeaning];

      const result = validateReadingField(
        userInputMeaning.value,
        validMeanings,
        "significado"
      );
      if (result.isCorrect) {
        correctAnswers.push(result.fieldName);
      } else {
        incorrectAnswers.push(result.fieldName);
        allCorrect = false;
      }
    }

    // Validar lectura On si está disponible
    if (onReadingAvailable.value) {
      // Usar la lista de lecturas On válidas si está disponible, sino usar la respuesta principal
      const validOnReadings =
        validReadings.value &&
        Array.isArray(validReadings.value.AllValidOnReadings) &&
        validReadings.value.AllValidOnReadings.length > 0
          ? validReadings.value.AllValidOnReadings
          : [props.CorrectReadingOn];

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

    // Validar lectura Kun si está disponible
    if (kunReadingAvailable.value) {
      // Usar la lista de lecturas Kun válidas si está disponible, sino usar la respuesta principal
      const validKunReadings =
        validReadings.value &&
        Array.isArray(validReadings.value.AllValidKunReadings) &&
        validReadings.value.AllValidKunReadings.length > 0
          ? validReadings.value.AllValidKunReadings
          : [props.CorrectReadingKun];

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

    // Determinar el resultado final y ejecutar acciones correspondientes
    if (allCorrect && correctAnswers.length > 0) {
      // Todas las respuestas son correctas
      matchedReadingType.value =
        correctAnswers.length === 1
          ? `${correctAnswers[0]} correcta`
          : `todas las respuestas disponibles (${correctAnswers.join(
              ", "
            )}) correctas`;
      isCorrect.value = true;
      showAnswer.value = true;
      playCorrectAnswer();

      // Animación de éxito
      animateIn(".success-animation", {
        scale: [0.8, 1.2, 1],
        opacity: [0, 1],
        duration: 0.6,
        easing: "ease-out",
      });
    } else {
      // Al menos una respuesta es incorrecta
      if (correctAnswers.length > 0) {
        // Respuesta parcialmente correcta
        matchedReadingType.value = `${correctAnswers.join(" y ")} correcta${
          correctAnswers.length > 1 ? "s" : ""
        }, pero ${incorrectAnswers.join(" y ")} incorrecta${
          incorrectAnswers.length > 1 ? "s" : ""
        }`;
      } else {
        // Todas las respuestas incorrectas
        const { t } = useI18n();
        matchedReadingType.value = t("allAnswersIncorrect");
      }
      isCorrect.value = false;
      playIncorrectAnswer();

      // Mostrar respuesta después del máximo de intentos o pista en el segundo intento
      if (attempts.value >= maxAttempts) {
        showAnswer.value = true;
      } else if (attempts.value === 2) {
        showHint.value = true;
      }

      // Animación de error
      animateIn(".error-shake", {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        easing: "ease-in-out",
      });
    }
  };

  console.log("useKanjiValidation initialized with props:", props);

  return {
    // Estados de entrada del usuario
    userInputMeaning,
    userInputOn,
    userInputKun,

    // Estados de validación
    attempts,
    showAnswer,
    isCorrect,
    matchedReadingType,
    showHint,
    maxAttempts,

    // Computed properties para disponibilidad de campos
    meaningAvailable,
    onReadingAvailable,
    kunReadingAvailable,
    kanjiDataAvailable,

    // Computed properties para estado de validación
    allInputsFilled,
    canValidateAnswer,
    buttonText,
    isButtonDisabled,
    progressPercent,

    // Función para actualizar lecturas válidas dinámicamente
    updateValidReadings,

    // Funciones principales
    validateAnswer, // Validación principal
    resetValidation, // Reset del estado
    getHint, // Generación de pistas
    normalizeText, // Normalización de texto para comparación
  };
}
