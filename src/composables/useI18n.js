import { ref, computed } from "vue";

// Idioma actual (por defecto español)
const currentLanguage = ref(localStorage.getItem("language") || "es");

// Textos de la aplicación en ambos idiomas
const translations = {
  es: {
    // Títulos principales
    mainTitle: "Aprende Kanji",
    subtitle: "Domina los caracteres japoneses de forma interactiva",
    levelSelection:
      "Selecciona tu nivel JLPT y comienza tu viaje hacia la fluidez",

    // Botones principales
    usageGuide: "Guía de uso",
    aboutProject: "Acerca del proyecto",

    //Teclado Japonés
    japaneseKeyboard: "Teclado Japonés",
    clearButton: "Limpiar",
    dakutenTooltip: "Dakuten - Convierte か→が, さ→ざ, etc.",
    handakutenTooltip: "Handakuten - Convierte は→ぱ, ひ→ぴ, etc.",

    // Niveles JLPT
    levels: {
      N5: "Básico",
      N4: "Elemental",
      N3: "Intermedio",
      N2: "Intermedio-Avanzado",
      N1: "Avanzado",
      CONFIG: "Configuración",
    },

    // Estimaciones de tiempo
    estimations: {
      N5: "~80 kanjis",
      N4: "~170 kanjis",
      N3: "~370 kanjis",
      N2: "~650 kanjis",
      N1: "~1000 kanjis",
      CONFIG: "Personaliza tu experiencia",
    },

    // Modales
    selectSublevel: "Selecciona un Subnivel",
    sublevelDescription:
      "está dividido en subniveles para facilitar el aprendizaje",
    loadingSublevels: "Cargando subniveles...",
    kanjis: "kanjis",
    cancel: "Cancelar",

    // Subniveles
    sublevelName: "Subnivel {number}",
    sublevelDifficulties: {
      basic: "Básico",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    },

    // Modal de configuración
    configuration: "Configuración",
    audio: "Audio",
    soundEffects: "Efectos de sonido",
    soundDescription:
      "Incluye sonidos de botones, respuestas correctas e incorrectas",
    difficulty: "Dificultad",
    showHints: "Mostrar pistas adicionales",
    standardDifficulty: "Dificultad estándar",
    expertMode: "Modo experto (sin pistas)",
    theme: "Tema",
    lightTheme: "Tema claro",
    darkTheme: "Tema oscuro",
    systemTheme: "Seguir sistema",
    currentTheme: "Actual",
    dark: "Oscuro",
    light: "Claro",
    language: "Idioma",
    languageDescription: "Cambia el idioma de la interfaz de la aplicación",
    additionalOptions: "Opciones adicionales",
    saveChanges: "Guardar cambios",

    // Modal de guía
    usageGuideTitle: "Guía de uso",
    notes: "Notas",
    note1:
      "• Esta aplicación es un proyecto personal y no está afiliada a ninguna institución oficial de enseñanza de japonés.",
    note2: "• Para reportar errores o sugerencias, escríbeme un correo.",
    note3:
      "• Los significados están en inglés dado que es el idioma de referencia para el aprendizaje de kanji.",
    note4:
      "• Para próximas actualizaciones de los significados, puedes escribirme a mi correo",
    note5:
      "• ¡Gracias por usar la aplicación y si te resultó útil puedes dejarme un café en",
    learningSystem: "📚 Sistema de aprendizaje",
    onReadings: "Lecturas On (音読み): Lectura china del kanji",
    kunReadings: "Lecturas Kun (訓読み): Lectura japonesa nativa",
    keyboardUsage:
      "Puedes usar el teclado japonés virtual para practicar la escritura",
    japaneseKeyboard: "⌨️ Teclado japonés",
    keyboardTip1: "• Haz clic en キーボード para abrir el teclado virtual",
    keyboardTip2: "• Usa las teclas para escribir en hiragana y katakana",
    keyboardTip3:
      "• El teclado se adapta automáticamente al campo que estés editando",
    keyboardTip4: '• Presiona "Cerrar" para ocultar el teclado',
    tips: "💡 Consejos",
    tip1: "• Practica regularmente para mejorar la retención",
    tip2: "• No te preocupes por los errores, son parte del aprendizaje",
    tip3: "• Usa la configuración para ajustar la dificultad a tu nivel",
    understood: "¡Entendido!",

    // Modal acerca de
    aboutProjectTitle: "Acerca del proyecto",
    aboutApp: "Sobre la aplicación",
    aboutDescription:
      "Una aplicación web interactiva diseñada para ayudar a estudiantes de japonés a aprender y practicar kanji de manera efectiva y divertida.",
    features: "Características",
    feature1: "• Organizado por niveles JLPT (N5 a N1)",
    feature2: "• Teclado japonés virtual integrado",
    feature3: "• Práctica de lecturas On y Kun",
    feature4: "• Interfaz moderna y responsive",
    feature5: "• Sistema de validación inteligente",
    feature6: "• Modo oscuro y claro",
    feature7: "• Accesible desde cualquier dispositivo",
    technologies: "Tecnologías",
    version: "Versión",
    versionText: "v1.0.0 - Julio 2025",
    madeWith: "Hecho con ❤️ para la comunidad de estudiantes de japonés",
    close: "Cerrar",

    // Tooltips
    themeTooltip: "Tema: {theme} - Click para cambiar",
    soundOnTooltip: "Sonido activado - Click para desactivar",
    soundOffTooltip: "Sonido desactivado - Click para activar",
    languageTooltip: "Idioma: Español - Click para cambiar a inglés",

    // KanjiCard component
    keyboard: "キーボード",
    study: "Estudiar",
    practice: "Practicar",
    progress: "Progreso",
    meaning: "Significado",
    onReading: "Lectura On (音読み)",
    kunReading: "Lectura Kun (訓読み)",
    hint: "Pista",
    hintText: "Las lecturas comienzan con: {hint}",
    meaningPrefix: "Significado",
    onPrefix: "On",
    kunPrefix: "Kun",
    allAnswersIncorrect: "todas las respuestas disponibles incorrectas",
    meaningPlaceholder: "Escribe el significado...",
    onReadingPlaceholder: "Escribe la lectura On...",
    kunReadingPlaceholder: "Escribe la lectura Kun...",
    validate: "Validar",
    checking: "Validando...",
    correct: "¡Correcto!",
    incorrect: "Incorrecto",
    correctResult: "Has acertado {type}",
    correctAttempts: "en {count} {attempts}",
    attempt: "intento",
    attempts: "intentos",
    tryAgain: "Intentar de nuevo",
    previous: "Anterior",
    random: "Aleatorio",
    next: "Siguiente",
    studyMode: "Modo Estudio",
    studyModeDescription:
      'Estudia el kanji con toda la información visible. Cambia a modo "Practicar" cuando estés listo.',
    emailCopied: "¡Correo copiado al portapapeles!",
    emailCopyError:
      "No se pudo copiar el correo. Por favor, cópialo manualmente.",
    copyEmail: "Copiar correo",

    // Test completion
    testCompleted: "¡Test completado!",
    correctAnswers: "Aciertos",
    time: "Tiempo",
    tryAgainTest: "Volver a intentar",
    backToMainPage: "Volver a la página principal",
  },

  en: {
    // Main titles
    mainTitle: "Learn Kanji",
    subtitle: "Master Japanese characters interactively",
    levelSelection: "Select your JLPT level and begin your journey to fluency",

    // Main buttons
    usageGuide: "Usage Guide",
    aboutProject: "About the Project",

    // JLPT levels
    levels: {
      N5: "Basic",
      N4: "Elementary",
      N3: "Intermediate",
      N2: "Upper-Intermediate",
      N1: "Advanced",
      CONFIG: "Settings",
    },

    //Sublevels
    sublevels: {
      N5: "N5 Sublevels",
      N4: "N4 Sublevels",
      N3: "N3 Sublevels",
      N2: "N2 Sublevels",
      N1: "N1 Sublevels",
    },

    // Time estimations
    estimations: {
      N5: "~80 kanji",
      N4: "~170 kanji",
      N3: "~370 kanji",
      N2: "~650 kanji",
      N1: "~1000 kanji",
      CONFIG: "Customize your experience",
    },

    // Modals
    selectSublevel: "Select a Sublevel",
    sublevelDescription: "is divided into sublevels to facilitate learning",
    loadingSublevels: "Loading sublevels...",
    kanjis: "kanji",
    cancel: "Cancel",

    // Teclado Japonés
    japaneseKeyboard: "Japanese Keyboard",
    clearButton: "Clear",
    dakutenTooltip: "Dakuten - Converts か→が, さ→ざ, etc.",
    handakutenTooltip: "Handakuten - Converts は→ぱ, ひ→ぴ, etc.",

    // Sublevels
    sublevelName: "Sublevel {number}",
    sublevelDescription: "Kanji {start}-{end}",
    sublevelDifficulties: {
      basic: "Basic",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },

    // Configuration modal
    configuration: "Settings",
    audio: "Audio",
    soundEffects: "Sound effects",
    soundDescription: "Includes button sounds, correct and incorrect answers",
    difficulty: "Difficulty",
    showHints: "Show additional hints",
    standardDifficulty: "Standard difficulty",
    expertMode: "Expert mode (no hints)",
    theme: "Theme",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    systemTheme: "Follow system",
    currentTheme: "Current",
    dark: "Dark",
    light: "Light",
    language: "Language",
    languageDescription: "Change the application's interface language",
    additionalOptions: "Additional options",
    saveChanges: "Save changes",

    // Guide modal
    usageGuideTitle: "Usage Guide",
    notes: "Notes",
    note1:
      "• This application is a personal project and is not affiliated with any official Japanese teaching institution.",
    note2: "• To report bugs or suggestions, send me an email.",
    note3:
      "• Meanings are in English as it is the reference language for kanji learning.",
    note4: "• For future updates to meanings, you can email me at",
    note5:
      "• Thanks for using the app and if you found it useful you can buy me a coffee at",
    learningSystem: "📚 Learning system",
    onReadings: "On readings (音読み): Chinese reading of kanji",
    kunReadings: "Kun readings (訓読み): Native Japanese reading",
    keyboardUsage:
      "You can use the virtual Japanese keyboard to practice writing",
    japaneseKeyboard: "⌨️ Japanese keyboard",
    keyboardTip1: "• Click on キーボード to open the virtual keyboard",
    keyboardTip2: "• Use the keys to type in hiragana and katakana",
    keyboardTip3:
      "• The keyboard automatically adapts to the field you are editing",
    keyboardTip4: '• Press "Close" to hide the keyboard',
    tips: "💡 Tips",
    tip1: "• Practice regularly to improve retention",
    tip2: "• Don't worry about mistakes, they are part of learning",
    tip3: "• Use settings to adjust difficulty to your level",
    understood: "Got it!",

    // About modal
    aboutProjectTitle: "About the Project",
    aboutApp: "About the app",
    aboutDescription:
      "An interactive web application designed to help Japanese students learn and practice kanji effectively and enjoyably.",
    features: "Features",
    feature1: "• Organized by JLPT levels (N5 to N1)",
    feature2: "• Built-in virtual Japanese keyboard",
    feature3: "• On and Kun readings practice",
    feature4: "• Modern and responsive interface",
    feature5: "• Intelligent validation system",
    feature6: "• Dark and light mode",
    feature7: "• Accessible from any device",
    technologies: "Technologies",
    version: "Version",
    versionText: "v1.0.0 - July 2025",
    madeWith: "Made with ❤️ for the Japanese learning community",
    close: "Close",

    // Tooltips
    themeTooltip: "Theme: {theme} - Click to change",
    soundOnTooltip: "Sound enabled - Click to disable",
    soundOffTooltip: "Sound disabled - Click to enable",
    languageTooltip: "Language: English - Click to change to Spanish",

    // KanjiCard component
    keyboard: "キーボード",
    study: "Study",
    practice: "Practice",
    progress: "Progress",
    meaning: "Meaning",
    onReading: "On Reading (音読み)",
    kunReading: "Kun Reading (訓読み)",
    hint: "Hint",
    hintText: "Readings start with: {hint}",
    meaningPrefix: "Meaning",
    onPrefix: "On",
    kunPrefix: "Kun",
    allAnswersIncorrect: "all available answers incorrect",
    meaningPlaceholder: "Enter the meaning...",
    onReadingPlaceholder: "Enter the On reading...",
    kunReadingPlaceholder: "Enter the Kun reading...",
    validate: "Validate",
    checking: "Checking...",
    correct: "Correct!",
    incorrect: "Incorrect",
    correctResult: "You got {type} right",
    correctAttempts: "in {count} {attempts}",
    attempt: "attempt",
    attempts: "attempts",
    tryAgain: "Try again",
    previous: "Previous",
    random: "Random",
    next: "Next",
    studyMode: "Study Mode",
    studyModeDescription:
      'Study the kanji with all information visible. Switch to "Practice" mode when you\'re ready.',
    emailCopied: "Email copied to clipboard!",
    emailCopyError: "Could not copy email. Please copy it manually.",
    copyEmail: "Copy email",

    // Test completion
    testCompleted: "Test completed!",
    correctAnswers: "Correct answers",
    time: "Time",
    tryAgainTest: "Try again",
    backToMainPage: "Back to main page",
  },
};

