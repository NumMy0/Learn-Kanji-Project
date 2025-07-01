import { ref } from "vue";
import { syntheticSounds } from "../assets/sounds/synthetic.js";

// Estado para controlar si los sonidos están habilitados
const soundEnabled = ref(true);

// URLs de los archivos de sonido
const soundFiles = {
  buttonClick: "/src/assets/sounds/button-click.mp3",
  correctAnswer: "/src/assets/sounds/correct-answer.mp3",
  incorrectAnswer: "/src/assets/sounds/incorrect-answer.mp3",
  keyboardKey: "/src/assets/sounds/keyboard-key.mp3",
};

// Cache de objetos Audio para mejorar el rendimiento
const audioCache = {};
const useSynthetic = ref(true); // Usar sonidos sintéticos por defecto

// Función para precargar todos los sonidos
const preloadSounds = () => {
  Object.entries(soundFiles).forEach(([key, url]) => {
    try {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = 0.5; // Volumen por defecto al 50%
      audioCache[key] = audio;
    } catch (error) {
      console.warn(`No se pudo precargar el sonido ${key}:`, error);
    }
  });
};

// Función para reproducir un sonido específico
const playSound = (soundName, volume = 0.5) => {
  if (!soundEnabled.value) return;

  try {
    // Si usamos sonidos sintéticos, reproducir directamente
    if (useSynthetic.value && syntheticSounds[soundName]) {
      syntheticSounds[soundName]();
      return;
    }

    let audio = audioCache[soundName];

    // Si no está en cache, crear nuevo objeto Audio
    if (!audio) {
      const url = soundFiles[soundName];
      if (!url) {
        console.warn(`Sonido '${soundName}' no encontrado`);
        // Fallback a sonido sintético
        if (syntheticSounds[soundName]) {
          syntheticSounds[soundName]();
        }
        return;
      }

      audio = new Audio(url);
      audioCache[soundName] = audio;

      // Si falla cargar el archivo, usar sonido sintético
      audio.onerror = () => {
        console.warn(`Error cargando ${soundName}, usando sonido sintético`);
        if (syntheticSounds[soundName]) {
          syntheticSounds[soundName]();
        }
      };
    }

    // Configurar volumen y reproducir
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0; // Reiniciar al inicio

    const playPromise = audio.play();

    // Manejar la promesa para evitar errores en navegadores que requieren interacción del usuario
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(`Error al reproducir sonido ${soundName}:`, error);
        // Fallback a sonido sintético
        if (syntheticSounds[soundName]) {
          syntheticSounds[soundName]();
        }
      });
    }
  } catch (error) {
    console.warn(`Error al reproducir sonido ${soundName}:`, error);
    // Fallback a sonido sintético
    if (syntheticSounds[soundName]) {
      syntheticSounds[soundName]();
    }
  }
};

// Funciones específicas para cada tipo de sonido
const playButtonClick = (volume = 0.3) => playSound("buttonClick", volume);
const playCorrectAnswer = (volume = 0.6) => playSound("correctAnswer", volume);
const playIncorrectAnswer = (volume = 0.5) =>
  playSound("incorrectAnswer", volume);
const playKeyboardKey = (volume = 0.2) => playSound("keyboardKey", volume);

// Función para alternar el estado de los sonidos
const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
};

// Función para establecer el volumen global
const setGlobalVolume = (volume) => {
  Object.values(audioCache).forEach((audio) => {
    audio.volume = Math.max(0, Math.min(1, volume));
  });
};

export function useSounds() {
  return {
    soundEnabled,
    useSynthetic,
    preloadSounds,
    playSound,
    playButtonClick,
    playCorrectAnswer,
    playIncorrectAnswer,
    playKeyboardKey,
    toggleSound,
    setGlobalVolume,
  };
}
