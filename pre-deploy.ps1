# Script de precomprobación para el despliegue en Netlify (versión PowerShell)

Write-Host "🔍 Verificando proyecto antes del despliegue en Netlify..." -ForegroundColor Cyan

# Verificar dependencias instaladas
Write-Host "📦 Comprobando dependencias instaladas..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
  Write-Host "❌ No se encontró la carpeta node_modules. Ejecuta 'npm install' o 'pnpm install' primero." -ForegroundColor Red
  exit 1
}

# Asegurarse de que el proyecto compila
Write-Host "🏗️ Comprobando que el proyecto compila correctamente..." -ForegroundColor Yellow
try {
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Error en el proceso de construcción"
  }
}
catch {
  Write-Host "❌ La compilación falló. Arregla los errores antes de desplegar." -ForegroundColor Red
  exit 1
}

# Verificar que los archivos de redirección están en su lugar
Write-Host "🧭 Verificando archivos de redirección para SPA..." -ForegroundColor Yellow
if (-not (Test-Path "public\_redirects")) {
  Write-Host "⚠️ No se encontró el archivo public\_redirects. Las rutas de SPA podrían no funcionar correctamente." -ForegroundColor Yellow
}

if (-not (Test-Path "netlify.toml")) {
  Write-Host "⚠️ No se encontró el archivo netlify.toml. La configuración de Netlify podría no ser óptima." -ForegroundColor Yellow
}

# Todo parece estar en orden
Write-Host "✅ ¡Todo listo para el despliegue en Netlify!" -ForegroundColor Green
Write-Host "🚀 Puedes desplegar ejecutando 'netlify deploy' si tienes la CLI de Netlify instalada." -ForegroundColor Cyan
Write-Host "   O configura tu repositorio en la interfaz web de Netlify." -ForegroundColor Cyan
