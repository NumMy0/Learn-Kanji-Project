// Archivo temporal con sonidos sintéticos usando Web Audio API
// Este archivo será reemplazado por archivos MP3 reales

// Función para generar un tono sintético
function generateTone(frequency, duration, volume = 0.3) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    volume,
    audioContext.currentTime + 0.01
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Función para generar acordes (respuesta correcta)
function generateChord(frequencies, duration, volume = 0.3) {
  frequencies.forEach((freq) => {
    generateTone(freq, duration, volume / frequencies.length);
  });
}

// Sonidos sintéticos de ejemplo
export const syntheticSounds = {
  buttonClick: () => generateTone(800, 0.1, 0.2),
  correctAnswer: () => generateChord([523.25, 659.25, 783.99], 0.5, 0.4), // Do, Mi, Sol
  incorrectAnswer: () => {
    generateTone(200, 0.15, 0.3);
    setTimeout(() => generateTone(150, 0.15, 0.3), 100);
  },
  keyboardKey: () => generateTone(1000, 0.05, 0.15),
};
