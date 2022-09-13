<!-- 服务器信息的容器 -->
<!-- 先用表格，以后也许会换成别的样式 -->
<template>
  <v-table>
    <thead>
      <tr>
        <th>链接</th>
        <th style="display:none">id</th>
        <th>标题</th>
        <th>协议</th>
        <th>延迟</th>
        <th>本地协议</th>
        <th>本地端口</th>
        <th>编辑</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="link in links" :key="link.id">
        <td>
          <v-switch v-model="selectedLinkId" color="success" :value="link.id" @change="change" hide-details>
          </v-switch>
        </td>
        <td style="display:none">{{ link.id }}</td>
        <td>{{ link.title }}</td>
        <td>{{ link.protocol }}</td>
        <td>{{ link.delay }}</td>
        <td></td>
        <td></td>
        <td>
          <v-btn size="x-small">编辑</v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { ILinks } from "../common/interface/ilink";


interface Props {
  links: ILinks;
  serverId: string;
  selectedLinkId: string | boolean;
}

const { links, serverId, selectedLinkId } = defineProps<Props>();
watchEffect(() => {
  console.log("watchEffect", links, serverId, selectedLinkId);
});

/*
const props = defineProps<{
  links: ILinks;
  serverId: string;
  selectedLinkId: string | boolean;
}>();
*/
const emit = defineEmits(["switchChange"]);

//const selectedId = ref<string>();
//const selectedLinkId = ref<string | boolean>(props.selectedLinkId);

if (window.electronAPI) {
  // 接口vpn的控制台输出
  window.electronAPI.VPNOutput((_event: any, data: string) => {
    console.log(data);
  });
}

/** 开关变化 */
async function change() {
  //console.log("ServerInfoContainer change", props.selectedLinkId);
  //console.log("ServerInfoContainer change", props, selectedLinkId);
  //console.log("ServerInfoContainer change", props);
  console.log("ServerInfoContainer change", serverId, selectedLinkId);

  // emit('switchChange', props.serverId, props.selectedLinkId);

  //if (selectedLinkId.value == false) {
  //if (props.selectedLinkId) {
  if (selectedLinkId) {
    console.log("链接或者切换vpn");
    // TODO 链接或者切换vpn
    //emit("switchChange", true, props.serverId, selectedLinkId.value);
    //emit("switchChange", true, props.serverId, props.selectedLinkId);
    emit("switchChange", true, serverId, selectedLinkId);

    if (window.electronAPI) {
      // 开启vpn链接
      await window.electronAPI.Connect(serverId, `${selectedLinkId}`);
      //await window.electronAPI.Connect(props.serverId, props.selectedLinkId.toString());
    }
  } else {
    console.log(" 关闭vpn");
    // TODO 关闭vpn
    //emit("switchChange", false, props.serverId, `${selectedLinkId.value}`);
    //emit("switchChange", false, props.serverId, `${props.selectedLinkId}`);
    emit("switchChange", false, serverId, `${selectedLinkId}`);
    if (window.electronAPI) {
      // 断开vpn链接
      await window.electronAPI.Disconnect();
    }
  }
}
</script>

<style scoped>

</style>
