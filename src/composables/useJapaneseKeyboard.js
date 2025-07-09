import { ref, watch, onUnmounted } from "vue";

/**
 * Composable para manejar el teclado japonés virtual.
 * Proporciona funcionalidad para entrada de caracteres japoneses,
 * gestión de dakuten/handakuten y control del input activo.
 *
 * @returns {Object} Estados y funciones para el teclado japonés
 */
export function useJapaneseKeyboard() {
  // Estados reactivos del teclado
  const showKeyboard = ref(false); // Controla la visibilidad del teclado
  const activeInput = ref("meaning"); // Input activo: 'meaning', 'on' o 'kun'

  /**
   * Mapeo para conversión dakuten (゛).
   * Convierte caracteres kana básicos a sus versiones con dakuten.
   * Ejemplo: か → が, さ → ざ, etc.
   */
  const dakutenMap = {
    // Hiragana
    か: "が",
    き: "ぎ",
    く: "ぐ",
    け: "げ",
    こ: "ご",
    さ: "ざ",
    し: "じ",
    す: "ず",
    せ: "ぜ",
    そ: "ぞ",
    た: "だ",
    ち: "ぢ",
    つ: "づ",
    て: "で",
    と: "ど",
    は: "ば",
    ひ: "び",
    ふ: "ぶ",
    へ: "べ",
    ほ: "ぼ",
    // Katakana
    カ: "ガ",
    キ: "ギ",
    ク: "グ",
    ケ: "ゲ",
    コ: "ゴ",
    サ: "ザ",
    シ: "ジ",
    ス: "ズ",
    セ: "ゼ",
    ソ: "ゾ",
    タ: "ダ",
    チ: "ヂ",
    ツ: "ヅ",
    テ: "デ",
    ト: "ド",
    ハ: "バ",
    ヒ: "ビ",
    フ: "ブ",
    ヘ: "ベ",
    ホ: "ボ",
  };

  /**
   * Mapeo para conversión handakuten (゜).
   * Convierte caracteres de la serie 'ha' a sus versiones con handakuten (sonido 'pa').
   * Solo aplica a: は、ひ、ふ、へ、ほ y sus equivalentes katakana.
   */
  const handakutenMap = {
    // Hiragana
    は: "ぱ",
    ひ: "ぴ",
    ふ: "ぷ",
    へ: "ぺ",
    ほ: "ぽ",
    // Katakana
    ハ: "パ",
    ヒ: "ピ",
    フ: "プ",
    ヘ: "ペ",
    ホ: "ポ",
  };

  /**
   * Maneja la entrada de texto desde el teclado japonés.
   * Agrega el caracter seleccionado al input activo si está disponible.
   *
   * @param {string} char - Caracter japonés a agregar
   * @param {Object} userInputs - Referencias reactivas de los inputs del usuario
   * @param {Object} availableInputs - Estados que indican qué inputs están disponibles
   */
  const handleKeyboardInput = (char, userInputs, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    // Agregar caracter al input activo según disponibilidad
    if (activeInput.value === "meaning" && meaningAvailable.value) {
      userInputs.userInputMeaning.value += char;
    } else if (activeInput.value === "on" && onReadingAvailable.value) {
      userInputs.userInputOn.value += char;
    } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
      userInputs.userInputKun.value += char;
    }
  };

  /**
   * Limpia completamente el contenido del input activo.
   * Solo opera si el input activo está disponible para edición.
   *
   * @param {Object} userInputs - Referencias reactivas de los inputs del usuario
   * @param {Object} availableInputs - Estados que indican qué inputs están disponibles
   */
  const handleKeyboardClear = (userInputs, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    // Limpiar el input activo según disponibilidad
    if (activeInput.value === "meaning" && meaningAvailable.value) {
      userInputs.userInputMeaning.value = "";
    } else if (activeInput.value === "on" && onReadingAvailable.value) {
      userInputs.userInputOn.value = "";
    } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
      userInputs.userInputKun.value = "";
    }
  };

  /**
   * Maneja la conversión de caracteres especiales (dakuten y handakuten).
   * Convierte el último caracter del input activo usando los mapeos correspondientes.
   *
   * @param {string} type - Tipo de conversión: "dakuten" o "handakuten"
   * @param {Object} userInputs - Referencias reactivas de los inputs del usuario
   * @param {Object} availableInputs - Estados que indican qué inputs están disponibles
   */
  const handleSpecialChar = (type, userInputs, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;
    let currentValue = "";

    // Obtener el valor actual del input activo
    if (activeInput.value === "meaning" && meaningAvailable.value) {
      currentValue = userInputs.userInputMeaning.value;
    } else if (activeInput.value === "on" && onReadingAvailable.value) {
      currentValue = userInputs.userInputOn.value;
    } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
      currentValue = userInputs.userInputKun.value;
    }

    // No procesar si el input está vacío
    if (currentValue.length === 0) return;

    // Obtener el último caracter para convertir
    const lastChar = currentValue[currentValue.length - 1];
    let convertedChar = "";

    // Aplicar la conversión según el tipo solicitado
    if (type === "dakuten") {
      convertedChar = dakutenMap[lastChar];
    } else if (type === "handakuten") {
      convertedChar = handakutenMap[lastChar];
    }

    // Si hay conversión disponible, actualizar el input
    if (convertedChar) {
      const newValue = currentValue.slice(0, -1) + convertedChar;

      if (activeInput.value === "meaning" && meaningAvailable.value) {
        userInputs.userInputMeaning.value = newValue;
      } else if (activeInput.value === "on" && onReadingAvailable.value) {
        userInputs.userInputOn.value = newValue;
      } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
        userInputs.userInputKun.value = newValue;
      }
    }
  };

  /**
   * Establece el input activo del teclado.
   * Solo cambia si el input solicitado está disponible para edición.
   *
   * @param {string} inputType - Tipo de input: "meaning", "on" o "kun"
   * @param {Object} availableInputs - Estados que indican qué inputs están disponibles
   */
  const setActiveInput = (inputType, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    // Solo cambiar si el input está disponible
    if (inputType === "meaning" && meaningAvailable.value) {
      activeInput.value = inputType;
    } else if (inputType === "on" && onReadingAvailable.value) {
      activeInput.value = inputType;
    } else if (inputType === "kun" && kunReadingAvailable.value) {
      activeInput.value = inputType;
    }
  };

  /**
   * Establece el primer input disponible como activo.
   * Utilizado al inicializar o cuando el input actual no está disponible.
   * Prioridad: meaning > on > kun
   *
   * @param {Object} availableInputs - Estados que indican qué inputs están disponibles
   */
  const setFirstAvailableInput = (availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    if (meaningAvailable.value) {
      activeInput.value = "meaning";
    } else if (onReadingAvailable.value) {
      activeInput.value = "on";
    } else if (kunReadingAvailable.value) {
      activeInput.value = "kun";
    } else {
      activeInput.value = "meaning"; // fallback por defecto
    }
  };

  /**
   * Alterna la visibilidad del teclado japonés.
   * Reproduce un sonido de click antes de cambiar el estado.
   *
   * @param {Function} playButtonClick - Función para reproducir sonido de click
   */
  const toggleKeyboard = (playButtonClick) => {
    playButtonClick();
    showKeyboard.value = !showKeyboard.value;
  };

  /**
   * Cierra el teclado japonés.
   * Método directo sin sonido, usado generalmente por eventos automáticos.
   */
  const closeKeyboard = () => {
    showKeyboard.value = false;
  };

  /**
   * Watcher para manejar el scroll del body cuando el teclado está activo.
   * Previene el scroll cuando el teclado está visible para mejorar UX en móviles.
   */
  watch(showKeyboard, (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden"; // Bloquear scroll
    } else {
      document.body.style.overflow = ""; // Restaurar scroll
    }
  });

  /**
   * Limpieza al desmontar el componente.
   * Restaura el overflow del body para evitar efectos secundarios.
   */
  onUnmounted(() => {
    document.body.style.overflow = "";
  });

  return {
    // Estados reactivos
    showKeyboard, // Visibilidad del teclado
    activeInput, // Input actualmente seleccionado

    // Funciones públicas para manejo del teclado
    handleKeyboardInput, // Agregar caracteres al input
    handleKeyboardClear, // Limpiar input activo
    handleSpecialChar, // Aplicar dakuten/handakuten
    setActiveInput, // Cambiar input activo
    setFirstAvailableInput, // Establecer primer input disponible
    toggleKeyboard, // Alternar visibilidad
    closeKeyboard, // Cerrar teclado
  };
}
