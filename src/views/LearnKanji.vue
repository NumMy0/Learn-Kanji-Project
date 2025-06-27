<script setup>
import { onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import kanjiCard from '../components/KanjiCard.vue';
import { useMotion } from '../composables/useMotion.js';
import { useKanji } from '../composables/useKanji.js';

const $route = useRoute();
const { animateLoading, animateIn } = useMotion();
const { loading, error, kanjiData, fetchKanjiByLevel } = useKanji();

const level = $route.params.level;

const loadKanjiData = async () => {
    try {
        await fetchKanjiByLevel(level);
        
        // Animar la entrada del componente cuando los datos estén listos
        await nextTick();
        animateIn('.kanji-container', {
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 0.6,
            easing: 'ease-out'
        });
    } catch (err) {
        console.error("Failed to load kanji:", err);
    }
};

onMounted(async () => {
    animateLoading(".loading-text");
    await loadKanjiData();
});

</script>

<template>
    <div 
        v-if="loading"
        class="flex flex-col items-center justify-center w-full h-screen"
        role="status"
        aria-live="polite"
    >
        <div class="text-center">
            <div class="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-Benibana mx-auto mb-4"></div>
            <p class="loading-text text-snow text-lg mb-2">Cargando kanji del nivel {{ level }}...</p>
        </div>
    </div>

    <div 
        v-else-if="error"
        class="flex flex-col items-center justify-center w-full h-screen text-center"
        role="alert"
        aria-live="assertive"
    >
        <div class="bg-coquelicot/10 border border-cardinal text-firebrick px-6 py-4 rounded-lg max-w-md">
            <h3 class="font-bold text-lg mb-2">Error al cargar el kanji</h3>
            <p class="mb-4">{{ error }}</p>
            <button 
                @click="loadKanjiData"
                class="bg-Benibana text-snow px-4 py-2 rounded hover:bg-cardinal transition duration-200"
                aria-label="Reintentar cargar kanji"
            >
                Reintentar
            </button>
        </div>
    </div>

    <div 
        v-else-if="kanjiData.Kanji"
        class="kanji-container"
    >
        <kanjiCard 
            :Kanji="kanjiData.Kanji"
            :CorrectMeaning="kanjiData.CorrectMeaning"
            :CorrectReading="kanjiData.CorrectReadingOn || kanjiData.CorrectReadingKun"
        />
    </div>

    <!-- Estado inicial mientras se monta el componente -->
    <div 
        v-else
        class="flex items-center justify-center w-full h-screen text-center"
    >
        <div class="text-center">
            <div class="animate-pulse">
                <div class="w-16 h-16 bg-GrisNeutro rounded-full mx-auto mb-4"></div>
                <p class="text-snow text-lg">Preparando el kanji...</p>
            </div>
        </div>
    </div>
</template>
