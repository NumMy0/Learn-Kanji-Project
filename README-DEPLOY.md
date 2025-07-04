# Despliegue en Netlify

Este documento contiene instrucciones para desplegar la aplicación de aprendizaje de kanji en Netlify.

## Opciones de Despliegue

### Opción 1: Despliegue desde Git

1. Crea una cuenta en [Netlify](https://app.netlify.com/signup)
2. Haz clic en "New site from Git"
3. Selecciona tu proveedor de repositorio (GitHub, GitLab, etc.)
4. Autoriza a Netlify para acceder a tus repositorios
5. Selecciona el repositorio de este proyecto
6. Configura las opciones de despliegue:
   - Rama a desplegar: `main` (o la que uses)
   - Comando de construcción: `npm run build` o `pnpm build`
   - Directorio de publicación: `dist`
7. Haz clic en "Deploy site"

### Opción 2: Despliegue manual

1. Instala la CLI de Netlify:
   ```
   npm install netlify-cli -g
   ```

2. Inicia sesión en tu cuenta de Netlify:
   ```
   netlify login
   ```

3. Construye el proyecto:
   ```
   npm run build
   ```
   o
   ```
   pnpm build
   ```

4. Despliega en Netlify:
   ```
   netlify deploy --prod
   ```
   
5. Sigue las instrucciones para completar el despliegue.

## Verificación Pre-Despliegue

Puedes ejecutar la verificación pre-despliegue con:

```
npm run pre-deploy
```

o

```
pnpm pre-deploy
```

## Configuración Personalizada

La configuración de Netlify está definida en:

- `netlify.toml` - Configuración principal de Netlify
- `public/_redirects` - Configuración de redirecciones para SPA

### Variables de Entorno

Si necesitas configurar variables de entorno, puedes hacerlo en la interfaz de Netlify:

1. Ve a tu sitio en Netlify
2. Navega a Site settings > Build & deploy > Environment
3. Haz clic en "Edit variables" y agrega las variables necesarias

## Solución de Problemas

### Error 404 en rutas de SPA

Si experimentas errores 404 al navegar directamente a rutas como `/kanji`:

1. Asegúrate de que el archivo `public/_redirects` existe y contiene:
   ```
   /* /index.html 200
   ```

2. Verifica que el archivo `netlify.toml` tiene la configuración de redirección correcta.

### Problemas con la API

Si hay problemas de CORS con la API de Kanji:

1. Asegúrate de que las solicitudes a la API se están realizando correctamente
2. Considera implementar un proxy si es necesario

## Dominios Personalizados

Para configurar un dominio personalizado:

1. Ve a tu sitio en Netlify
2. Navega a Site settings > Domain management
3. Haz clic en "Add custom domain"
4. Sigue las instrucciones para configurar tu dominio
