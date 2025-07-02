import { ref, onMounted, onUnmounted } from "vue";
import { useTheme } from "./useTheme.js";

export function useCursorTrail() {
  const { isDarkMode } = useTheme();

  const cursorTrails = ref([]);
  const trailId = ref(0);
  const lastMousePosition = ref({ x: 0, y: 0 });
  const mouseSpeed = ref(0);

  // Colores para los diferentes temas
  const lightColors = [
    "#90A955", // MossGreen
    "#4F772D", // FernGreen
    "#7FB069", // Asparagus
    "#56876D", // Viridian
  ];

  const darkColors = [
    "#4F98CD", // ColumbianBlue
    "#2E5BBA", // SapphireBlue
    "#15457B", // PrussianBlue
    "#1E3A5F", // SpaceCadet
  ];

  const createCursorTrail = (e) => {
    // Calcular velocidad del mouse
    const deltaX = e.clientX - lastMousePosition.value.x;
    const deltaY = e.clientY - lastMousePosition.value.y;
    mouseSpeed.value = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    lastMousePosition.value = { x: e.clientX, y: e.clientY };

    // Solo crear trail si el mouse se está moviendo
    if (mouseSpeed.value > 2) {
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
        blur: Math.random() * 2 + 1,
      };

      cursorTrails.value.push(trail);

      // Limitar el número de trails basado en la velocidad
      const maxTrails = Math.min(15, 8 + Math.floor(mouseSpeed.value * 0.2));
      if (cursorTrails.value.length > maxTrails) {
        cursorTrails.value.shift();
      }
    }
  };

  const updateTrails = () => {
    cursorTrails.value = cursorTrails.value.filter((trail) => {
      trail.life -= 0.08;
      return trail.life > 0;
    });
    requestAnimationFrame(updateTrails);
  };

  const initCursorTrail = () => {
    document.addEventListener("mousemove", createCursorTrail);
    updateTrails();
  };

  const cleanupCursorTrail = () => {
    document.removeEventListener("mousemove", createCursorTrail);
  };

  return {
    cursorTrails,
    initCursorTrail,
    cleanupCursorTrail,
  };
}
