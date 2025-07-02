<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMotion } from '../composables/useMotion.js';
import { useKanji } from '../composables/useKanji.js';
import { useSounds } from '../composables/useSounds.js';
import { useTheme } from '../composables/useTheme.js';
import JapaneseKeyBoard from './JapaneseKeyBoard.vue';

const { animateIn } = useMotion();
const route = useRoute();
const { playButtonClick, playCorrectAnswer, playIncorrectAnswer, soundEnabled, toggleSound } = useSounds();
const { currentTheme, isDarkMode, themeIcon, toggleTheme } = useTheme();
const { 
    sublevelData, 
    navigationData,
    getNextKanji, 
    getPreviousKanji, 
    getRandomKanjiFromSublevel,
    goToNextKanji,
    goToPreviousKanji,
    goToRandomKanji
} = useKanji();

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

// Estados existentes
const userInput = ref('');
const userInputMeaning = ref('');
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
const activeInput = ref('meaning'); // 'meaning', 'on' o 'kun'

// Estados para navegación
const loadingNavigation = ref(false);

// Estados para cursor trail effect
const cursorTrails = ref([]);
const trailId = ref(0);
const lastMousePosition = ref({ x: 0, y: 0 });
const mouseSpeed = ref(0);

// Función para crear cursor trail effect
const createCursorTrail = (e) => {
  // Calcular velocidad del mouse
  const deltaX = e.clientX - lastMousePosition.value.x;
  const deltaY = e.clientY - lastMousePosition.value.y;
  mouseSpeed.value = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  lastMousePosition.value = { x: e.clientX, y: e.clientY };
  
  // Solo crear trail si el mouse se está moviendo
  if (mouseSpeed.value > 2) {
    // Colores según el tema
    const lightColors = [
      '#90A955', // MossGreen
      '#4F772D', // FernGreen
      '#7FB069', // Asparagus
      '#56876D'  // Viridian
    ];
    
    const darkColors = [
      '#4F98CD', // ColumbianBlue
      '#2E5BBA', // SapphireBlue
      '#15457B', // PrussianBlue
      '#1E3A5F'  // SpaceCadet
    ];
    
    const colors = isDarkMode.value ? darkColors : lightColors;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.min(6 + mouseSpeed.value * 0.3, 16);
    
    const trail = {
      id: trailId.value++,
      x: e.clientX,
      y: e.clientY,
      life: 1.0,
      size: size,
      color: randomColor,
      blur: Math.random() * 2 + 1
    };
    
    cursorTrails.value.push(trail);
    
    // Limitar el número de trails basado en la velocidad
    const maxTrails = Math.min(15, 8 + Math.floor(mouseSpeed.value * 0.2));
    if (cursorTrails.value.length > maxTrails) {
      cursorTrails.value.shift();
    }
  }
};

// Función para animar y actualizar trails
const updateTrails = () => {
  cursorTrails.value = cursorTrails.value.filter(trail => {
    trail.life -= 0.08;
    return trail.life > 0;
  });
  requestAnimationFrame(updateTrails);
};

// Computed para verificar si estamos en modo subnivel
const isInSublevelMode = computed(() => {
    return route.query.sublevel && 
           sublevelData.kanjiList.length > 0 && 
           sublevelData.totalSublevels > 1;
});

// Funciones de navegación
const goToNextKanjiManual = async () => {
    playButtonClick();
    try {
        loadingNavigation.value = true;
        await goToNextKanji();
        resetCard();
    } catch (error) {
        console.warn('Error al navegar:', error.message);
    } finally {
        loadingNavigation.value = false;
    }
};

const goToPreviousKanjiAction = async () => {    
    playButtonClick();
    try {
        loadingNavigation.value = true;
        await goToPreviousKanji();
        resetCard();
    } catch (error) {
        console.warn('Error al navegar:', error.message);
    } finally {
        loadingNavigation.value = false;
    }
};

const goToRandomKanjiManual = async () => {
    playButtonClick();
    try {
        loadingNavigation.value = true;
        await goToRandomKanji();
        resetCard();
    } catch (error) {
        console.error('Error al obtener kanji aleatorio:', error);
    } finally {
        loadingNavigation.value = false;
    }
};


// Computed para mostrar el progreso
const progressPercent = computed(() => {
    if (attempts.value === 0) return 0;
    return Math.min((attempts.value / maxAttempts) * 100, 100);
});