// Composable para internacionalización
export function useI18n() {
  // Función para cambiar idioma
  const setLanguage = (lang) => {
    if (lang === "es" || lang === "en") {
      currentLanguage.value = lang;
      localStorage.setItem("language", lang);
    }
  };

  // Función para alternar idioma
  const toggleLanguage = () => {
    const newLang = currentLanguage.value === "es" ? "en" : "es";
    setLanguage(newLang);
  };

  // Función para obtener texto traducido
  const t = (key) => {
    const keys = key.split(".");
    let value = translations[currentLanguage.value];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback al español si no se encuentra la clave
        value = translations.es;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Devolver la clave si no se encuentra
          }
        }
        break;
      }
    }

    return value || key;
  };

  // Función para obtener texto con interpolación simple
  const tInterpolate = (key, params = {}) => {
    let text = t(key);
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  // Computed properties
  const isSpanish = computed(() => currentLanguage.value === "es");
  const isEnglish = computed(() => currentLanguage.value === "en");
  const languageFlag = computed(() =>
    currentLanguage.value === "es" ? "🇪🇸" : "🇺🇸"
  );
  const languageName = computed(() =>
    currentLanguage.value === "es" ? "Español" : "English"
  );

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    t,
    tInterpolate,
    isSpanish,
    isEnglish,
    languageFlag,
    languageName,
  };
}
