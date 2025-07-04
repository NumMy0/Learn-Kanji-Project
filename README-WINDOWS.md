# Instrucciones de Despliegue para Windows

Este documento contiene instrucciones específicas para desplegar la aplicación de kanji desde un entorno Windows.

## Preparación Pre-Despliegue

En Windows, tienes varias opciones para ejecutar los scripts de pre-despliegue:

### Opción 1: Usar el comando pre-deploy estándar

```powershell
npm run pre-deploy
```

### Opción 2: Usar el script CMD específico para Windows

```powershell
npm run pre-deploy:win
```

o directamente:

```powershell
pre-deploy.cmd
```

### Opción 3: Usar el script PowerShell (recomendado)

```powershell
npm run pre-deploy:ps
```

o directamente:

```powershell
powershell -ExecutionPolicy Bypass -File ./pre-deploy.ps1
```

## Despliegue en Netlify

Para desplegar en Netlify desde Windows:

### 1. Instalar la CLI de Netlify

```powershell
npm install netlify-cli -g
```

### 2. Iniciar sesión en Netlify

```powershell
netlify login
```

### 3. Construir y desplegar

```powershell
npm run build
netlify deploy --prod
```

o usar el script combinado:

```powershell
npm run deploy
```

### 4. Configurar sitio en Netlify

Si es la primera vez que despliegas, la CLI te guiará para:
- Crear un nuevo sitio o seleccionar uno existente
- Especificar la carpeta de publicación (usa `dist`)
- Confirmar el despliegue

## Solución de problemas comunes en Windows

### Error: "No se reconoce como un comando interno o externo"

Si ves este error al ejecutar scripts, asegúrate de que estás en la carpeta raíz del proyecto y que el script tiene los permisos adecuados.

### Error de Permisos en PowerShell

Si PowerShell muestra errores relacionados con la política de ejecución, usa:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Y luego ejecuta el script.

### Problemas de rutas en Windows

Windows usa barras invertidas (`\`) en las rutas mientras que muchas herramientas web esperan barras normales (`/`). Los scripts están adaptados para manejar esto, pero ten esto en cuenta si encuentras problemas.

## Más información

Para instrucciones más detalladas sobre el despliegue en Netlify, consulta el archivo `README-DEPLOY.md` en la raíz del proyecto.
