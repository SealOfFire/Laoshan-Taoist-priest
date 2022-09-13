import { createApp } from "vue";
// import App from "./App.vue";
import MainForm from "./MainForm.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
/*
import { createRouter, createWebHashHistory } from "vue-router";
import ServerList from "./views/ServerList.vue";
import Setting from "./views/Setting.vue";

const routes = [
  {
    path: "/",
    component: ServerList,
  },
  {
    path: "/serverList",
    component: ServerList,
  },
  {
    path: "/setting",
    component: Setting,
  }
]

const router2 = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})
*/

loadFonts();

createApp(MainForm)
  .use(router)
  .use(vuetify)
  .mount('#app');
