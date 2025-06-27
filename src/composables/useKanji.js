import { ref, reactive } from "vue";

// Función para crear el traductor usando Web Translation API
async function createTranslator() {
  try {
    // Verificar si la API está disponible
    if ("translation" in window && "createTranslator" in window.translation) {
      const translator = await window.translation.createTranslator({
        sourceLanguage: "en",
        targetLanguage: "es",
      });
      return translator;
    }
    return null;
  } catch (error) {
    console.warn("Web Translation API no disponible:", error);
    return null;
  }
}

// Diccionario de fallback para traducciones comunes
const translationDictionary = {
  water: "agua",
  fire: "fuego",
  earth: "tierra",
  wind: "viento",
  tree: "árbol",
  person: "persona",
  man: "hombre",
  woman: "mujer",
  child: "niño",
  big: "grande",
  small: "pequeño",
  good: "bueno",
  bad: "malo",
  one: "uno",
  two: "dos",
  three: "tres",
  four: "cuatro",
  five: "cinco",
  six: "seis",
  seven: "siete",
  eight: "ocho",
  nine: "nueve",
  ten: "diez",
  hundred: "cien",
  thousand: "mil",
  sun: "sol",
  moon: "luna",
  day: "día",
  month: "mes",
  year: "año",
  time: "tiempo",
  morning: "mañana",
  evening: "tarde",
  night: "noche",
  book: "libro",
  school: "escuela",
  house: "casa",
  country: "país",
  language: "idioma",
  study: "estudiar",
  work: "trabajo",
  eat: "comer",
  drink: "beber",
  go: "ir",
  come: "venir",
  see: "ver",
  hear: "escuchar",
  speak: "hablar",
  read: "leer",
  write: "escribir",
  love: "amor",
  life: "vida",
  death: "muerte",
  hand: "mano",
  foot: "pie",
  eye: "ojo",
  mouth: "boca",
  head: "cabeza",
  heart: "corazón",
};

// Función para traducir usando el diccionario
function translateWithDictionary(text) {
  const lowerText = text.toLowerCase().trim();
  return translationDictionary[lowerText] || text;
}

export function useKanji() {
  const loading = ref(false);
  const error = ref(null);
  const translator = ref(null);

  const kanjiData = reactive({
    Kanji: "",
    CorrectMeaning: "",
    CorrectReadingOn: "",
    CorrectReadingKun: "",
  });

  // Inicializar el traductor
  const initTranslator = async () => {
    if (!translator.value) {
      translator.value = await createTranslator();
    }
  };

  // Función para traducir texto
  const translateText = async (text) => {
    if (!text || text.trim() === "") return text;

    try {
      // Intentar usar la Web Translation API si está disponible
      if (translator.value) {
        const result = await translator.value.translate(text);
        console.log(`Traducción API: "${text}" -> "${result}"`);
        return result;
      }
    } catch (error) {
      console.warn("Error en traducción API, usando diccionario:", error);
    }

    // Fallback al diccionario
    const dictResult = translateWithDictionary(text);
    console.log(`Traducción diccionario: "${text}" -> "${dictResult}"`);
    return dictResult;
  };

  const fetchKanjiByLevel = async (level) => {
    try {
      loading.value = true;
      error.value = null;

      // Inicializar traductor si no existe
      await initTranslator();

      console.log("Fetching kanji for level:", level);

      const levelResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${level}`
      );

      if (!levelResponse.ok) {
        throw new Error(
          `Error ${levelResponse.status}: No se pudo obtener la lista de kanjis para el nivel ${level}`
        );
      }

      const levelData = await levelResponse.json();
      console.log("API Response for level:", levelData);

      if (!Array.isArray(levelData) || levelData.length === 0) {
        throw new Error(`No se encontraron kanjis para el nivel ${level}`);
      }

      // Seleccionar el primer kanji
      const selectedKanji = levelData[0];
      kanjiData.Kanji = selectedKanji;

      console.log("Selected kanji:", selectedKanji);

      // Segunda llamada: obtener detalles del kanji específico
      const kanjiResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${selectedKanji}`
      );

      if (!kanjiResponse.ok) {
        throw new Error(
          `Error ${kanjiResponse.status}: No se pudieron obtener los detalles del kanji ${selectedKanji}`
        );
      }

      const kanjiDetails = await kanjiResponse.json();
      console.log("Kanji details:", kanjiDetails);

      // Actualizar lecturas del kanji
      kanjiData.CorrectReadingOn =
        kanjiDetails.on_readings?.length > 0
          ? kanjiDetails.on_readings[0]
          : "Lectura On no disponible";

      kanjiData.CorrectReadingKun =
        kanjiDetails.kun_readings?.length > 0
          ? kanjiDetails.kun_readings[0]
          : "Lectura Kun no disponible";

      const originalMeaning =
        kanjiDetails.meanings?.length > 0
          ? kanjiDetails.meanings[0]
          : "Significado no disponible";

      // Traducir el significado
      kanjiData.CorrectMeaning = await translateText(originalMeaning);

      console.log("Final kanjiData:", kanjiData);

      return kanjiData;
    } catch (err) {
      console.error("Error fetching kanji data:", err);
      error.value = err.message || "Error desconocido al cargar el kanji";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resetKanjiData = () => {
    kanjiData.Kanji = "";
    kanjiData.CorrectMeaning = "";
    kanjiData.CorrectReadingOn = "";
    kanjiData.CorrectReadingKun = "";
    error.value = null;
  };

  return {
    loading,
    error,
    kanjiData,
    fetchKanjiByLevel,
    resetKanjiData,
  };
}
