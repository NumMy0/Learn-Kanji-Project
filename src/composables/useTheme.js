import { ref, computed, watch } from "vue";

// Estado reactivo para el tema
const currentTheme = ref("light");
const isSystemDarkMode = ref(false);

// Detectar preferencia del sistema
const detectSystemTheme = () => {
  if (typeof window !== "undefined") {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    isSystemDarkMode.value = darkModeQuery.matches;

    // Escuchar cambios en las preferencias del sistema
    darkModeQuery.addEventListener("change", (e) => {
      isSystemDarkMode.value = e.matches;
      if (currentTheme.value === "system") {
        applyTheme();
      }
    });
  }
};

// Cargar tema guardado o usar sistema por defecto
const loadSavedTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("japanese-app-theme") || "light";
    currentTheme.value = savedTheme;
    detectSystemTheme();
    applyTheme();
  }
};

// Aplicar tema al DOM
const applyTheme = () => {
  if (typeof window !== "undefined") {
    const effectiveTheme =
      currentTheme.value === "system"
        ? isSystemDarkMode.value
          ? "dark"
          : "light"
        : currentTheme.value;

    const html = document.documentElement;

    if (effectiveTheme === "dark") {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark");
    } else {
      html.removeAttribute("data-theme");
      html.classList.remove("dark");
    }
  }
};

// Guardar tema en localStorage
const saveTheme = (theme) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("japanese-app-theme", theme);
  }
};

export function useTheme() {
  // Computed para determinar si estamos en modo oscuro
  const isDarkMode = computed(() => {
    if (currentTheme.value === "system") {
      return isSystemDarkMode.value;
    }
    return currentTheme.value === "dark";
  });

  // Computed para el icono del tema
  const themeIcon = computed(() => {
    if (currentTheme.value === "system") {
      return "system";
    }
    return isDarkMode.value ? "dark" : "light";
  });

  // Función para alternar tema
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

  // Función para establecer tema específico
  const setTheme = (theme) => {
    if (["light", "dark", "system"].includes(theme)) {
      currentTheme.value = theme;
      saveTheme(theme);
      applyTheme();
    }
  };

  // Observar cambios en el tema
  watch(currentTheme, () => {
    applyTheme();
  });

  // Inicializar tema al usar el composable
  if (typeof window !== "undefined" && currentTheme.value === "light") {
    loadSavedTheme();
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    isDarkMode,
    themeIcon,
    toggleTheme,
    setTheme,
    loadSavedTheme,
    isSystemDarkMode: computed(() => isSystemDarkMode.value),
  };
}
