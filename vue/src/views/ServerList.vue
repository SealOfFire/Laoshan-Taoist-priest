<!--服务器列表-->
<template>
  <ServerAdd @addServerSuccess="readConfig"></ServerAdd>
  <v-divider></v-divider>
  <v-card>
    <v-tabs v-model="tab" background-color="teal-darken-3" show-arrows>
      <v-tab v-for="server in config.servers" :key="server.id" :value="server.id">
        <v-badge color="success" v-model="badgeValue[server.id]" overlap>
          {{ server.title }}
          &nbsp;
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-dots-vertical" color="white" size="x-small"></v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-title @click="refreshService">
                  <v-icon>mdi-refresh</v-icon>刷新
                </v-list-item-title>
                <v-list-item-title @click="ping">
                  <v-icon>mdi-cast-connected</v-icon>ping
                </v-list-item-title>
                <v-list-item-title @click="deleteTab">
                  <v-icon>mdi-delete</v-icon>删除服务
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          &nbsp;&nbsp;
          <v-divider></v-divider>
        </v-badge>
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item v-for="server in config.servers" :key="server.id" :value="server.id">
          <!-- {{ server.title }} -->
          <ServerInfoContainer :links="server.links" :serverId="server.id" :selectedLinkId="selectedLinkId"
            @switchChange="switchChange">
          </ServerInfoContainer>
          <ServerInfo></ServerInfo>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
  <DialogOKCancel v-model="showDialog" title="删除确认" message="是否删除选择的服务器" @ok="ok" @cancel="cancel">
  </DialogOKCancel>
  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </v-overlay>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DialogOKCancel from "../components/DialogOKCancel.vue";
import ServerInfo from "../components/ServerInfo.vue";
import ServerInfoContainer from "../components/ServerInfoContainer.vue";
import ServerAdd from "../components/ServerAdd.vue";

import type { IConfig } from "../common/interface/iconfig";
//import { Config } from "../../common/config"
//import { Link } from "../../common/link"

// 遮罩的参数
const absolute = ref<boolean>(true);
const overlay = ref<boolean>(false);

//const props: any;

// 弹出窗的引用
const showDialog = ref(false);
// const dialogRef = ref<InstanceType<typeof DialogOKCancel>>();

//interface Server {
//    id: string;
//    title: string;
//    url: string;
//    links: { [key: string]: Link };
//    badge: boolean
//}

// 测试数据
const demoData: IConfig = {
  configFileName: "", // 保存文件名
  servers: {
    "1": {
      id: "1",
      title: "title",
      url: "",
      links: {
        c: {
          id: "c",
          title: "c",
          protocol: "c",
          configFileName: "", // 配置文件名,
          url: "",
          delay: 0,
        },
        d: {
          id: "d",
          title: "d",
          protocol: "d",
          configFileName: "", // 配置文件名,
          url: "",
          delay: 0,
        },
      },
    },
  },
  Save: () => undefined,
  Load: () => undefined,
  AddServer: (title: string, url: string) => undefined,
  DeleteServer: (id: string) => undefined,
  RefreshService: (id: string) => undefined,
};

// 配置文件数据
const config = ref<IConfig>({
  configFileName: "", // 保存文件名
  servers: {
    "1": {
      id: "1",
      title: "title1",
      url: "",
      links: {
        a: {
          id: "a",
          title: "a",
          protocol: "a",
          configFileName: "", // 配置文件名,
          url: "",
          delay: 0,
        },
        b: {
          id: "b",
          title: "a",
          protocol: "a",
          configFileName: "", // 配置文件名,
          url: "",
          delay: 0,
        },
      },
    },
    "2": {
      id: "2",
      title: "title2",
      url: "",
      links: {
        c: {
          id: "c",
          title: "c",
          protocol: "c",
          configFileName: "", // 配置文件名,
          url: "",
          delay: 0,
        },
        d: {
          id: "d",
          title: "d",
          protocol: "d",
          configFileName: "", // 配置文件名,
          url: "",
          delay: 0,
        },
      },
    },
  },

  /**
  * 保存配置文件
  */
  Save: () => undefined,

  /**
   * 读取配置文件
   */
  Load: () => undefined,

  /**
   * 添加一个订阅服务器
   * @param title
   * @param url
   */
  AddServer: (title: string, url: string) => undefined,

  /**
   * 删除一个订阅服务器
   * @param id
   */
  DeleteServer: (id: string) => undefined,

  /**
   * 刷新订阅服务器
   * @param id
   */
  RefreshService: (id: string) => undefined,
});

// 选中的tab
const tab = ref<any>(null);

// 选中的linkid
const selectedLinkId = ref<string>("");
const selectedServerId = ref<string>("");

// tabs中是否有链接
const connected = ref(false);
const badgeValue = ref<{ [key: string]: boolean }>({ sample: false });

