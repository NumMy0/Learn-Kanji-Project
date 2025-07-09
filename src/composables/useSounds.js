/**
 * useSounds.js
 *
 * Composable para manejar efectos de sonido en la aplicación.
 * Proporciona funciones para reproducir sonidos con soporte para
 * sonidos sintéticos y archivos de audio, con sistema de cache
 * y control de volumen.
 *
 * Características:
 * - Sistema de cache para optimizar rendimiento
 * - Soporte para sonidos sintéticos (Web Audio API)
 * - Fallback a archivos de audio tradicionales
 * - Control global de habilitación/deshabilitación
 * - Precarga automática de sonidos
 * - Control de volumen personalizable
 *
 * @author Learn Kanji Project
 * @since 1.0.0
 */

import { ref } from "vue";
import { syntheticSounds } from "../assets/sounds/synthetic.js";

// ===== ESTADO REACTIVO =====
/** @type {Ref<boolean>} Controla si los sonidos están habilitados globalmente */
const soundEnabled = ref(true);

/** @type {Ref<boolean>} Determina si usar sonidos sintéticos por defecto */
const useSynthetic = ref(true);

// ===== CONFIGURACIÓN DE ARCHIVOS =====
/**
 * URLs de los archivos de sonido
 * @type {Object<string, string>}
 */
const soundFiles = {
  buttonClick: "/src/assets/sounds/button-click.mp3",
  correctAnswer: "/src/assets/sounds/correct-answer.mp3",
  incorrectAnswer: "/src/assets/sounds/incorrect-answer.mp3",
  keyboardKey: "/src/assets/sounds/keyboard-key.mp3",
};

/**
 * Cache de objetos Audio para mejorar el rendimiento
 * @type {Object<string, HTMLAudioElement>}
 */
const audioCache = {};

// ===== FUNCIONES DE GESTIÓN =====
/**
 * Precarga todos los archivos de sonido en memoria
 * Mejora la latencia al reproducir sonidos posteriormente
 */
const preloadSounds = () => {
  Object.entries(soundFiles).forEach(([key, url]) => {
    try {
      const audio = new Audio(url);
      audio.preload = "auto"; // Precargar automáticamente
      audio.volume = 0.5; // Volumen por defecto al 50%
      audioCache[key] = audio; // Guardar en cache
    } catch (error) {
      console.warn(`No se pudo precargar el sonido ${key}:`, error);
    }
  });
};

/**
 * Reproduce un sonido específico
 *
 * @param {string} soundName - Nombre del sonido a reproducir
 * @param {number} volume - Volumen de reproducción (0.0 a 1.0)
 * @example
 * playSound('buttonClick', 0.7); // Reproducir con 70% de volumen
 */
const playSound = (soundName, volume = 0.5) => {
  // No reproducir si los sonidos están deshabilitados
  if (!soundEnabled.value) return;

  try {
    // Prioridad: sonidos sintéticos si están disponibles
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
        // Fallback a sonido sintético si existe
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
