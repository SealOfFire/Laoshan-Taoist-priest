<template>
  <br />
  <v-form ref="formRef">
    <v-row>
      <v-col cols="10">
        <v-text-field v-model="setting.home" label="home路径" variant="outlined" :rules="required" persistent-hint
          required />
      </v-col>
      <v-col cols="2">
        <v-btn icon="mdi-folder-open" @click="openFile"></v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select v-model="setting.protocol" :items="items" label="协议" variant="outlined" item-title="title"
          item-value="value">
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field v-model="setting.port" label="端口号" variant="outlined" :rules="required" placeholder="1080"
          persistent-hint required />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn color="primary" @click="save"> 保存 </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { IVPNSetting } from "../../../common/interface/ivpn_setting";

interface Props {
  //
  setting: IVPNSetting;
  // home参数
  //homePath: string;
  // 协议 选项
  items: [];
  // 协议
  //protocol: string;
  // 端口号
  //port: number;
}

// 从外面传入的参数
const {
  setting,
  /*
  homePath = "",
  items = [
    { title: "http", value: "http" },
    { title: "socks", value: "socks" },
  ],
  protocol = "http",
  port = 1080
  */
} = defineProps<Props>();

// 触发事件
const emit = defineEmits(["save"]);

//
const formRef = ref();

// 输入验证规则
const required = [(value: string) => !!value || "不能为空."];
// TODO 端口的数值验证0-65535

/**
 * 保存
 */
async function save() {
  console.log("setting save", setting);
  // emit("save", homePath, protocol, port);
  const validResult = await formRef.value?.validate();
  if (validResult.valid) {
    // 通过验证
    console.log("通过验证");
    //
    emit("save", setting);
  } else {
    // 没通过验证
    console.log("没通过验证");
  }
}

/**
 * 打开文件选择窗口
 */
async function openFile() {
  console.log("setting openFile");
  const filePath = await window.electronAPI.openFile(setting.home);
  if (filePath != undefined) {
    console.log(filePath);
    //homePath.value = filePath;
    setting.home = filePath;
  }
}
</script>
<style scoped>

</style>
