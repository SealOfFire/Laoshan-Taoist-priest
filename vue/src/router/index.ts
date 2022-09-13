import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
//import HomeView from "../views/HomeView.vue";
//import MainForm from "../views/MainForm.vue";
import ServerList from "../views/ServerList.vue";
import Setting from "../views/Setting.vue";

const router = createRouter({
  history: createWebHashHistory(),
  //history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      //name: "home",
      component: ServerList,
    },
    {
      path: "/serverList",
      //name: "ServerList",
      component: ServerList,
    },
    {
      path: "/setting",
      //name: "Setting",
      component: Setting,
    },
    /*
    {
      path: "/about",
      //name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    */
  ],
});

export default router;
