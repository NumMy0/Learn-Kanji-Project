import WelcomePage from "@/views/WelcomePage.vue";
import LearnKanji from "@/views/LearnKanji.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "Welcome", component: WelcomePage },
  {
    path: "/kanji/:level",
    name: "LearnKanji",
    component: LearnKanji,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
