<template>
  <v-app>
    <v-system-bar window style="-webkit-app-region: drag">
      <v-icon icon="mdi-lan-connect" class="mr-2"></v-icon>
      <span>茅山方术</span>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-minus" variant="text" @click="minimize" style="-webkit-app-region: no-drag"></v-btn>
      <v-btn icon="mdi-checkbox-blank-outline" variant="text" class="ml-2" @click="maximize"
        style="-webkit-app-region: no-drag"></v-btn>
      <v-btn icon="mdi-close" variant="text" class="ml-2" @click="close" style="-webkit-app-region: no-drag">
      </v-btn>
    </v-system-bar>

    <v-navigation-drawer app v-model="drawer" :rail="rail" permanent @click="rail = false">
      <!-- 菜单 -->
      <v-divider></v-divider>
      <v-list-item prepend-avatar="" title="">
        <template v-slot:append>
          <v-btn variant="text" :icon="menutoggleIcon" @click.stop="toggleMenu"></v-btn>
        </template>
      </v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-server" title="服务列表" value="myfiles" @click="serversList"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="设置" value="shared" @click="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
        <!--<ServerList></ServerList>-->
        <!--<v-bottom-sheet v-model="sheet">aaaa</v-bottom-sheet>-->
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

// 路由配置
const router = useRouter();
const route = useRoute();

// 菜单展开
const drawer = ref(true);
const rail = ref(true);
const menutoggleIcon = ref("mdi-chevron-right");

// 底部抽屉
// const sheet = ref<boolean>(true);

/**
 * 服务器列表
 */
function serversList() {
  console.log("MainForm serversList");
  router.push("/serverList");
}

/**
 * 服务器列表
 */
function setting() {
  console.log("MainForm setting");
  router.push("/setting");
}

/**
 * 开关抽屉
 */
function toggleMenu() {
  console.log(rail.value);
  // 根据抽屉的开关状态修改图标
  if (rail.value) {
    // 展开
    menutoggleIcon.value = "mdi-chevron-left";
  }
  else {
    // 关闭
    menutoggleIcon.value = "mdi-chevron-right";
  }

  rail.value = !rail.value;
  // return false;
}

/**
 * 最小化
 */
function minimize() {
  console.log("minimize");
  window.electronAPI.WindowsMinimize();
}

/**
 * 最大化
 */
function maximize() {
  console.log("minimize");
  window.electronAPI.WindowsMaximize();
}

/**
 * 关闭
 */
function close() {
  console.log("minimize");
  window.electronAPI.WindowsClose();
}
</script>

<style scoped>

</style>