// onBeforeMount(readConfig);
onMounted(readConfig);

// 接口延迟结果
if (window.electronAPI) {
  window.electronAPI.RefreshDelay(RefreshDelayCallback);

  // 后台修改链接状态时,设置前台的显示
  window.electronAPI.RefreshConnect((_event: any, serverId: string, linkId: string) => {
    console.log("RefreshConnect", serverId, linkId);
    changeBadgeValue();
    selectedLinkId.value = linkId;
    badgeValue.value[serverId] = true;
  });

  // 后台修改链接状态时,设置前台的显示
  window.electronAPI.RefreshDisconnect((_event: any) => {
    console.log("RefreshDisconnect");
    changeBadgeValue();
    selectedLinkId.value = "";
  });
}

/**
 * 刷新延迟数值
 */
function RefreshDelayCallback(
  _event: any,
  serverId: string,
  linkId: string,
  result: string
): void {
  console.log("ping result:", _event, serverId, linkId, result);
  // 关闭旋转动画
  config.value.servers[serverId].links[linkId].delay = result;
}

/**
 * 读取配置文件
 */
async function readConfig() {
  console.log("ServerList readConfig");

  try {
    // 打开遮罩，执行结束后关闭遮罩
    overlay.value = true;

    if (window.electronAPI) {
      const result = await window.electronAPI.LoadConfig();
      config.value = result;

      // TODO 新建时选中最后一项，初始化时选中第一项
      // 获取字典的最后一项，就是新添加的服务，设置选中这个项目
      const keys = Object.keys(config.value.servers);
      tab.value = keys[keys.length - 1];

      // 读取链接打开的状态
      const connectStatus = await window.electronAPI.GetConnectStatus();
      console.log("ServerList readConfig connectStatus:", connectStatus);

      // 更新链接状态
      changeBadgeValue();

      // 设置选中标签
      if (connectStatus.linkId !== "" && connectStatus.serverId !== "") {
        selectedLinkId.value = connectStatus.linkId;
        badgeValue.value[connectStatus.serverId] = true;
      }

      // 配置读取完成
      console.log("ServerList readConfig:", config);
      console.log("ServerList readConfig:", result);
      console.log("ServerList readConfig:", tab.value);
    } else {
      // 测试数据
      // config.value = demoData;
    }

    // 更新链接状态
    //changeBadgeValue();
  } catch (err) {
    console.log("ServerList err:", err);
  } finally {
    overlay.value = false;
  }
}

/** 删除Tab */
function deleteTab() {
  console.log("ServerList ok:", tab.value);

  // 弹出删除确认框
  showDialog.value = true;
}

/** 确认删除 */
async function ok() {
  // TODO 删除前关闭链接
  // 执行删除数据
  // 重新加载数据
  console.log("ServerList ok:", tab.value);
  if (window.electronAPI) {
    config.value = await window.electronAPI.DeleteServer(tab.value);
  }

  // 关闭弹出窗
  showDialog.value = false;
  console.log("ok");
}

/** 取消删除 */
function cancel() {
  showDialog.value = false;
  console.log("cancel");
}

/** 刷新服务 */
async function refreshService() {
  // TODO 刷新前关闭链接
  console.log("ServerList refreshService", tab.value);
  if (window.electronAPI) {
    config.value = await window.electronAPI.RefreshServer(tab.value);
  }
}

/** ping */
async function ping() {
  console.log("ServerList ping", tab.value);
  // 开启旋转动画

  if (window.electronAPI) {
    await window.electronAPI.Ping(tab.value);
  }
  //
  //// 接口延迟结果
  //window.electronAPI.RefreshDelay((_event: any, serverId: string, linkId: string, result: string) => {
  //    console.log("ping result:", result)
  //    config.value.servers[serverId].links[linkId].delay = result;
  //});

}

/**
 * 开关切换
 * @param value
 */
function switchChange(on: boolean, serverId: string, linkId: string) {
  console.log("ServerList switchChange", on, serverId, linkId);

  for (const key in badgeValue.value) {
    badgeValue.value[key] = false;
  }

  if (on) {
    // 打开链接
    // 设置打开标记
    selectedServerId.value = serverId;
    badgeValue.value[serverId] = true;
  } else {
    // 关闭链接
    selectedServerId.value = "";
  }

  // 关闭其他tab页中选中的项目
  // console.log("ServerList switchChange", selectedLinkId);
  selectedLinkId.value = linkId;
  // console.log("ServerList switchChange linkId", selectedLinkId);
}

/**
 * 更新联机的开关状态
 * 再选中的tab上显示原点
 */
function changeBadgeValue() {
  //Object.keys(config.value.servers).forEach(key => {
  //});

  // 所有参数初始化成false
  // badgeValue.value = {};
  for (const key in config?.value.servers) {
    badgeValue.value[key] = false;
  }
}
</script>

<style scoped>

</style>
