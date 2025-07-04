@echo off
REM Script de precomprobación simplificado para el despliegue en Netlify (versión Windows)

echo [INFO] Verificando proyecto antes del despliegue en Netlify...

REM Verificar dependencias instaladas
echo [INFO] Comprobando dependencias instaladas...
if not exist "node_modules" (
  echo [ERROR] No se encontro la carpeta node_modules. Ejecuta 'npm install' o 'pnpm install' primero.
  exit /b 1
)

REM Asegurarse de que el proyecto compila
echo [INFO] Comprobando que el proyecto compila correctamente...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo [ERROR] La compilacion fallo. Arregla los errores antes de desplegar.
  exit /b 1
)

REM Verificar que los archivos de redirección están en su lugar
echo [INFO] Verificando archivos de redireccion para SPA...
if not exist "public\_redirects" (
  echo [WARN] No se encontro el archivo public\_redirects. Las rutas de SPA podrian no funcionar correctamente.
)

if not exist "netlify.toml" (
  echo [WARN] No se encontro el archivo netlify.toml. La configuracion de Netlify podria no ser optima.
)

REM Todo parece estar en orden
echo [SUCCESS] Todo listo para el despliegue en Netlify!
echo [INFO] Puedes desplegar ejecutando 'netlify deploy' si tienes la CLI de Netlify instalada.
echo [INFO] O configura tu repositorio en la interfaz web de Netlify.

pause
