import { createApp } from "vue";
import router from "./router/index.js";
import { useSounds } from "./composables/useSounds.js";
import { useTheme } from "./composables/useTheme.js";
import "./style.css";
import App from "./App.vue";

// Precargar sonidos al iniciar la aplicación
const { preloadSounds } = useSounds();
preloadSounds();

// Inicializar tema al cargar la aplicación
const { loadSavedTheme } = useTheme();
loadSavedTheme();

// Create the application
const app = createApp(App);

// Use router
app.use(router);

// Mount the application
app.mount("#app");
