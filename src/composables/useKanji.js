import { ref, reactive } from "vue";

// Estado global compartido entre todas las instancias
const globalState = {
  loading: ref(false),
  error: ref(null),
  kanjiData: reactive({
    Kanji: "",
    CorrectMeaning: "",
    CorrectReadingOn: "",
    CorrectReadingKun: "",
    AllValidOnReadings: [],
    AllValidKunReadings: [],
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
  const kanjiData = globalState.kanjiData;
  const sublevelData = globalState.sublevelData;
  const navigationData = globalState.navigationData;

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

  // Significados se mantienen siempre en inglés como vienen de la API

  // Función para cargar kanjis por nivel y subnivel
  const fetchKanjisBySublevel = async (level, sublevel = 1) => {
    try {
      loading.value = true;
      error.value = null;

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

      // Procesamiento de lecturas On
      if (kanjiDetails.on_readings?.length > 0) {
        kanjiData.CorrectReadingOn = kanjiDetails.on_readings[0];
        // Almacenar todas las lecturas on válidas para validación
        kanjiData.AllValidOnReadings = kanjiDetails.on_readings;
      } else {
        kanjiData.CorrectReadingOn = "Lectura On no disponible";
        kanjiData.AllValidOnReadings = [];
      }
      console.log("Lectura On:", kanjiData.CorrectReadingOn);
      console.log("Todas las lecturas On:", kanjiData.AllValidOnReadings);

      // Procesamiento de lecturas Kun con manejo de puntos
      if (kanjiDetails.kun_readings?.length > 0) {
        const firstKunReading = kanjiDetails.kun_readings[0];
        kanjiData.CorrectReadingKun = firstKunReading;

        // Extraer todas las variantes válidas de lecturas kun
        kanjiData.AllValidKunReadings = [];

        kanjiDetails.kun_readings.forEach((reading) => {
          // Agregar la lectura completa
          kanjiData.AllValidKunReadings.push(reading);

          // Si contiene punto, agregar también las partes separadas
          if (reading.includes(".")) {
            const parts = reading.split(".");
            // Agregar la parte antes del punto (raíz)
            if (parts[0]) {
              kanjiData.AllValidKunReadings.push(parts[0]);
            }
            // Agregar la combinación completa sin el punto
            kanjiData.AllValidKunReadings.push(reading.replace(".", ""));
          }
        });

        // Eliminar duplicados
        kanjiData.AllValidKunReadings = [
          ...new Set(kanjiData.AllValidKunReadings),
        ];
      } else {
        kanjiData.CorrectReadingKun = "Lectura Kun no disponible";
        kanjiData.AllValidKunReadings = [];
      }
      console.log("Lectura Kun:", kanjiData.CorrectReadingKun);
      console.log(
        "Todas las lecturas Kun válidas:",
        kanjiData.AllValidKunReadings
      );

      const originalMeaning =
        kanjiDetails.meanings?.length > 0
          ? kanjiDetails.meanings[0]
          : "Meaning not available";
      console.log("Significado:", originalMeaning);

      // Los significados siempre se muestran en inglés como vienen de la API
      kanjiData.CorrectMeaning = originalMeaning;

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

  // Función para obtener el kanji anterior del nivel actual
  const getPreviousKanjiFromLevel = async () => {
    try {
      if (navigationData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados para este nivel");
      }

      const previousIndex = navigationData.currentKanjiIndex - 1;

      if (previousIndex < 0) {
        // Si llegamos al inicio, ir al último kanji (loop)
        navigationData.currentKanjiIndex = navigationData.kanjiList.length - 1;
      } else {
        navigationData.currentKanjiIndex = previousIndex;
      }

      const previousKanji =
        navigationData.kanjiList[navigationData.currentKanjiIndex];
      await loadKanjiDetails(previousKanji);

      console.log(
        `Kanji ${navigationData.currentKanjiIndex + 1}/${
          navigationData.kanjiList.length
        } del nivel ${navigationData.currentLevel}`
      );

      return kanjiData;
    } catch (error) {
      console.error("Error getting previous kanji from level:", error);
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
    // Si estamos en modo subnivel (cualquier nivel JLPT con subniveles), usar funciones de subnivel
    if (
      sublevelData.currentLevel &&
      sublevelData.kanjiList.length > 0 &&
      sublevelData.totalSublevels > 1
    ) {
      return await getNextKanji();
    }
    // Para niveles sin subniveles, usar navegación general
    else if (navigationData.kanjiList.length > 0) {
      return await getNextKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  // Función universal para obtener kanji aleatorio
  const goToRandomKanji = async () => {
    // Si estamos en modo subnivel (cualquier nivel JLPT con subniveles), usar funciones de subnivel
    if (
      sublevelData.currentLevel &&
      sublevelData.kanjiList.length > 0 &&
      sublevelData.totalSublevels > 1
    ) {
      return await getRandomKanjiFromSublevel();
    }
    // Para niveles sin subniveles, usar navegación general
    else if (navigationData.kanjiList.length > 0) {
      return await getRandomKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  // Función universal para navegar al kanji anterior
  const goToPreviousKanji = async () => {
    // Si estamos en modo subnivel (cualquier nivel JLPT con subniveles), usar funciones de subnivel
    if (
      sublevelData.currentLevel &&
      sublevelData.kanjiList.length > 0 &&
      sublevelData.totalSublevels > 1
    ) {
      return await getPreviousKanji();
    }
    // Para niveles sin subniveles, usar navegación general
    else if (navigationData.kanjiList.length > 0) {
      return await getPreviousKanjiFromLevel();
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

      // Procesamiento de lecturas On
      if (kanjiDetails.on_readings?.length > 0) {
        kanjiData.CorrectReadingOn = kanjiDetails.on_readings[0];
        // Almacenar todas las lecturas on válidas para validación
        kanjiData.AllValidOnReadings = kanjiDetails.on_readings;
      } else {
        kanjiData.CorrectReadingOn = "Lectura On no disponible";
        kanjiData.AllValidOnReadings = [];
      }
      console.log("Lectura On:", kanjiData.CorrectReadingOn);
      console.log("Todas las lecturas On:", kanjiData.AllValidOnReadings);

      // Procesamiento de lecturas Kun con manejo de puntos
      if (kanjiDetails.kun_readings?.length > 0) {
        const firstKunReading = kanjiDetails.kun_readings[0];
        kanjiData.CorrectReadingKun = firstKunReading;

        // Extraer todas las variantes válidas de lecturas kun
        kanjiData.AllValidKunReadings = [];

        kanjiDetails.kun_readings.forEach((reading) => {
          // Agregar la lectura completa
          kanjiData.AllValidKunReadings.push(reading);

          // Si contiene punto, agregar también las partes separadas
          if (reading.includes(".")) {
            const parts = reading.split(".");
            // Agregar la parte antes del punto (raíz)
            if (parts[0]) {
              kanjiData.AllValidKunReadings.push(parts[0]);
            }
            // Agregar la combinación completa sin el punto
            kanjiData.AllValidKunReadings.push(reading.replace(".", ""));
          }
        });

        // Eliminar duplicados
        kanjiData.AllValidKunReadings = [
          ...new Set(kanjiData.AllValidKunReadings),
        ];
      } else {
        kanjiData.CorrectReadingKun = "Lectura Kun no disponible";
        kanjiData.AllValidKunReadings = [];
      }
      console.log("Lectura Kun:", kanjiData.CorrectReadingKun);
      console.log(
        "Todas las lecturas Kun válidas:",
        kanjiData.AllValidKunReadings
      );

      const originalMeaning =
        kanjiDetails.meanings?.length > 0
          ? kanjiDetails.meanings[0]
          : "Meaning not available";
      console.log("Significado original:", originalMeaning);

      // Los significados siempre se muestran en inglés como vienen de la API
      kanjiData.CorrectMeaning = originalMeaning;

      return kanjiData;
    } catch (err) {
      console.error("Error fetching kanji data:", err);
      error.value = err.message || "Error desconocido al cargar el kanji";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Función para verificar si un nivel debería usar subniveles basado en la cantidad de kanjis
  const shouldUseSublevel = async (level) => {
    try {
      const info = await getSublevelsInfo(level);
      // Usar subniveles si hay más de 100 kanjis (más de 1 subnivel)
      return info.totalSublevels > 1;
    } catch (error) {
      console.warn(`Error checking sublevel for ${level}:`, error);
      return false;
    }
  };

  const resetKanjiData = () => {
    kanjiData.Kanji = "";
    kanjiData.CorrectMeaning = "";
    kanjiData.CorrectReadingOn = "";
    kanjiData.CorrectReadingKun = "";
    kanjiData.AllValidOnReadings = [];
    kanjiData.AllValidKunReadings = [];
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
    getPreviousKanjiFromLevel,
    getRandomKanjiFromLevel,
    getRandomKanjiFromSublevel,
    goToNextKanji,
    goToPreviousKanji,
    goToRandomKanji,
    shouldUseSublevel,
    resetKanjiData,
  };
}
