<template>
  <Setting :setting="setting" :items="items" @save="save" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { IVPNSetting } from "../../common/interface/ivpn_setting";
import Setting from "../../components/setting.vue";

// 协议
const items = [
  { title: "socks", value: "socks" },
  { title: "http", value: "http" },
];

let param: IVPNSetting = {
  home: "", // vpn程序的路径
  protocol: "socks", // 协议
  port: 1080, // 端口号
  settingFileName: "", // 保存文件名
  excuteFileName: "", // 可执行文件名
  //
  Save: () => undefined,
  Load: () => undefined,
  GetFullFileName: () => undefined,
  Connect: () => undefined,
}

const setting = ref<IVPNSetting>(param);

onMounted(readConfig);
async function readConfig() {
  console.log("ssr readConfig");

  //console.log("Setting readConfig", window.electronAPI);
  if (window.electronAPI) {
    param = await window.electronAPI.LoadV2RaySetting();
    setting.value = param;
    console.log("ssr readConfig electronAPI", param);
    console.log("ssr readConfig electronAPI", setting);
  }
}

/**
 * 保存配置信息
 * @param settingValue
 */
async function save(settingValue: IVPNSetting): Promise<void> {
  console.log("ssr save", settingValue);
  //  console.log("ssr save", setting);
  if (window.electronAPI) {
    console.log("ssr save", setting);

    param.home = setting.value.home;
    param.protocol = setting.value.protocol;
    param.port = setting.value.port;

    await window.electronAPI.SaveVPNSetting(param);
  }
  console.log("ssr save end");
}
</script>

<style scoped>

</style>
