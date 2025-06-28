<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMotion } from '../composables/useMotion.js';
import JapaneseKeyBoard from './JapaneseKeyBoard.vue';

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
    CorrectReadingOn: {
        type: String,
        required: true
    },
    CorrectReadingKun: {
        type: String,
        required: true
    }
});

const userInput = ref('');
const userInputOn = ref('');
const userInputKun = ref('');
const showAnswer = ref(false);
const isCorrect = ref(null);
const attempts = ref(0);
const maxAttempts = 3;
const showHint = ref(false);
const studyMode = ref(false);
const showKeyboard = ref(false);
const matchedReadingType = ref('');
const activeInput = ref('on'); // 'on' o 'kun'

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
    if (!userInputOn.value.trim() || !userInputKun.value.trim()) return;
    
    attempts.value++;
    const userAnswerOn = normalizeText(userInputOn.value);
    const userAnswerKun = normalizeText(userInputKun.value);
    const correctAnswerOn = normalizeText(props.CorrectReadingOn);
    const correctAnswerKun = normalizeText(props.CorrectReadingKun);
    
    // Verificar cuáles lecturas son correctas
    const onCorrect = userAnswerOn === correctAnswerOn;
    const kunCorrect = userAnswerKun === correctAnswerKun;
    
    if (onCorrect && kunCorrect) {
        matchedReadingType.value = 'ambas lecturas (On y Kun)';
        isCorrect.value = true;
    } else {
        // Guardar información sobre qué está incorrecto para mostrar feedback específico
        if (onCorrect && !kunCorrect) {
            matchedReadingType.value = 'lectura On correcta, pero Kun incorrecta';
        } else if (!onCorrect && kunCorrect) {
            matchedReadingType.value = 'lectura Kun correcta, pero On incorrecta';
        } else {
            matchedReadingType.value = 'ambas lecturas incorrectas';
        }
        isCorrect.value = false;
    }
    
    if (isCorrect.value) {
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
    userInputOn.value = '';
    userInputKun.value = '';
    showAnswer.value = false;
    isCorrect.value = null;
    attempts.value = 0;
    showHint.value = false;
    studyMode.value = false;
    matchedReadingType.value = '';
    activeInput.value = 'on';
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
    // Mostrar ambas lecturas como pista, pero parcialmente
    const onReading = props.CorrectReadingOn || '';
    const kunReading = props.CorrectReadingKun || '';
    
    const onHint = onReading ? onReading.substring(0, Math.ceil(onReading.length / 2)) + '...' : '';
    const kunHint = kunReading ? kunReading.substring(0, Math.ceil(kunReading.length / 2)) + '...' : '';
    
    return `On: ${onHint}, Kun: ${kunHint}`;
};

// Funciones para el teclado japonés
const handleKeyboardInput = (char) => {
    if (activeInput.value === 'on') {
        userInputOn.value += char;
    } else {
        userInputKun.value += char;
    }
};

const handleKeyboardClear = () => {
    if (activeInput.value === 'on') {
        userInputOn.value = '';
    } else {
        userInputKun.value = '';
    }
};

const setActiveInput = (inputType) => {
    activeInput.value = inputType;
};

const toggleKeyboard = () => {
    showKeyboard.value = !showKeyboard.value;
};

