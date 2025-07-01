import { createApp } from "vue";
import router from "./router/index.js";
import { useSounds } from "./composables/useSounds.js";
import "./style.css";
import App from "./App.vue";

// Precargar sonidos al iniciar la aplicación
const { preloadSounds } = useSounds();
preloadSounds();

createApp(App).use(router).mount("#app");
