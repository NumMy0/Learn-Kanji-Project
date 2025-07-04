@echo off
REM Script de precomprobación para el despliegue en Netlify (versión Windows)

echo 🔍 Verificando proyecto antes del despliegue en Netlify...

REM Verificar dependencias instaladas
echo 📦 Comprobando dependencias instaladas...
if not exist "node_modules" (
  echo ❌ No se encontró la carpeta node_modules. Ejecuta 'npm install' o 'pnpm install' primero.
  exit /b 1
)

REM Asegurarse de que el proyecto compila
echo 🏗️ Comprobando que el proyecto compila correctamente...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo ❌ La compilación falló. Arregla los errores antes de desplegar.
  exit /b 1
)

REM Verificar que los archivos de redirección están en su lugar
echo 🧭 Verificando archivos de redirección para SPA...
if not exist "public\_redirects" (
  echo ⚠️ No se encontró el archivo public\_redirects. Las rutas de SPA podrían no funcionar correctamente.
)

if not exist "netlify.toml" (
  echo ⚠️ No se encontró el archivo netlify.toml. La configuración de Netlify podría no ser óptima.
)

REM Todo parece estar en orden
echo ✅ ¡Todo listo para el despliegue en Netlify!
echo 🚀 Puedes desplegar ejecutando 'netlify deploy' si tienes la CLI de Netlify instalada.
echo    O configura tu repositorio en la interfaz web de Netlify.
