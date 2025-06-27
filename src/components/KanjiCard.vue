<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMotion } from '../composables/useMotion.js';

const { animateIn } = useMotion();

const props = defineProps({
    Kanji: {
        type: String,
        required: true
    },
    CorrectMeaning: {
        type: String,
        required: true
    },
    CorrectReading: {
        type: String,
        required: true
    },
});

const userInput = ref('');
const showAnswer = ref(false);
const isCorrect = ref(null);
const attempts = ref(0);
const maxAttempts = 3;
const showHint = ref(false);
const studyMode = ref(false);

// Computed para mostrar el progreso
const progressPercent = computed(() => {
    if (attempts.value === 0) return 0;
    return Math.min((attempts.value / maxAttempts) * 100, 100);
});

// Función para normalizar respuestas (eliminar espacios, convertir a minúsculas)
const normalizeText = (text) => {
    return text.toLowerCase().trim().replace(/\s+/g, '');
};

// Función para validar la respuesta
const validateAnswer = () => {
    if (!userInput.value.trim()) return;
    
    attempts.value++;
    const userAnswer = normalizeText(userInput.value);
    const correctAnswer = normalizeText(props.CorrectReading);
    
    if (userAnswer === correctAnswer) {
        isCorrect.value = true;
        showAnswer.value = true;
        
        // Animar éxito
        animateIn('.success-animation', {
            scale: [0.8, 1.2, 1],
            opacity: [0, 1],
            duration: 0.6,
            easing: 'ease-out'
        });
    } else {
        isCorrect.value = false;
        
        if (attempts.value >= maxAttempts) {
            showAnswer.value = true;
        } else if (attempts.value === 2) {
            showHint.value = true;
        }
        
        // Animar error
        animateIn('.error-shake', {
            x: [-10, 10, -10, 10, 0],
            duration: 0.5,
            easing: 'ease-in-out'
        });
    }
};

// Función para resetear el estado
const resetCard = () => {
    userInput.value = '';
    showAnswer.value = false;
    isCorrect.value = null;
    attempts.value = 0;
    showHint.value = false;
    studyMode.value = false;
};

// Función para alternar modo estudio
const toggleStudyMode = () => {
    studyMode.value = !studyMode.value;
    if (studyMode.value) {
        showAnswer.value = true;
    } else {
        resetCard();
    }
};

// Función para obtener una pista
const getHint = () => {
    const reading = props.CorrectReading;
    const hintLength = Math.ceil(reading.length / 2);
    return reading.substring(0, hintLength) + '...';
};

onMounted(() => {
    // Animar la entrada de la card
    animateIn('.kanji-card', {
        y: [50, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 0.8,
        easing: 'ease-out'
    });
});

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background to-grisTinta flex items-center justify-center p-4 relative">
    
    <!-- Botón de regreso -->
    <router-link 
      to="/" 
      class="fixed top-6 left-6 z-20 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <svg class="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
    </router-link>

    <!-- Botón de modo estudio -->
    <button
      @click="toggleStudyMode"
      class="fixed top-6 right-6 z-20 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>
      {{ studyMode ? 'Practicar' : 'Estudiar' }}
    </button>

    <!-- Tarjeta principal -->
    <div class="kanji-card max-w-lg w-full mx-auto">
      <div class="bg-snow backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
        
        <!-- Progreso -->
        <div v-if="!studyMode && attempts > 0" class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-600">Progreso</span>
            <span class="text-sm text-gray-500">{{ attempts }}/{{ maxAttempts }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Kanji principal -->
        <div class="text-center mb-6">
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-4 border-2 border-gray-200">
            <div class="text-7xl md:text-8xl font-bold text-gray-800 leading-none select-none">
              {{ Kanji }}
            </div>
          </div>
        </div>

        <!-- Información del kanji -->
        <div class="space-y-4 mb-6">
          <!-- Significado -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-blue-700">Significado</p>
                <p class="text-lg font-semibold text-blue-900">{{ CorrectMeaning }}</p>
              </div>
            </div>
          </div>

          <!-- Lectura (mostrar solo en modo estudio o cuando se muestre la respuesta) -->
          <div v-if="studyMode || showAnswer" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-green-700">Lectura</p>
                <p class="text-lg font-semibold text-green-900">{{ CorrectReading }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Área de práctica (solo si no está en modo estudio) -->
        <div v-if="!studyMode" class="space-y-4">
          
          <!-- Pista -->
          <div v-if="showHint" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <span class="font-medium text-yellow-800">Pista</span>
            </div>
            <p class="text-yellow-700">La lectura comienza con: <span class="font-bold">{{ getHint() }}</span></p>
          </div>

          <!-- Input y validación -->
          <div v-if="!showAnswer" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-black mb-2">
                ¿Cuál es la lectura de este kanji?
              </label>
              <input
                v-model="userInput"
                @keyup.enter="validateAnswer"
                type="text"
                placeholder="Escribe la lectura aquí..."
                class="error-shake w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-lg"
                :class="{ 'border-red-500 bg-red-50': isCorrect === false }"
              >
            </div>
            
            <button
              @click="validateAnswer"
              :disabled="!userInput.trim()"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              Validar Respuesta
            </button>
          </div>

          <!-- Resultado -->
          <div v-if="showAnswer" class="text-center space-y-4">
            <div v-if="isCorrect" class="success-animation">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-green-600 mb-2">¡Correcto!</h3>
              <p class="text-gray-600">Has acertado en {{ attempts }} {{ attempts === 1 ? 'intento' : 'intentos' }}</p>
            </div>
            
            <div v-else class="error-shake">
              <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-red-600 mb-2">Incorrecto</h3>
              <p class="text-gray-600">La respuesta correcta es: <span class="font-bold text-red-600">{{ CorrectReading }}</span></p>
            </div>

            <button
              @click="resetCard"
              class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>

        <!-- Modo estudio info -->
        <div v-if="studyMode" class="text-center space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-center justify-center gap-2 mb-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <span class="font-medium text-blue-800">Modo Estudio</span>
            </div>
            <p class="text-blue-700 text-sm">Estudia el kanji con toda la información visible. Cambia a modo "Practicar" cuando estés listo.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>