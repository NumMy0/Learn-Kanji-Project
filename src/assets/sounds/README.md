# Archivos de sonido para la aplicación de Kanji

Este directorio contiene los archivos de sonido utilizados en la aplicación:

## Archivos necesarios:

- `button-click.mp3` - Sonido para clicks de botones
- `correct-answer.mp3` - Sonido para respuestas correctas  
- `incorrect-answer.mp3` - Sonido para respuestas incorrectas
- `keyboard-key.mp3` - Sonido para teclas del teclado japonés

## Fallback

Si estos archivos no están disponibles, la aplicación utilizará sonidos sintéticos generados con Web Audio API definidos en `synthetic.js`.

## Formato recomendado

- Formato: MP3
- Duración: 0.1-0.5 segundos
- Volumen: Normalizado
- Tamaño: <50KB por archivo
