#!/bin/sh

# Script de precomprobación para el despliegue en Netlify

echo "🔍 Verificando proyecto antes del despliegue en Netlify..."

# Verificar dependencias instaladas
echo "📦 Comprobando dependencias instaladas..."
if [ ! -d "node_modules" ]; then
  echo "❌ No se encontró la carpeta node_modules. Ejecuta 'npm install' o 'pnpm install' primero."
  exit 1
fi

# Asegurarse de que el proyecto compila
echo "🏗️ Comprobando que el proyecto compila correctamente..."
npm run build || { echo "❌ La compilación falló. Arregla los errores antes de desplegar."; exit 1; }

# Verificar que los archivos de redirección están en su lugar
echo "🧭 Verificando archivos de redirección para SPA..."
if [ ! -f "public/_redirects" ]; then
  echo "⚠️ No se encontró el archivo public/_redirects. Las rutas de SPA podrían no funcionar correctamente."
fi

if [ ! -f "netlify.toml" ]; then
  echo "⚠️ No se encontró el archivo netlify.toml. La configuración de Netlify podría no ser óptima."
fi

# Todo parece estar en orden
echo "✅ ¡Todo listo para el despliegue en Netlify!"
echo "🚀 Puedes desplegar ejecutando 'netlify deploy' si tienes la CLI de Netlify instalada."
echo "   O configura tu repositorio en la interfaz web de Netlify."
