# 🈲 Kanji Learning App

Una aplicación web moderna para aprender kanjis japoneses por niveles JLPT, construida con Vue 3, Vite y Motion One para animaciones fluidas.

## ✨ Características

- **📚 Niveles JLPT**: Soporte completo para todos los niveles JLPT (N5-N1)
- **🎯 Aprendizaje Interactivo**: Sistema de validación de respuestas en tiempo real
- **🎨 Animaciones Suaves**: Transiciones y animaciones usando Motion One
- **📱 Diseño Responsivo**: Optimizado para móviles, tablets y escritorio
- **♿ Accesibilidad**: Cumple con estándares de accesibilidad web
- **⚡ Performance**: Construcción optimizada con Vite
- **🎨 UI/UX Moderna**: Diseño limpio con Tailwind CSS

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]

# Navegar al directorio
cd japanese-page

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build
```

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   └── KanjiCard.vue       # Tarjeta de kanji con inputs interactivos
├── composables/             # Funciones composables de Vue
│   ├── useKanji.js         # Lógica de API y manejo de kanjis
│   ├── useMotion.js        # Utilidades de animación con Motion One
│   └── useTranslation.js   # Integración con LibreTranslate API
├── config/                  # Configuraciones del proyecto
│   └── translation.js      # Configuración de LibreTranslate
├── router/                  # Configuración de Vue Router
│   └── index.js            # Rutas de la aplicación
├── views/                   # Páginas principales
│   ├── WelcomePage.vue     # Página de selección de nivel JLPT
│   └── LearnKanji.vue      # Página de aprendizaje de kanji
├── App.vue                  # Componente raíz
├── main.js                  # Punto de entrada de la aplicación
└── style.css               # Estilos globales y variables CSS
```

## 🛠️ Tecnologías Utilizadas

- **Vue 3** - Framework progresivo de JavaScript
- **Vite** - Build tool rápido
- **Vue Router 4** - Enrutamiento oficial de Vue
- **Tailwind CSS** - Framework de CSS utilitario
- **Motion One** - Librería de animaciones modernas
- **Kanji API** - Datos de kanjis de kanjiapi.dev

## 🎯 Funcionalidades Principales

### Página de Bienvenida
- Selección de nivel JLPT
- Descripciones detalladas de cada nivel
- Navegación animada

### Página de Aprendizaje
- Obtención automática de kanjis por nivel
- Visualización de significado y lecturas (On/Kun)
- Sistema de validación de respuestas
- Estados de carga y error con feedback visual
- Botón de navegación siempre accesible

### Sistema de Validación
- Acepta lecturas On, Kun y significados en español
- Validación flexible (case-insensitive, partial matching)
- Feedback inmediato con animaciones

## 🔧 Composables Disponibles

### `useKanji()`
Maneja toda la lógica relacionada con la obtención y procesamiento de datos de kanjis.

### `useMotion()`
Proporciona utilidades para animaciones consistentes en toda la aplicación.

## 🎨 Personalización de Tema

El proyecto utiliza un sistema de variables CSS customizado en `src/style.css` con una paleta de colores japonesa inspirada.

## 📱 Responsividad

- Diseño mobile-first
- Breakpoints optimizados para tablet y desktop
- Tipografía y espaciado adaptativos

## ♿ Accesibilidad

- Navegación por teclado completa
- Atributos ARIA apropiados
- Estados de focus visibles
- Contraste de colores adecuado

## 🔄 API Utilizada

La aplicación consume datos de [Kanji API](https://kanjiapi.dev/):
- `GET /v1/kanji/{level}` - Lista de kanjis por nivel JLPT
- `GET /v1/kanji/{character}` - Detalles de un kanji específico

---

Hecho con ❤️ para estudiantes de japonés
