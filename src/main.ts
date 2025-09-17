import { createApp } from "vue";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "primeicons/primeicons.css";
import App from "./App.vue";
import Primevue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { VueQueryPlugin } from "@tanstack/vue-query";

const app = createApp(App);
app.use(Primevue, {
  theme: {
    preset: Aura,
  },
});
app.use(VueQueryPlugin);

app.mount("#app");
