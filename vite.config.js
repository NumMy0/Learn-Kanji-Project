import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  build: {
    // Optimizaciones para producción
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Elimina console.log en producción
        drop_debugger: true,
      },
    },
    // Crear chunks para mejor performance
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue", "vue-router"],
          vendor: ["motion"],
        },
      },
    },
    // Generar source maps para depuración en producción
    sourcemap: true,
  },
  // Base URL para despliegue
  base: "/",
});
