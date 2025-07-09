/**
 * useTheme.js
 *
 * Composable para manejar el sistema de temas de la aplicación.
 * Proporciona funcionalidad para alternar entre temas claro, oscuro y sistema,
 * con persistencia en localStorage y detección automática de preferencias del sistema.
 *
 * Características:
 * - Soporte para temas: light, dark, system
 * - Detección automática de preferencias del sistema
 * - Persistencia en localStorage
 * - Aplicación automática de clases CSS y atributos data
 * - Reactividad completa con Vue 3
 *
 * @author Learn Kanji Project
 * @since 1.0.0
 */

import { ref, computed, watch } from "vue";

// ===== ESTADO REACTIVO GLOBAL =====
/** @type {Ref<string>} Tema actual seleccionado por el usuario */
const currentTheme = ref("light");

/** @type {Ref<boolean>} Detección automática si el sistema prefiere tema oscuro */
const isSystemDarkMode = ref(false);

// ===== FUNCIONES DE DETECCIÓN =====
/**
 * Detecta la preferencia de tema del sistema operativo
 * Configura listeners para cambios automáticos
 */
const detectSystemTheme = () => {
  if (typeof window !== "undefined") {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    isSystemDarkMode.value = darkModeQuery.matches;

    // Configurar listener para cambios automáticos en las preferencias
    darkModeQuery.addEventListener("change", (e) => {
      isSystemDarkMode.value = e.matches;
      // Aplicar cambios solo si está en modo sistema
      if (currentTheme.value === "system") {
        applyTheme();
      }
    });
  }
};

/**
 * Carga el tema guardado desde localStorage
 * Si no hay tema guardado, usa 'light' como predeterminado
 */
const loadSavedTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("japanese-app-theme") || "light";
    currentTheme.value = savedTheme;
    detectSystemTheme();
    applyTheme();
  }
};

/**
 * Aplica el tema actual al DOM
 * Configura clases CSS y atributos data necesarios
 */
const applyTheme = () => {
  if (typeof window !== "undefined") {
    // Determinar tema efectivo (resolver 'system' a 'light' o 'dark')
    const effectiveTheme =
      currentTheme.value === "system"
        ? isSystemDarkMode.value
          ? "dark"
          : "light"
        : currentTheme.value;

    const html = document.documentElement;

    // Aplicar clases y atributos correspondientes
    if (effectiveTheme === "dark") {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark");
    } else {
      html.removeAttribute("data-theme");
      html.classList.remove("dark");
    }
  }
};

/**
 * Guarda el tema seleccionado en localStorage
 * @param {string} theme - Tema a guardar ('light' | 'dark' | 'system')
 */
const saveTheme = (theme) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("japanese-app-theme", theme);
  }
};

/**
 * Composable principal para manejar temas
 *
 * @returns {Object} Objeto con estados y funciones para manejar temas
 * @example
 * const { currentTheme, isDarkMode, toggleTheme, setTheme } = useTheme();
 */
export function useTheme() {
  // ===== COMPUTED PROPERTIES =====
  /**
   * Computed que determina si estamos en modo oscuro
   * Resuelve automáticamente el tema 'system' según las preferencias del OS
   *
   * @returns {boolean} true si el tema efectivo es oscuro
   */
  const isDarkMode = computed(() => {
    if (currentTheme.value === "system") {
      return isSystemDarkMode.value;
    }
    return currentTheme.value === "dark";
  });

  /**
   * Computed para determinar qué icono mostrar según el tema
   *
   * @returns {string} Tipo de icono: 'light', 'dark' o 'system'
   */
  const themeIcon = computed(() => {
    if (currentTheme.value === "system") {
      return "system";
    }
    return isDarkMode.value ? "dark" : "light";
  });

  // ===== FUNCIONES DE CONTROL =====
  /**
   * Alterna entre los temas disponibles en secuencia
   * Secuencia: light → dark → system → light
   *
   * @example
   * <button @click="toggleTheme">Cambiar tema</button>
   */
  const toggleTheme = () => {
    if (currentTheme.value === "light") {
      currentTheme.value = "dark";
    } else if (currentTheme.value === "dark") {
      currentTheme.value = "system";
    } else {
      currentTheme.value = "light";
    }

    saveTheme(currentTheme.value);
    applyTheme();
  };

  /**
   * Establece un tema específico
   *
   * @param {string} theme - Tema a establecer ('light' | 'dark' | 'system')
   * @example
   * setTheme('dark'); // Cambiar a tema oscuro
   */
  const setTheme = (theme) => {
    if (["light", "dark", "system"].includes(theme)) {
      currentTheme.value = theme;
      saveTheme(theme);
      applyTheme();
    }
  };

  // ===== WATCHERS =====
  /**
   * Observar cambios en el tema para aplicar automáticamente
   */
  watch(currentTheme, () => {
    applyTheme();
  });

  // ===== INICIALIZACIÓN =====
  /**
   * Inicializar tema al usar el composable
   * Solo se ejecuta en el lado del cliente y cuando el tema es el por defecto
   */
  if (typeof window !== "undefined" && currentTheme.value === "light") {
    loadSavedTheme();
  }

  // ===== RETORNO DEL COMPOSABLE =====
  return {
    /** Tema actual seleccionado */
    currentTheme: computed(() => currentTheme.value),
    /** Indica si estamos en modo oscuro */
    isDarkMode,
    /** Tipo de icono a mostrar según el tema */
    themeIcon,
    /** Función para alternar entre temas */
    toggleTheme,
    /** Función para establecer un tema específico */
    setTheme,
    /** Función para cargar tema guardado */
    loadSavedTheme,
    /** Indica si el sistema prefiere modo oscuro */
    isSystemDarkMode: computed(() => isSystemDarkMode.value),
  };
}
