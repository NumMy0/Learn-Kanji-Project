## Nuevos Componentes Implementados

### JapaneseKeyBoard Component
- **Descripción**: Teclado japonés virtual que permite escribir en hiragana y katakana
- **Características**:
  - Alternar entre modo hiragana y katakana
  - Soporte para dakuten (゛) y handakuten (゜)
  - Integración completa con el sistema de botones 3D y colores verdes
  - Diseño responsive y moderno
- **Uso**: Integrado en la vista LearnKanji con botón flotante para mostrar/ocultar

### KeyButton Component
- **Descripción**: Componente de botón reutilizable para el teclado japonés
- **Props**: 
  - `char` (String, required): Carácter a mostrar
  - `buttonClass` (String, optional): Clases CSS adicionales
- **Características**: Utiliza el sistema de botones 3D con tipografía japonesa

## Nuevas Variantes de Botones 3D

### btn-3d-danger
- **Colores**: Cardinal, Firebrick, RojoCarmesi, Coquelicot
- **Uso**: Para acciones destructivas como "borrar" o "eliminar"
- **Estados**: Normal, hover, active con animaciones 3D