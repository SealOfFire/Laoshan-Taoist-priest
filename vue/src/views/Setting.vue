<!--设置页面-->
<template>
  <v-card>
    <v-tabs v-model="tab" background-color="primary">
      <v-tab value="v2ray">v2ray</v-tab>
      <v-tab value="ssr">ssr</v-tab>
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="v2ray">
          <V2RaySetting></V2RaySetting>
        </v-window-item>
        <v-window-item value="ssr">
          <SSRSetting></SSRSetting>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SSRSetting from "./setting/ssr.vue";
import V2RaySetting from "./setting/v2ray.vue";

//
const tab = ref(null);
</script>

<style scoped>

</style>
