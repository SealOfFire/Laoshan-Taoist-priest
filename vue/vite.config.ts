import { fileURLToPath, URL } from "node:url";
//import commonjs from 'vite-plugin-commonjs'
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    vueJsx(),
    vuetify({ autoImport: true }),
  ],
  base: "./",
  build: {
    sourcemap: true,
    outDir: "../electron/pages",
    //outDir: "./dist",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});