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

// Estado global compartido entre todas las instancias
const globalState = {
  loading: ref(false),
  error: ref(null),
  translator: ref(null),
  kanjiData: reactive({
    Kanji: "",
    CorrectMeaning: "",
    CorrectReadingOn: "",
    CorrectReadingKun: "",
  }),
  sublevelData: reactive({
    currentLevel: "",
    currentSublevel: 1,
    totalSublevels: 1,
    currentKanjiIndex: 0,
    kanjiList: [],
    kanjisPerSublevel: 100,
  }),
  navigationData: reactive({
    currentLevel: "",
    kanjiList: [],
    currentKanjiIndex: 0,
  }),
};

export function useKanji() {
  const loading = globalState.loading;
  const error = globalState.error;
  const translator = globalState.translator;
  const kanjiData = globalState.kanjiData;
  const sublevelData = globalState.sublevelData;
  const navigationData = globalState.navigationData;

  // Inicializar el traductor
  const initTranslator = async () => {
    if (!translator.value) {
      translator.value = await createTranslator();
    }
  };

  // Función para calcular el número de subniveles
  const calculateSublevels = (totalKanjis, kanjisPerSublevel = 100) => {
    return Math.ceil(totalKanjis / kanjisPerSublevel);
  };

  // Función para obtener el rango de kanjis para un subnivel específico
  const getKanjiRangeForSublevel = (
    kanjiList,
    sublevel,
    kanjisPerSublevel = 100
  ) => {
    const startIndex = (sublevel - 1) * kanjisPerSublevel;
    const endIndex = Math.min(startIndex + kanjisPerSublevel, kanjiList.length);
    return {
      startIndex,
      endIndex,
      kanjis: kanjiList.slice(startIndex, endIndex),
    };
  };

  // Función para traducir texto
  const translateText = async (text) => {
    if (!text || text.trim() === "") return text;

    try {
      // Intentar usar la Web Translation API si está disponible
      if (translator.value) {
        const result = await translator.value.translate(text);
        return result;
      }
    } catch (error) {
      console.warn("Error en traducción API, usando diccionario:", error);
    }

    // Fallback al diccionario
    const dictResult = translateWithDictionary(text);
    return dictResult;
  };

  // Función para cargar kanjis por nivel y subnivel
  const fetchKanjisBySublevel = async (level, sublevel = 1) => {
    try {
      loading.value = true;
      error.value = null;

      // Inicializar traductor si no existe
      await initTranslator();

      // Solo implementar subniveles para jlpt-4 por ahora
      if (level !== "jlpt-4") {
        // Para otros niveles, usar la función original
        return await fetchKanjiByLevel(level);
      }

      console.log(`Cargando nivel ${level}, subnivel ${sublevel}`);

      // Obtener información completa del nivel
      const levelInfo = await getSublevelsInfo(level);

      // Validar que el subnivel solicitado existe
      if (sublevel < 1 || sublevel > levelInfo.totalSublevels) {
        throw new Error(
          `Subnivel ${sublevel} no válido. El nivel ${level} tiene ${levelInfo.totalSublevels} subniveles disponibles.`
        );
      }

      // Actualizar estado de subniveles
      sublevelData.currentLevel = level;
      sublevelData.currentSublevel = sublevel;
      sublevelData.totalSublevels = levelInfo.totalSublevels;
      sublevelData.kanjiList = levelInfo.kanjiList;
      sublevelData.currentKanjiIndex = 0;

      // También actualizar navigationData para compatibilidad
      navigationData.currentLevel = level;
      navigationData.kanjiList = levelInfo.kanjiList;
      navigationData.currentKanjiIndex = 0;

      // Obtener kanjis para el subnivel específico
      const kanjiRange = getKanjiRangeForSublevel(
        levelInfo.kanjiList,
        sublevel,
        sublevelData.kanjisPerSublevel
      );

      console.log(
        `Subnivel ${sublevel}/${levelInfo.totalSublevels}: kanjis ${
          kanjiRange.startIndex + 1
        }-${kanjiRange.endIndex} de ${levelInfo.totalKanjis} total`
      );
      console.log(`Kanjis en este subnivel:`, kanjiRange.kanjis);

      // Cargar el primer kanji del subnivel
      if (kanjiRange.kanjis.length > 0) {
        const selectedKanji = kanjiRange.kanjis[0];
        await loadKanjiDetails(selectedKanji);
        return kanjiData;
      } else {
        throw new Error(`No se encontraron kanjis en el subnivel ${sublevel}`);
      }
    } catch (err) {
      console.error("Error fetching kanji data by sublevel:", err);
      error.value = err.message || "Error desconocido al cargar el kanji";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Función para cargar los detalles de un kanji específico
  const loadKanjiDetails = async (kanjiCharacter) => {
    try {
      kanjiData.Kanji = kanjiCharacter;

      // Obtener detalles del kanji específico
      const kanjiResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${kanjiCharacter}`
      );

      if (!kanjiResponse.ok) {
        throw new Error(
          `Error ${kanjiResponse.status}: No se pudieron obtener los detalles del kanji ${kanjiCharacter}`
        );
      }

      const kanjiDetails = await kanjiResponse.json();

      // Actualizar lecturas del kanji
      kanjiData.CorrectReadingOn =
        kanjiDetails.on_readings?.length > 0
          ? kanjiDetails.on_readings[0]
          : "Lectura On no disponible";
      console.log("Lectura On:", kanjiData.CorrectReadingOn);

      kanjiData.CorrectReadingKun =
        kanjiDetails.kun_readings?.length > 0
          ? kanjiDetails.kun_readings[0]
          : "Lectura Kun no disponible";
      console.log("Lectura Kun:", kanjiData.CorrectReadingKun);

      const originalMeaning =
        kanjiDetails.meanings?.length > 0
          ? kanjiDetails.meanings[0]
          : "Significado no disponible";
      console.log("Significado original:", originalMeaning);

      // Traducir el significado
      kanjiData.CorrectMeaning = await translateText(originalMeaning);

      return kanjiData;
    } catch (error) {
      console.error("Error loading kanji details:", error);
      throw error;
    }
  };

  // Función para obtener el siguiente kanji en el subnivel actual
  const getNextKanji = async () => {
    try {
      if (sublevelData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados");
      }

      const kanjiRange = getKanjiRangeForSublevel(
        sublevelData.kanjiList,
        sublevelData.currentSublevel,
        sublevelData.kanjisPerSublevel
      );

      const nextIndex = sublevelData.currentKanjiIndex + 1;

      if (nextIndex >= kanjiRange.kanjis.length) {
        throw new Error("No hay más kanjis en este subnivel");
      }

      sublevelData.currentKanjiIndex = nextIndex;
      const nextKanji = kanjiRange.kanjis[nextIndex];

      await loadKanjiDetails(nextKanji);
      console.log(
        `Kanji ${nextIndex + 1}/${kanjiRange.kanjis.length} del subnivel ${
          sublevelData.currentSublevel
        }`
      );

      return kanjiData;
    } catch (error) {
      console.error("Error getting next kanji:", error);
      throw error;
    }
  };

  // Función para obtener el kanji anterior en el subnivel actual
  const getPreviousKanji = async () => {
    try {
      if (sublevelData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados");
      }

      const previousIndex = sublevelData.currentKanjiIndex - 1;

      if (previousIndex < 0) {
        throw new Error("Ya estás en el primer kanji de este subnivel");
      }

      sublevelData.currentKanjiIndex = previousIndex;
      const kanjiRange = getKanjiRangeForSublevel(
        sublevelData.kanjiList,
        sublevelData.currentSublevel,
        sublevelData.kanjisPerSublevel
      );

      const previousKanji = kanjiRange.kanjis[previousIndex];

      await loadKanjiDetails(previousKanji);
      console.log(
        `Kanji ${previousIndex + 1}/${kanjiRange.kanjis.length} del subnivel ${
          sublevelData.currentSublevel
        }`
      );

      return kanjiData;
    } catch (error) {
      console.error("Error getting previous kanji:", error);
      throw error;
    }
  };

  // Función para obtener un kanji aleatorio del subnivel actual
  const getRandomKanjiFromSublevel = async () => {
    try {
      if (sublevelData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados");
      }

      const kanjiRange = getKanjiRangeForSublevel(
        sublevelData.kanjiList,
        sublevelData.currentSublevel,
        sublevelData.kanjisPerSublevel
      );

      const randomIndex = Math.floor(Math.random() * kanjiRange.kanjis.length);
      sublevelData.currentKanjiIndex = randomIndex;

      const randomKanji = kanjiRange.kanjis[randomIndex];

      await loadKanjiDetails(randomKanji);
      console.log(
        `Kanji aleatorio ${randomIndex + 1}/${
          kanjiRange.kanjis.length
        } del subnivel ${sublevelData.currentSublevel}`
      );

      return kanjiData;
    } catch (error) {
      console.error("Error getting random kanji:", error);
      throw error;
    }
  };

  // ===== FUNCIONES DE NAVEGACIÓN GENERAL (TODOS LOS NIVELES) =====

  // Función para obtener el siguiente kanji del nivel actual
  const getNextKanjiFromLevel = async () => {
    try {
      if (navigationData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados para este nivel");
      }

      const nextIndex = navigationData.currentKanjiIndex + 1;

      if (nextIndex >= navigationData.kanjiList.length) {
        // Si llegamos al final, volver al primero (loop)
        navigationData.currentKanjiIndex = 0;
      } else {
        navigationData.currentKanjiIndex = nextIndex;
      }

      const nextKanji =
        navigationData.kanjiList[navigationData.currentKanjiIndex];
      await loadKanjiDetails(nextKanji);

      console.log(
        `Kanji ${navigationData.currentKanjiIndex + 1}/${
          navigationData.kanjiList.length
        } del nivel ${navigationData.currentLevel}`
      );

      return kanjiData;
    } catch (error) {
      console.error("Error getting next kanji from level:", error);
      throw error;
    }
  };

  // Función para obtener un kanji aleatorio del nivel actual
  const getRandomKanjiFromLevel = async () => {
    try {
      if (navigationData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados para este nivel");
      }

      const randomIndex = Math.floor(
        Math.random() * navigationData.kanjiList.length
      );
      navigationData.currentKanjiIndex = randomIndex;

      const randomKanji = navigationData.kanjiList[randomIndex];
      await loadKanjiDetails(randomKanji);

      console.log(
        `Kanji aleatorio ${randomIndex + 1}/${
          navigationData.kanjiList.length
        } del nivel ${navigationData.currentLevel}`
      );

      return kanjiData;
    } catch (error) {
      console.error("Error getting random kanji from level:", error);
      throw error;
    }
  };

  // Función universal para navegar al siguiente kanji (detecta automáticamente si es subnivel o nivel)
  const goToNextKanji = async () => {
    // Si estamos en modo subnivel (JLPT-4), usar funciones de subnivel
    if (
      sublevelData.currentLevel === "jlpt-4" &&
      sublevelData.kanjiList.length > 0
    ) {
      return await getNextKanji();
    }
    // Para otros niveles, usar navegación general
    else if (navigationData.kanjiList.length > 0) {
      return await getNextKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  // Función universal para obtener kanji aleatorio
  const goToRandomKanji = async () => {
    // Si estamos en modo subnivel (JLPT-4), usar funciones de subnivel
    if (
      sublevelData.currentLevel === "jlpt-4" &&
      sublevelData.kanjiList.length > 0
    ) {
      return await getRandomKanjiFromSublevel();
    }
    // Para otros niveles, usar navegación general
    else if (navigationData.kanjiList.length > 0) {
      return await getRandomKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  // Función para obtener información de subniveles de un nivel
  const getSublevelsInfo = async (level) => {
    try {
      // Obtener la lista completa de kanjis del nivel
      const levelResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${level}`
      );

      if (!levelResponse.ok) {
        throw new Error(
          `Error ${levelResponse.status}: No se pudo obtener la lista de kanjis para el nivel ${level}`
        );
      }

      const kanjiList = await levelResponse.json();

      if (!Array.isArray(kanjiList) || kanjiList.length === 0) {
        throw new Error(`No se encontraron kanjis para el nivel ${level}`);
      }

      const totalKanjis = kanjiList.length;
      const totalSublevels = calculateSublevels(
        totalKanjis,
        sublevelData.kanjisPerSublevel
      );

      return {
        kanjiList,
        totalKanjis,
        totalSublevels,
      };
    } catch (error) {
      console.error(`Error getting sublevel info for ${level}:`, error);
      throw error;
    }
  };

  // Función original para cargar kanjis por nivel (para otros niveles que no sean jlpt-4)
  const fetchKanjiByLevel = async (level) => {
    try {
      loading.value = true;
      error.value = null;

      // Inicializar traductor si no existe
      await initTranslator();

      const levelResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${level}`
      );

      if (!levelResponse.ok) {
        throw new Error(
          `Error ${levelResponse.status}: No se pudo obtener la lista de kanjis para el nivel ${level}`
        );
      }

      const levelData = await levelResponse.json();

      if (!Array.isArray(levelData) || levelData.length === 0) {
        throw new Error(`No se encontraron kanjis para el nivel ${level}`);
      }
      console.log("Kanjis del nivel:", levelData);

      // Guardar la lista completa para navegación
      navigationData.currentLevel = level;
      navigationData.kanjiList = levelData;
      navigationData.currentKanjiIndex = 0;

      // Seleccionar el primer kanji
      const selectedKanji = levelData[0];
      kanjiData.Kanji = selectedKanji;

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

      // Actualizar lecturas del kanji
      kanjiData.CorrectReadingOn =
        kanjiDetails.on_readings?.length > 0
          ? kanjiDetails.on_readings[0]
          : "Lectura On no disponible";
      console.log("Lectura On:", kanjiData.CorrectReadingOn);

      kanjiData.CorrectReadingKun =
        kanjiDetails.kun_readings?.length > 0
          ? kanjiDetails.kun_readings[0]
          : "Lectura Kun no disponible";
      console.log("Lectura Kun:", kanjiData.CorrectReadingKun);

      const originalMeaning =
        kanjiDetails.meanings?.length > 0
          ? kanjiDetails.meanings[0]
          : "Significado no disponible";
      console.log("Significado original:", originalMeaning);

      // Traducir el significado
      kanjiData.CorrectMeaning = await translateText(originalMeaning);

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
    sublevelData,
    navigationData,
    fetchKanjiByLevel,
    fetchKanjisBySublevel,
    getSublevelsInfo,
    getNextKanji,
    getPreviousKanji,
    getRandomKanjiFromSublevel,
    goToNextKanji,
    goToRandomKanji,
    resetKanjiData,
  };
}