// Computed para verificar si los datos del kanji están disponibles
const kanjiDataAvailable = computed(() => {
    return props.CorrectMeaning && 
           props.CorrectReadingOn && 
           props.CorrectReadingKun &&
           !props.CorrectMeaning.includes('no disponible') &&
           !props.CorrectReadingOn.includes('no disponible') &&
           !props.CorrectReadingKun.includes('no disponible');
});

// Computed para verificar qué lecturas están disponibles individualmente
const meaningAvailable = computed(() => {
    return props.CorrectMeaning && !props.CorrectMeaning.includes('no disponible');
});

const onReadingAvailable = computed(() => {
    return props.CorrectReadingOn && !props.CorrectReadingOn.includes('no disponible');
});

const kunReadingAvailable = computed(() => {
    return props.CorrectReadingKun && !props.CorrectReadingKun.includes('no disponible');
});

console.log('Kanji:', props.Kanji);
console.log('Correct Meaning:', props.CorrectMeaning);
console.log('Correct Reading On:', props.CorrectReadingOn);
console.log('Correct Reading Kun:', props.CorrectReadingKun);

// Computed para verificar si todos los inputs disponibles están llenos
const allInputsFilled = computed(() => {
    let allFilled = true;
    
    // Verificar significado si está disponible
    if (meaningAvailable.value) {
        allFilled = allFilled && userInputMeaning.value.trim();
    }
    
    // Verificar lectura On si está disponible
    if (onReadingAvailable.value) {
        allFilled = allFilled && userInputOn.value.trim();
    }
    
    // Verificar lectura Kun si está disponible
    if (kunReadingAvailable.value) {
        allFilled = allFilled && userInputKun.value.trim();
    }
    
    return allFilled;
});

// Computed para verificar si se puede validar la respuesta
const canValidateAnswer = computed(() => {
    // Al menos uno de los campos debe estar disponible
    const hasAvailableData = meaningAvailable.value || onReadingAvailable.value || kunReadingAvailable.value;
    return allInputsFilled.value && hasAvailableData;
});

// Computed para el texto del botón
const buttonText = computed(() => {
    const hasAvailableData = meaningAvailable.value || onReadingAvailable.value || kunReadingAvailable.value;
    
    if (!hasAvailableData) {
        return 'No hay datos disponibles';
    }
    if (!allInputsFilled.value) {
        return 'Completa todas las respuestas disponibles';
    }
    return 'Validar Respuestas';
});

// Computed para saber si el botón debe estar deshabilitado
const isButtonDisabled = computed(() => {
    const hasAvailableData = meaningAvailable.value || onReadingAvailable.value || kunReadingAvailable.value;
    return !allInputsFilled.value || !hasAvailableData;
});

// Función para normalizar respuestas (eliminar espacios, convertir a minúsculas, eliminar caracteres especiales)
const normalizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    // Convertir a minúsculas y eliminar espacios
    let normalized = text.toLowerCase().trim().replace(/\s+/g, '');
    
    // Para lecturas japonesas, eliminar guiones, puntos, comas y otros caracteres especiales
    // Mantener solo hiragana (ひらがな), katakana (カタカナ), letras, números
    normalized = normalized.replace(/[-・。、～〜]/g, '');
    
    // Eliminar cualquier carácter que no sea letra, número, hiragana o katakana
    normalized = normalized.replace(/[^\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9]/g, '');
    
    return normalized;
};

