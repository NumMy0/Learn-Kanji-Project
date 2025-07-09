import { ref, reactive } from "vue";

/**
 * Estado global compartido entre todas las instancias del composable.
 * Permite mantener el estado persistente durante la navegación y
 * compartir datos entre diferentes componentes.
 */
const globalState = {
  loading: ref(false), // Estado de carga de datos
  error: ref(null), // Errores de API o validación

  // Datos del kanji actualmente seleccionado
  kanjiData: reactive({
    Kanji: "", // Caracter kanji
    CorrectMeaning: "", // Significado principal
    CorrectReadingOn: "", // Lectura On principal
    CorrectReadingKun: "", // Lectura Kun principal
    AllValidOnReadings: [], // Todas las lecturas On válidas
    AllValidKunReadings: [], // Todas las lecturas Kun válidas
    AllValidMeanings: [], // Todos los significados válidos
  }),

  // Datos de navegación por subniveles
  sublevelData: reactive({
    currentLevel: "", // Nivel JLPT actual (ej: "jlpt-5")
    currentSublevel: 1, // Subnivel actual (1, 2, 3...)
    totalSublevels: 1, // Total de subniveles disponibles
    currentKanjiIndex: 0, // Índice del kanji actual en el subnivel
    kanjiList: [], // Lista completa de kanjis del nivel
    kanjisPerSublevel: 100, // Kanjis por subnivel (configurable)
  }),

  // Datos de navegación general (compatibilidad)
  navigationData: reactive({
    currentLevel: "", // Nivel actual
    kanjiList: [], // Lista de kanjis
    currentKanjiIndex: 0, // Índice actual
  }),
};

/**
 * Composable principal para manejo de datos de kanji.
 * Proporciona funcionalidad completa para cargar, navegar y gestionar
 * datos de kanji organizados por niveles JLPT y subniveles.
 *
 * @returns {Object} Estados y funciones para gestión de kanji
 */