const closeKeyboard = () => {
    showKeyboard.value = false;
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
  <div class="min-h-screen bg-gradient-to-br from-background to-grisTinta p-4">
    
    <!-- Contenedor de botones superiores -->
    <div class="fixed top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
      <!-- Botón de regreso -->
      <router-link 
        to="/" 
        class="btn-3d btn-3d-green-back pointer-events-auto"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </router-link>

      <!-- Botones de la derecha -->
      <div class="flex gap-3 pointer-events-auto">
        <!-- Botón de teclado japonés -->
        <button
          @click="toggleKeyboard"
          class="btn-3d btn-3d-green-floating gap-2"
          :class="{ 'bg-MossGreen text-snow': showKeyboard }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zm0 0l7 5 7-5"></path>
          </svg>
          キーボード
        </button>

        <!-- Botón de modo estudio -->
        <button
          @click="toggleStudyMode"
          class="btn-3d btn-3d-green-floating gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          {{ studyMode ? 'Practicar' : 'Estudiar' }}
        </button>
      </div>
    </div>

    <!-- Contenedor principal -->
    <div class="flex items-center justify-center min-h-screen">
      <div class="flex items-start gap-6 max-w-6xl mx-auto w-full">
        
        <!-- Tarjeta principal -->
        <div class="kanji-card max-w-lg w-full">
          <div class="bg-Marfil backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-platinum">
            
            <!-- Progreso -->
            <div v-if="!studyMode && attempts > 0" class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-azulIndigo">Progreso</span>
                <span class="text-sm text-Aonobi">{{ attempts }}/{{ maxAttempts }}</span>
              </div>
              <div class="w-full bg-GrisNeutro rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-MossGreen to-FernGreen h-2 rounded-full transition-all duration-500"
                  :style="{ width: progressPercent + '%' }"
                ></div>
              </div>
            </div>

            <!-- Kanji principal -->
            <div class="text-center mb-6">
              <div class="bg-gradient-to-br from-platinum to-GrisNeutro rounded-2xl p-6 mb-4 border-2 border-timberWolf">
                <div class="text-7xl md:text-8xl font-bold text-grisTinta leading-none select-none">
                  {{ Kanji }}
                </div>
              </div>
            </div>

            <!-- Información del kanji -->
            <div class="space-y-4 mb-6">
              <!-- Significado -->
              <div class="bg-gradient-to-r from-platinum to-Marfil rounded-xl p-4 border border-MossGreen">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-MossGreen rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-snow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-azulIndigo">Significado</p>
                    <p class="text-lg font-semibold text-grisTinta">{{ CorrectMeaning }}</p>
                  </div>
                </div>
              </div>

              <!-- Lecturas (mostrar solo en modo estudio o cuando se muestre la respuesta) -->
              <div v-if="studyMode || showAnswer" class="space-y-3">
                <!-- Lectura On -->
                <div v-if="CorrectReadingOn" class="bg-gradient-to-r from-platinum to-Marfil rounded-xl p-4 border border-FernGreen">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-FernGreen rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-snow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-azulIndigo">Lectura On (音読み)</p>
                      <p class="text-lg font-semibold text-grisTinta">{{ CorrectReadingOn }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Lectura Kun -->
                <div v-if="CorrectReadingKun" class="bg-gradient-to-r from-platinum to-Marfil rounded-xl p-4 border border-HunterGreen">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-HunterGreen rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-snow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-azulIndigo">Lectura Kun (訓読み)</p>
                      <p class="text-lg font-semibold text-grisTinta">{{ CorrectReadingKun }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Área de práctica (solo si no está en modo estudio) -->
            <div v-if="!studyMode" class="space-y-4">
              
              <!-- Pista -->
              <div v-if="showHint" class="bg-coquelicot/10 border border-cardinal rounded-xl p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-cardinal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <span class="font-medium text-firebrick">Pista</span>
                </div>
                <p class="text-cardinal">Las lecturas comienzan con: <span class="font-bold">{{ getHint() }}</span></p>
              </div>

              <!-- Input y validación -->
              <div v-if="!showAnswer" class="space-y-4">
                <!-- Inputs para las lecturas -->
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-grisTinta">
                      Lectura On (音読み)
                    </label>
                    <input
                      v-model="userInputOn"
                      @focus="setActiveInput('on')"
                      @keyup.enter="validateAnswer"
                      type="text"
                      placeholder="Escribe la lectura On..."
                      class="error-shake w-full px-4 py-3 border border-timberWolf rounded-xl focus:ring-2 focus:ring-FernGreen focus:border-transparent outline-none transition-all duration-200 text-lg"
                      :class="{ 
                        'border-cardinal bg-coquelicot/10': isCorrect === false,
                        'ring-2 ring-FernGreen border-FernGreen': activeInput === 'on' && showKeyboard 
                      }"
                    >
                  </div>
                  
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-grisTinta">
                      Lectura Kun (訓読み)
                    </label>
                    <input
                      v-model="userInputKun"
                      @focus="setActiveInput('kun')"
                      @keyup.enter="validateAnswer"
                      type="text"
                      placeholder="Escribe la lectura Kun..."
                      class="error-shake w-full px-4 py-3 border border-timberWolf rounded-xl focus:ring-2 focus:ring-HunterGreen focus:border-transparent outline-none transition-all duration-200 text-lg"
                      :class="{ 
                        'border-cardinal bg-coquelicot/10': isCorrect === false,
                        'ring-2 ring-HunterGreen border-HunterGreen': activeInput === 'kun' && showKeyboard 
                      }"
                    >
                  </div>
                </div>
                
                <button
                  @click="validateAnswer"
                  :disabled="!userInputOn.trim() || !userInputKun.trim()"
                  class="w-full btn-3d btn-3d-green-primary"
                >
                  Validar Ambas Lecturas
                </button>
              </div>

              <!-- Resultado -->
              <div v-if="showAnswer" class="text-center space-y-4">
                <div v-if="isCorrect" class="success-animation">
                  <div class="w-20 h-20 bg-Mindaro/20 border-2 border-MossGreen rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-FernGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-FernGreen mb-2">¡Correcto!</h3>
                  <div class="text-grisTinta space-y-1">
                    <p>Has acertado {{ matchedReadingType }}</p>
                    <p>en {{ attempts }} {{ attempts === 1 ? 'intento' : 'intentos' }}</p>
                  </div>
                </div>
                
                <div v-else class="error-shake">
                  <div class="w-20 h-20 bg-coquelicot/20 border-2 border-cardinal rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-cardinal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-cardinal mb-2">Incorrecto</h3>
                  <div class="text-grisTinta space-y-2">
                    <p class="text-cardinal font-medium">{{ matchedReadingType }}</p>
                    <div class="space-y-1">
                      <p><span class="font-bold text-cardinal">On correcta: {{ CorrectReadingOn }}</span></p>
                      <p><span class="font-bold text-cardinal">Kun correcta: {{ CorrectReadingKun }}</span></p>
                    </div>
                  </div>
                </div>

                <button
                  @click="resetCard"
                  class="btn-3d btn-3d-green-light"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>

            <!-- Modo estudio info -->
            <div v-if="studyMode" class="text-center space-y-4">
              <div class="bg-Mindaro/20 border border-MossGreen rounded-xl p-4">
                <div class="flex items-center justify-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-FernGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  <span class="font-medium text-HunterGree">Modo Estudio</span>
                </div>
                <p class="text-FernGreen text-sm">Estudia el kanji con toda la información visible. Cambia a modo "Practicar" cuando estés listo.</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Teclado japonés al costado -->
        <div v-if="showKeyboard" class="flex-shrink-0">
          <!-- Indicador del input activo -->
          <div class="mb-3 p-2 bg-platinum rounded-lg border border-timberWolf">
            <p class="text-xs font-medium text-grisTinta mb-1">Escribiendo en:</p>
            <div class="flex gap-2">
              <span 
                :class="activeInput === 'on' ? 'bg-FernGreen text-snow' : 'bg-GrisNeutro text-grisTinta'"
                class="px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                On (音読み)
              </span>
              <span 
                :class="activeInput === 'kun' ? 'bg-HunterGreen text-snow' : 'bg-GrisNeutro text-grisTinta'"
                class="px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                Kun (訓読み)
              </span>
            </div>
          </div>
          
          <JapaneseKeyBoard 
            @text-input="handleKeyboardInput"
            @clear="handleKeyboardClear"
            @close="closeKeyboard"
          />
        </div>

      </div>
    </div>
  </div>
</template>