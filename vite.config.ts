import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  server: {
    proxy: {
      "/novelapi": {
        target: "https://api.syosetu.com/novelapi/api",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/novelapi/, ""),
      },
    },
  },
});