// Función para validar la respuesta
const validateAnswer = () => {
    // Reproducir sonido de clic del botón
    playButtonClick();
    
    // Verificar que tenemos al menos un campo disponible
    const hasAvailableData = meaningAvailable.value || onReadingAvailable.value || kunReadingAvailable.value;
    if (!hasAvailableData) {
        console.error('No hay datos del kanji disponibles para validar');
        isCorrect.value = false;
        matchedReadingType.value = 'No hay datos disponibles para validación';
        showAnswer.value = true;
        return;
    }
    
    // Verificar que los inputs requeridos estén llenos
    if ((meaningAvailable.value && !userInputMeaning.value.trim()) ||
        (onReadingAvailable.value && !userInputOn.value.trim()) ||
        (kunReadingAvailable.value && !userInputKun.value.trim())) {
        return;
    }
    
    attempts.value++;
    
    // Solo validar los campos que están disponibles
    const correctAnswers = [];
    const incorrectAnswers = [];
    let allCorrect = true;
    
    // Validar significado si está disponible
    if (meaningAvailable.value) {
        const userAnswerMeaning = normalizeText(userInputMeaning.value);
        const correctAnswerMeaning = normalizeText(props.CorrectMeaning);
        const meaningCorrect = userAnswerMeaning === correctAnswerMeaning;
        
        console.log('Validando significado:', userAnswerMeaning, '===', correctAnswerMeaning, '?', meaningCorrect);
        
        if (meaningCorrect) {
            correctAnswers.push('significado');
        } else {
            incorrectAnswers.push('significado');
            allCorrect = false;
        }
    }
    
    // Validar lectura On si está disponible
    if (onReadingAvailable.value) {
        const userAnswerOn = normalizeText(userInputOn.value);
        const correctAnswerOn = normalizeText(props.CorrectReadingOn);
        const onCorrect = userAnswerOn === correctAnswerOn;
        
        console.log('Validando lectura On:', userAnswerOn, '===', correctAnswerOn, '?', onCorrect);
        
        if (onCorrect) {
            correctAnswers.push('lectura On');
        } else {
            incorrectAnswers.push('lectura On');
            allCorrect = false;
        }
    }
    
    // Validar lectura Kun si está disponible
    if (kunReadingAvailable.value) {
        const userAnswerKun = normalizeText(userInputKun.value);
        const correctAnswerKun = normalizeText(props.CorrectReadingKun);
        const kunCorrect = userAnswerKun === correctAnswerKun;
        
        console.log('Validando lectura Kun:', userAnswerKun, '===', correctAnswerKun, '?', kunCorrect);
        
        if (kunCorrect) {
            correctAnswers.push('lectura Kun');
        } else {
            incorrectAnswers.push('lectura Kun');
            allCorrect = false;
        }
    }
    
    // Determinar el resultado
    if (allCorrect && correctAnswers.length > 0) {
        matchedReadingType.value = correctAnswers.length === 1 
            ? `${correctAnswers[0]} correcta`
            : `todas las respuestas disponibles (${correctAnswers.join(', ')}) correctas`;
        isCorrect.value = true;
    } else {
        if (correctAnswers.length > 0) {
            matchedReadingType.value = `${correctAnswers.join(' y ')} correcta${correctAnswers.length > 1 ? 's' : ''}, pero ${incorrectAnswers.join(' y ')} incorrecta${incorrectAnswers.length > 1 ? 's' : ''}`;
        } else {
            matchedReadingType.value = `todas las respuestas disponibles incorrectas`;
        }
        isCorrect.value = false;
    }
    
    if (isCorrect.value) {
        showAnswer.value = true;
        
        // Reproducir sonido de respuesta correcta
        playCorrectAnswer();
        
        // Animar éxito
        animateIn('.success-animation', {
            scale: [0.8, 1.2, 1],
            opacity: [0, 1],
            duration: 0.6,
            easing: 'ease-out'
        });
    } else {
        isCorrect.value = false;
        
        // Reproducir sonido de respuesta incorrecta
        playIncorrectAnswer();
        
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
    playButtonClick();
    userInput.value = '';
    userInputMeaning.value = '';
    userInputOn.value = '';
    userInputKun.value = '';
    showAnswer.value = false;
    isCorrect.value = null;
    attempts.value = 0;
    showHint.value = false;
    studyMode.value = false;
    matchedReadingType.value = '';
    
    // Establecer el input activo en el primer campo disponible
    if (meaningAvailable.value) {
        activeInput.value = 'meaning';
    } else if (onReadingAvailable.value) {
        activeInput.value = 'on';
    } else if (kunReadingAvailable.value) {
        activeInput.value = 'kun';
    } else {
        activeInput.value = 'meaning'; // fallback
    }
};

// Función para alternar modo estudio
const toggleStudyMode = () => {
    playButtonClick();
    studyMode.value = !studyMode.value;
    if (studyMode.value) {
        showAnswer.value = true;
    } else {
        resetCard();
    }
};

// Función para obtener una pista
const getHint = () => {
    // Mostrar todas las respuestas como pista, pero parcialmente
    const meaning = props.CorrectMeaning || '';
    const onReading = props.CorrectReadingOn || '';
    const kunReading = props.CorrectReadingKun || '';
    
    const meaningHint = meaning ? meaning.substring(0, Math.ceil(meaning.length / 2)) + '...' : 'N/A';
    const onHint = onReading ? onReading.substring(0, Math.ceil(onReading.length / 2)) + '...' : 'N/A';
    const kunHint = kunReading ? kunReading.substring(0, Math.ceil(kunReading.length / 2)) + '...' : 'N/A';
    
    return `Significado: ${meaningHint}, On: ${onHint}, Kun: ${kunHint}`;
};

// Funciones para el teclado japonés
const handleKeyboardInput = (char) => {
    if (activeInput.value === 'meaning' && meaningAvailable.value) {
        userInputMeaning.value += char;
    } else if (activeInput.value === 'on' && onReadingAvailable.value) {
        userInputOn.value += char;
    } else if (activeInput.value === 'kun' && kunReadingAvailable.value) {
        userInputKun.value += char;
    }
};

// Mapeo para caracteres especiales
const dakutenMap = {
    'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
    'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
    'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
    'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ',
    'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ',
    'サ': 'ザ', 'シ': 'ジ', 'ス': 'ズ', 'セ': 'ゼ', 'ソ': 'ゾ',
    'タ': 'ダ', 'チ': 'ヂ', 'ツ': 'ヅ', 'テ': 'デ', 'ト': 'ド',
    'ハ': 'バ', 'ヒ': 'ビ', 'フ': 'ブ', 'ヘ': 'ベ', 'ホ': 'ボ',
};

const handakutenMap = {
    'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ',
    'ハ': 'パ', 'ヒ': 'ピ', 'フ': 'プ', 'ヘ': 'ペ', 'ホ': 'ポ',
};

// Función para manejar caracteres especiales
const handleSpecialChar = (type) => {
    let currentInput = '';
    let currentValue = '';
    
    if (activeInput.value === 'meaning' && meaningAvailable.value) {
        currentValue = userInputMeaning.value;
    } else if (activeInput.value === 'on' && onReadingAvailable.value) {
        currentValue = userInputOn.value;
    } else if (activeInput.value === 'kun' && kunReadingAvailable.value) {
        currentValue = userInputKun.value;
    }
    
    if (currentValue.length === 0) return;
    
    const lastChar = currentValue[currentValue.length - 1];
    let convertedChar = '';
    
    if (type === 'dakuten') {
        convertedChar = dakutenMap[lastChar];
    } else if (type === 'handakuten') {
        convertedChar = handakutenMap[lastChar];
    }
    
    // Si se encontró una conversión, reemplaza el último carácter
    if (convertedChar) {
        const newValue = currentValue.slice(0, -1) + convertedChar;
        
        if (activeInput.value === 'meaning' && meaningAvailable.value) {
            userInputMeaning.value = newValue;
        } else if (activeInput.value === 'on' && onReadingAvailable.value) {
            userInputOn.value = newValue;
        } else if (activeInput.value === 'kun' && kunReadingAvailable.value) {
            userInputKun.value = newValue;
        }
    }
};

// Alias para manejar la conversión de caracteres especiales desde el teclado japonés
const handleSpecialCharConversion = (type) => {
    handleSpecialChar(type);
};

// Función para limpiar el input activo cuando se presiona el botón "Limpiar" del teclado
const handleKeyboardClear = () => {
    if (activeInput.value === 'meaning' && meaningAvailable.value) {
        userInputMeaning.value = '';
    } else if (activeInput.value === 'on' && onReadingAvailable.value) {
        userInputOn.value = '';
    } else if (activeInput.value === 'kun' && kunReadingAvailable.value) {
        userInputKun.value = '';
    }
};


const setActiveInput = (inputType) => {
    // Solo establecer el input como activo si está disponible
    if (inputType === 'meaning' && meaningAvailable.value) {
        activeInput.value = inputType;
    } else if (inputType === 'on' && onReadingAvailable.value) {
        activeInput.value = inputType;
    } else if (inputType === 'kun' && kunReadingAvailable.value) {
        activeInput.value = inputType;
    }
};

const toggleKeyboard = () => {
    playButtonClick();
    showKeyboard.value = !showKeyboard.value;
};

const closeKeyboard = () => {
    showKeyboard.value = false;
};

// Prevenir scroll cuando el teclado está abierto
watch(showKeyboard, (newVal) => {
    if (newVal) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

onMounted(() => {
    // Animar la entrada de la card
    animateIn('.kanji-card', {
        y: [50, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 0.8,
        easing: 'ease-out'
    });
    
    // Inicializar cursor trail effect
    document.addEventListener('mousemove', createCursorTrail);
    updateTrails();
});

// Limpiar el overflow cuando el componente se desmonte
onUnmounted(() => {
    document.body.style.overflow = '';
    document.removeEventListener('mousemove', createCursorTrail);
});

</script>

<template>
  <div class="h-screen gradient-background p-4 overflow-hidden">
    
    <!-- Cursor Trail Effect -->
    <div class="fixed inset-0 pointer-events-none z-50">
      <div
        v-for="trail in cursorTrails"
        :key="trail.id"
        class="absolute rounded-full cursor-trail"
        :style="{
          left: trail.x + 'px',
          top: trail.y + 'px',
          opacity: trail.life * 0.8,
          transform: `translate(-50%, -50%) scale(${trail.life})`,
          background: `radial-gradient(circle, ${trail.color}80 0%, ${trail.color}40 50%, transparent 100%)`,
          width: trail.size + 'px',
          height: trail.size + 'px',
          filter: `blur(${trail.blur}px)`,
          boxShadow: `0 0 ${trail.size * 0.5}px ${trail.color}30`
        }"
      ></div>
    </div>
    
    <!-- Contenedor de botones superiores - todos a la izquierda -->
    <div class="fixed top-6 left-6 z-20 flex gap-3 items-center pointer-events-none">
      <!-- Botón de regreso -->
      <router-link 
        to="/" 
        class="btn-3d btn-3d-green-back pointer-events-auto"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </router-link>

      <!-- Botón de teclado japonés -->
      <button
        @click="toggleKeyboard"
        class="btn-3d btn-3d-green-floating gap-2 pointer-events-auto"
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
        class="btn-3d btn-3d-green-floating gap-2 pointer-events-auto"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        {{ studyMode ? 'Practicar' : 'Estudiar' }}
      </button>
    </div>

    <!-- Controles superiores (sonido y tema) -->
    <div class="fixed top-6 right-6 z-20 flex gap-3">
      <!-- Botón de tema -->
      <button
        @click="() => { toggleTheme(); playButtonClick(); }"
        class="btn-3d btn-3d-green-floating w-full h-full flex items-center justify-center pointer-events-auto"
        :title="`Tema: ${currentTheme} - Click para cambiar`"
      >
        <!-- Icono de sol (tema claro) -->
        <svg v-if="themeIcon === 'light'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <!-- Icono de luna (tema oscuro) -->
        <svg v-else-if="themeIcon === 'dark'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
        <!-- Icono de sistema -->
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      </button>
      
      <!-- Botón de sonido -->
      <button
        @click="() => { toggleSound(); playButtonClick(); }"
        class="btn-3d btn-3d-green-floating w-full h-full flex items-center justify-center pointer-events-auto"
        :title="soundEnabled ? 'Sonido activado - Click para desactivar' : 'Sonido desactivado - Click para activar'"
      >
        <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-music"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13h10v13" /><path d="M9 8h10" /></svg>
        <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
        </svg>
      </button>
    </div>

    <!-- Contenedor principal -->
    <div class="flex items-center justify-center h-full pt-20 transition-all duration-300">
      <!-- Layout dinámico: centrado cuando no hay teclado, lado a lado cuando sí -->
      <div :class="showKeyboard ? 'flex items-start gap-6 max-w-7xl mx-auto w-full h-auto px-4 justify-center overflow-y-auto' : 'flex justify-center w-full px-4'">
        
        <!-- Tarjeta principal del kanji -->
        <div class="kanji-card max-w-lg w-full" :class="showKeyboard ? 'flex-shrink-0' : ''">
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
              <!-- Significado (mostrar solo en modo estudio o cuando se muestre la respuesta) -->
              <div v-if="(studyMode || showAnswer) && meaningAvailable" class="bg-gradient-to-r from-platinum to-Marfil rounded-xl p-4 border border-MossGreen">
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
                <div v-if="onReadingAvailable" class="bg-gradient-to-r from-platinum to-Marfil rounded-xl p-4 border border-FernGreen">
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
                <div v-if="kunReadingAvailable" class="bg-gradient-to-r from-platinum to-Marfil rounded-xl p-4 border border-HunterGreen">
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

              <!-- Inputs para las respuestas (solo mostrar campos disponibles) -->
              <div v-if="!showAnswer" class="space-y-4">
                <div class="space-y-4">
                  <!-- Input de significado - solo si está disponible -->
                  <div v-if="meaningAvailable" class="space-y-2">
                    <label class="block text-sm font-medium text-grisTinta">
                      Significado
                    </label>
                    <input
                      v-model="userInputMeaning"
                      @focus="setActiveInput('meaning')"
                      @keyup.enter="validateAnswer"
                      type="text"
                      placeholder="Escribe el significado..."
                      class="error-shake w-full px-4 py-3 border border-timberWolf rounded-xl focus:ring-2 focus:ring-MossGreen focus:border-transparent outline-none transition-all duration-200 text-lg"
                      :class="{ 
                        'border-cardinal bg-coquelicot/10': isCorrect === false,
                        'ring-2 ring-MossGreen border-MossGreen': activeInput === 'meaning' 
                      }"
                    >
                  </div>
                  
                  <!-- Input de lectura On - solo si está disponible -->
                  <div v-if="onReadingAvailable" class="space-y-2">
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
                        'ring-2 ring-FernGreen border-FernGreen': activeInput === 'on' 
                      }"
                    >
                  </div>
                  
                  <!-- Input de lectura Kun - solo si está disponible -->
                  <div v-if="kunReadingAvailable" class="space-y-2">
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
                        'ring-2 ring-HunterGreen border-HunterGreen': activeInput === 'kun' 
                      }"
                    >
                  </div>
                </div>
                
                <button
                  @click="validateAnswer"
                  :disabled="isButtonDisabled"
                  class="w-full btn-3d btn-3d-green-primary"
                >
                  {{ buttonText }}
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
                  </div>
                </div>

                <button
                  @click="resetCard"
                  class="btn-3d btn-3d-green-light"
                >
                  Intentar de nuevo
                </button>
                
                <!-- Botones de navegación para subniveles -->
                <div v-if="isInSublevelMode" class="flex gap-2 mt-4">
                  <button
                    @click="goToPreviousKanjiAction"
                    :disabled="loadingNavigation"
                    class="btn-3d btn-3d-green-light flex-1 text-sm"
                    title="Kanji anterior"
                  >
                    ⮜ Anterior
                  </button>
                  <button
                    @click="goToRandomKanjiManual"
                    :disabled="loadingNavigation"
                    class="btn-3d btn-3d-green-medium flex-1 text-sm"
                    title="Kanji aleatorio"
                  >
                    🎲 Aleatorio
                  </button>
                  <button
                    @click="goToNextKanjiManual"
                    :disabled="loadingNavigation"
                    class="btn-3d btn-3d-green-light flex-1 text-sm"
                    title="Siguiente kanji"
                  >
                    Siguiente ⮞
                  </button>
                </div>
                
                <!-- Botones de navegación para otros niveles -->
                <div v-else-if="navigationData.kanjiList.length > 0" class="flex gap-2 mt-4">
                  <button
                    @click="goToRandomKanjiManual"
                    :disabled="loadingNavigation"
                    class="btn-3d btn-3d-green-medium flex-1 text-sm"
                    title="Kanji aleatorio"
                  >
                    🎲 Aleatorio
                  </button>
                  <button
                    @click="goToNextKanjiManual"
                    :disabled="loadingNavigation"
                    class="btn-3d btn-3d-green-light flex-1 text-sm"
                    title="Siguiente kanji"
                  >
                    Siguiente ⮞
                  </button>
                </div>
                
                <!-- Información del subnivel -->
                <div v-if="isInSublevelMode" class="mt-3 text-center">
                  <p class="text-xs" style="color: var(--theme-text-secondary);">
                    Subnivel {{ sublevelData.currentSublevel }} de {{ sublevelData.totalSublevels }} 
                    • Kanji {{ sublevelData.currentKanjiIndex + 1 }}
                  </p>
                </div>

                <!-- Información del nivel general -->
                <div v-else-if="navigationData.kanjiList.length > 0" class="mt-3 text-center">
                  <p class="text-xs" style="color: var(--theme-text-secondary);">
                    {{ navigationData.currentLevel.toUpperCase() }} 
                    • Kanji {{ navigationData.currentKanjiIndex + 1 }} de {{ navigationData.kanjiList.length }}
                  </p>
                </div>
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

        <!-- Teclado japonés al costado (solo cuando esté visible) -->
        <div v-if="showKeyboard" class="flex-shrink-0">
          <JapaneseKeyBoard 
            @text-input="handleKeyboardInput"
            @clear="handleKeyboardClear"
            @close="closeKeyboard"
            @apply-special="handleSpecialCharConversion"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<style>
/* Estilos para el cursor trail effect */
.cursor-trail {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: fade 1s forwards;
}

@keyframes fade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