export function useKanji() {
  // Referencias a los estados globales para reactividad
  const loading = globalState.loading;
  const error = globalState.error;
  const kanjiData = globalState.kanjiData;
  const sublevelData = globalState.sublevelData;
  const navigationData = globalState.navigationData;

  /**
   * Calcula el número total de subniveles basado en la cantidad de kanjis.
   *
   * @param {number} totalKanjis - Total de kanjis en el nivel
   * @param {number} kanjisPerSublevel - Kanjis por subnivel (default: 100)
   * @returns {number} Número de subniveles necesarios
   */
  const calculateSublevels = (totalKanjis, kanjisPerSublevel = 100) => {
    return Math.ceil(totalKanjis / kanjisPerSublevel);
  };

  /**
   * Obtiene el rango de kanjis para un subnivel específico.
   * Calcula los índices de inicio y fin, y extrae los kanjis correspondientes.
   *
   * @param {Array} kanjiList - Lista completa de kanjis
   * @param {number} sublevel - Número del subnivel (1-indexed)
   * @param {number} kanjisPerSublevel - Kanjis por subnivel (default: 100)
   * @returns {Object} Objeto con startIndex, endIndex y array de kanjis
   */
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

  /**
   * Carga kanjis por nivel y subnivel específico.
   * Valida la existencia del subnivel y carga el primer kanji automáticamente.
   *
   * @param {string} level - Nivel JLPT (ej: "jlpt-5")
   * @param {number} sublevel - Número del subnivel (default: 1)
   * @returns {Object} Datos del kanji cargado
   * @throws {Error} Si el subnivel no es válido
   */
  const fetchKanjisBySublevel = async (level, sublevel = 1) => {
    try {
      loading.value = true;
      error.value = null;

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

      // También actualizar navigationData para compatibilidad con componentes existentes
      navigationData.currentLevel = level;
      navigationData.kanjiList = levelInfo.kanjiList;
      navigationData.currentKanjiIndex = 0;

      // Obtener kanjis para el subnivel específico
      const kanjiRange = getKanjiRangeForSublevel(
        levelInfo.kanjiList,
        sublevel,
        sublevelData.kanjisPerSublevel
      );

      // Cargar el primer kanji del subnivel automáticamente
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

  /**
   * Carga los detalles completos de un kanji específico desde la API.
   * Procesa lecturas On/Kun, significados y maneja casos especiales como
   * lecturas Kun con puntos (oku.rigana).
   *
   * @param {string} kanjiCharacter - Caracter kanji a cargar
   * @returns {Object} Datos completos del kanji
   * @throws {Error} Si no se pueden obtener los detalles del kanji
   */
  const loadKanjiDetails = async (kanjiCharacter) => {
    try {
      kanjiData.Kanji = kanjiCharacter;

      // Obtener detalles del kanji específico desde la API
      const kanjiResponse = await fetch(
        `https://kanjiapi.dev/v1/kanji/${kanjiCharacter}`
      );

      if (!kanjiResponse.ok) {
        throw new Error(
          `Error ${kanjiResponse.status}: No se pudieron obtener los detalles del kanji ${kanjiCharacter}`
        );
      }

      const kanjiDetails = await kanjiResponse.json();

      // Procesamiento de lecturas On (音読み)
      if (kanjiDetails.on_readings?.length > 0) {
        kanjiData.CorrectReadingOn = kanjiDetails.on_readings[0];
        // Almacenar todas las lecturas On válidas para validación flexible
        kanjiData.AllValidOnReadings = kanjiDetails.on_readings;
      } else {
        kanjiData.CorrectReadingOn = "Lectura On no disponible";
        kanjiData.AllValidOnReadings = [];
      }

      // Procesamiento de lecturas Kun (訓読み) con manejo especial de puntos
      if (kanjiDetails.kun_readings?.length > 0) {
        const firstKunReading = kanjiDetails.kun_readings[0];
        kanjiData.CorrectReadingKun = firstKunReading;

        // Extraer todas las variantes válidas de lecturas Kun
        kanjiData.AllValidKunReadings = [];

        kanjiDetails.kun_readings.forEach((reading) => {
          // Agregar la lectura completa tal como viene
          kanjiData.AllValidKunReadings.push(reading);

          // Si contiene punto (okurigana), agregar también las variantes
          if (reading.includes(".")) {
            const parts = reading.split(".");
            // Agregar la parte antes del punto (raíz del kanji)
            if (parts[0]) {
              kanjiData.AllValidKunReadings.push(parts[0]);
            }
            // Agregar la combinación completa sin el punto
            kanjiData.AllValidKunReadings.push(reading.replace(".", ""));
          }
        });

        // Eliminar duplicados para evitar validaciones redundantes
        kanjiData.AllValidKunReadings = [
          ...new Set(kanjiData.AllValidKunReadings),
        ];
      } else {
        kanjiData.CorrectReadingKun = "Lectura Kun no disponible";
        kanjiData.AllValidKunReadings = [];
      }

      // Procesamiento de significados (siempre en inglés como referencia estándar)
      const originalMeaning =
        kanjiDetails.meanings?.length > 0
          ? kanjiDetails.meanings[0]
          : "Meaning not available";

      // Los significados se mantienen en inglés como vienen de la API
      kanjiData.CorrectMeaning = originalMeaning;

      // Almacenar todos los significados válidos para validación flexible
      kanjiData.AllValidMeanings =
        kanjiDetails.meanings?.length > 0 ? kanjiDetails.meanings : [];

      return kanjiData;
    } catch (error) {
      console.error("Error loading kanji details:", error);
      throw error;
    }
  };

  // ===== FUNCIONES DE NAVEGACIÓN POR SUBNIVELES =====

  /**
   * Obtiene el siguiente kanji en el subnivel actual.
   * Valida que no se exceda el rango del subnivel.
   *
   * @returns {Object} Datos del siguiente kanji
   * @throws {Error} Si no hay más kanjis en el subnivel
   */
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

      return kanjiData;
    } catch (error) {
      console.error("Error getting next kanji:", error);
      throw error;
    }
  };

  /**
   * Obtiene el kanji anterior en el subnivel actual.
   * Valida que no se vaya por debajo del índice 0.
   *
   * @returns {Object} Datos del kanji anterior
   * @throws {Error} Si ya está en el primer kanji del subnivel
   */
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

      return kanjiData;
    } catch (error) {
      console.error("Error getting previous kanji:", error);
      throw error;
    }
  };

  /**
   * Obtiene un kanji aleatorio del subnivel actual.
   * Útil para práctica sin orden específico.
   *
   * @returns {Object} Datos del kanji aleatorio
   * @throws {Error} Si no hay kanjis disponibles
   */
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

      return kanjiData;
    } catch (error) {
      console.error("Error getting random kanji:", error);
      throw error;
    }
  };

  // ===== FUNCIONES DE NAVEGACIÓN GENERAL (NIVEL COMPLETO) =====

  /**
   * Obtiene el siguiente kanji del nivel completo (sin restricción de subnivel).
   * Implementa navegación circular: al llegar al final vuelve al inicio.
   *
   * @returns {Object} Datos del siguiente kanji
   * @throws {Error} Si no hay kanjis cargados
   */
  const getNextKanjiFromLevel = async () => {
    try {
      if (navigationData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados para este nivel");
      }

      const nextIndex = navigationData.currentKanjiIndex + 1;

      if (nextIndex >= navigationData.kanjiList.length) {
        // Si llegamos al final, volver al primero (navegación circular)
        navigationData.currentKanjiIndex = 0;
      } else {
        navigationData.currentKanjiIndex = nextIndex;
      }

      const nextKanji =
        navigationData.kanjiList[navigationData.currentKanjiIndex];
      await loadKanjiDetails(nextKanji);

      return kanjiData;
    } catch (error) {
      console.error("Error getting next kanji from level:", error);
      throw error;
    }
  };

  /**
   * Obtiene el kanji anterior del nivel completo.
   * Implementa navegación circular: al llegar al inicio va al final.
   *
   * @returns {Object} Datos del kanji anterior
   * @throws {Error} Si no hay kanjis cargados
   */
  const getPreviousKanjiFromLevel = async () => {
    try {
      if (navigationData.kanjiList.length === 0) {
        throw new Error("No hay kanjis cargados para este nivel");
      }

      const previousIndex = navigationData.currentKanjiIndex - 1;

      if (previousIndex < 0) {
        // Si llegamos al inicio, ir al último kanji (navegación circular)
        navigationData.currentKanjiIndex = navigationData.kanjiList.length - 1;
      } else {
        navigationData.currentKanjiIndex = previousIndex;
      }

      const previousKanji =
        navigationData.kanjiList[navigationData.currentKanjiIndex];
      await loadKanjiDetails(previousKanji);

      return kanjiData;
    } catch (error) {
      console.error("Error getting previous kanji from level:", error);
      throw error;
    }
  };

  /**
   * Obtiene un kanji aleatorio del nivel completo.
   *
   * @returns {Object} Datos del kanji aleatorio
   * @throws {Error} Si no hay kanjis cargados
   */
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

      return kanjiData;
    } catch (error) {
      console.error("Error getting random kanji from level:", error);
      throw error;
    }
  };

  // ===== FUNCIONES UNIVERSALES DE NAVEGACIÓN =====

  /**
   * Función universal para navegar al siguiente kanji.
   * Detecta automáticamente si debe usar navegación por subnivel o por nivel completo.
   *
   * @returns {Object} Datos del siguiente kanji
   * @throws {Error} Si no hay kanjis cargados
   */
  const goToNextKanji = async () => {
    // Si estamos en modo subnivel (nivel JLPT con múltiples subniveles)
    if (
      sublevelData.currentLevel &&
      sublevelData.kanjiList.length > 0 &&
      sublevelData.totalSublevels > 1
    ) {
      return await getNextKanji();
    }
    // Para niveles sin subniveles, usar navegación de nivel completo
    else if (navigationData.kanjiList.length > 0) {
      return await getNextKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  /**
   * Función universal para obtener un kanji aleatorio.
   * Detecta automáticamente el contexto de navegación apropiado.
   *
   * @returns {Object} Datos del kanji aleatorio
   * @throws {Error} Si no hay kanjis cargados
   */
  const goToRandomKanji = async () => {
    // Si estamos en modo subnivel (nivel JLPT con múltiples subniveles)
    if (
      sublevelData.currentLevel &&
      sublevelData.kanjiList.length > 0 &&
      sublevelData.totalSublevels > 1
    ) {
      return await getRandomKanjiFromSublevel();
    }
    // Para niveles sin subniveles, usar navegación de nivel completo
    else if (navigationData.kanjiList.length > 0) {
      return await getRandomKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  /**
   * Función universal para navegar al kanji anterior.
   * Detecta automáticamente el contexto de navegación apropiado.
   *
   * @returns {Object} Datos del kanji anterior
   * @throws {Error} Si no hay kanjis cargados
   */
  const goToPreviousKanji = async () => {
    // Si estamos en modo subnivel (nivel JLPT con múltiples subniveles)
    if (
      sublevelData.currentLevel &&
      sublevelData.kanjiList.length > 0 &&
      sublevelData.totalSublevels > 1
    ) {
      return await getPreviousKanji();
    }
    // Para niveles sin subniveles, usar navegación de nivel completo
    else if (navigationData.kanjiList.length > 0) {
      return await getPreviousKanjiFromLevel();
    } else {
      throw new Error("No hay kanjis cargados para navegar");
    }
  };

  // ===== FUNCIONES DE GESTIÓN DE NIVELES Y UTILIDADES =====

  /**
   * Obtiene información completa de subniveles para un nivel específico.
   * Calcula el número de subniveles basado en la cantidad total de kanjis.
   *
   * @param {string} level - Nivel JLPT (ej: "jlpt-5")
   * @returns {Object} Información del nivel con kanjiList, totalKanjis y totalSublevels
   * @throws {Error} Si no se puede obtener la información del nivel
   */
  const getSublevelsInfo = async (level) => {
    try {
      // Obtener la lista completa de kanjis del nivel desde la API
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

  /**
   * Función original para cargar kanjis por nivel completo (sin subniveles).
   * Mantiene compatibilidad con niveles que no requieren subdivisión.
   *
   * @param {string} level - Nivel a cargar
   * @returns {Object} Datos del primer kanji del nivel
   * @throws {Error} Si no se puede cargar el nivel
   */
  const fetchKanjiByLevel = async (level) => {
    try {
      loading.value = true;
      error.value = null;

      // Obtener lista de kanjis del nivel
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

      // Configurar estado de navegación general
      navigationData.currentLevel = level;
      navigationData.kanjiList = levelData;
      navigationData.currentKanjiIndex = 0;

      // Seleccionar y cargar el primer kanji automáticamente
      const selectedKanji = levelData[0];
      await loadKanjiDetails(selectedKanji);

      return kanjiData;
    } catch (err) {
      console.error("Error fetching kanji data:", err);
      error.value = err.message || "Error desconocido al cargar el kanji";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Verifica si un nivel debería usar subniveles basado en la cantidad de kanjis.
   * Útil para determinar la estrategia de navegación apropiada.
   *
   * @param {string} level - Nivel a verificar
   * @returns {boolean} true si el nivel debe usar subniveles
   */
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

  /**
   * Resetea todos los datos de kanji al estado inicial.
   * Útil para limpiar el estado entre navegaciones o al cambiar de nivel.
   */
  const resetKanjiData = () => {
    kanjiData.Kanji = "";
    kanjiData.CorrectMeaning = "";
    kanjiData.CorrectReadingOn = "";
    kanjiData.CorrectReadingKun = "";
    kanjiData.AllValidOnReadings = [];
    kanjiData.AllValidKunReadings = [];
    kanjiData.AllValidMeanings = [];
    error.value = null;
  };

  return {
    // Estados globales
    loading, // Estado de carga
    error, // Errores de API o validación
    kanjiData, // Datos del kanji actual
    sublevelData, // Estado de navegación por subniveles
    navigationData, // Estado de navegación general

    // Funciones principales de carga
    fetchKanjiByLevel, // Cargar nivel completo
    fetchKanjisBySublevel, // Cargar por subnivel específico
    getSublevelsInfo, // Obtener info de subniveles

    // Funciones de navegación por subniveles
    getNextKanji, // Siguiente en subnivel
    getPreviousKanji, // Anterior en subnivel
    getRandomKanjiFromSublevel, // Aleatorio en subnivel

    // Funciones de navegación por nivel completo
    getPreviousKanjiFromLevel, // Anterior en nivel
    getRandomKanjiFromLevel, // Aleatorio en nivel

    // Funciones universales de navegación
    goToNextKanji, // Siguiente (detecta contexto)
    goToPreviousKanji, // Anterior (detecta contexto)
    goToRandomKanji, // Aleatorio (detecta contexto)

    // Funciones de utilidad
    shouldUseSublevel, // Verificar si usar subniveles
    resetKanjiData, // Limpiar datos
  };
}
