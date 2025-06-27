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
});
