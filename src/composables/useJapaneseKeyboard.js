import { ref, watch, onUnmounted } from "vue";

export function useJapaneseKeyboard() {
  const showKeyboard = ref(false);
  const activeInput = ref("meaning"); // 'meaning', 'on' o 'kun'

  // Mapeo para caracteres especiales
  const dakutenMap = {
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

  const handakutenMap = {
    は: "ぱ",
    ひ: "ぴ",
    ふ: "ぷ",
    へ: "ぺ",
    ほ: "ぽ",
    ハ: "パ",
    ヒ: "ピ",
    フ: "プ",
    ヘ: "ペ",
    ホ: "ポ",
  };

  // Función para manejar entrada de texto del teclado
  const handleKeyboardInput = (char, userInputs, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    if (activeInput.value === "meaning" && meaningAvailable.value) {
      userInputs.userInputMeaning.value += char;
    } else if (activeInput.value === "on" && onReadingAvailable.value) {
      userInputs.userInputOn.value += char;
    } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
      userInputs.userInputKun.value += char;
    }
  };

  // Función para limpiar el input activo
  const handleKeyboardClear = (userInputs, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    if (activeInput.value === "meaning" && meaningAvailable.value) {
      userInputs.userInputMeaning.value = "";
    } else if (activeInput.value === "on" && onReadingAvailable.value) {
      userInputs.userInputOn.value = "";
    } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
      userInputs.userInputKun.value = "";
    }
  };

  // Función para manejar caracteres especiales (dakuten/handakuten)
  const handleSpecialChar = (type, userInputs, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;
    let currentValue = "";

    if (activeInput.value === "meaning" && meaningAvailable.value) {
      currentValue = userInputs.userInputMeaning.value;
    } else if (activeInput.value === "on" && onReadingAvailable.value) {
      currentValue = userInputs.userInputOn.value;
    } else if (activeInput.value === "kun" && kunReadingAvailable.value) {
      currentValue = userInputs.userInputKun.value;
    }

    if (currentValue.length === 0) return;

    const lastChar = currentValue[currentValue.length - 1];
    let convertedChar = "";

    if (type === "dakuten") {
      convertedChar = dakutenMap[lastChar];
    } else if (type === "handakuten") {
      convertedChar = handakutenMap[lastChar];
    }

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

  // Función para establecer el input activo
  const setActiveInput = (inputType, availableInputs) => {
    const { meaningAvailable, onReadingAvailable, kunReadingAvailable } =
      availableInputs;

    if (inputType === "meaning" && meaningAvailable.value) {
      activeInput.value = inputType;
    } else if (inputType === "on" && onReadingAvailable.value) {
      activeInput.value = inputType;
    } else if (inputType === "kun" && kunReadingAvailable.value) {
      activeInput.value = inputType;
    }
  };

  // Función para establecer el primer input disponible como activo
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
      activeInput.value = "meaning"; // fallback
    }
  };

  // Función para alternar la visibilidad del teclado
  const toggleKeyboard = (playButtonClick) => {
    playButtonClick();
    showKeyboard.value = !showKeyboard.value;
  };

  // Función para cerrar el teclado
  const closeKeyboard = () => {
    showKeyboard.value = false;
  };

  // Prevenir scroll cuando el teclado está abierto
  watch(showKeyboard, (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  // Limpiar el overflow cuando se desmonte
  onUnmounted(() => {
    document.body.style.overflow = "";
  });

  return {
    // Estado
    showKeyboard,
    activeInput,

    // Funciones
    handleKeyboardInput,
    handleKeyboardClear,
    handleSpecialChar,
    setActiveInput,
    setFirstAvailableInput,
    toggleKeyboard,
    closeKeyboard,
  };
}
