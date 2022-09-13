<!-- 添加服务器 -->
<template>
  <v-btn icon="mdi-server-plus" @click="addServer"></v-btn>
  <v-dialog v-model="show" persistent>
    <v-card>
      <v-card-title>
        添加服务器链接
      </v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.native.prevent>
          <v-text-field label="标题" variant="outlined" persistent-hint ref="titleRef" v-model="title"
            :rules="[rules.required]" style="width:400px" @keyup.enter="ok">
          </v-text-field>
          <v-text-field label="服务器地址" variant="outlined" placeholder="http://sample.com" hint="http://sample.com"
            persistent-hint ref="urlRef" v-model="url" :rules="[rules.required, rules.email]" style="width:400px"
            @keyup.enter="ok">
          </v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="cancel">
          取消
        </v-btn>
        <v-btn color="green darken-1" text @click="ok">
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-overlay :model-value="overlay" class="align-center justify-center">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </v-overlay>
  <v-snackbar v-model="snackbar" :timeout="2000" :color="color">
    <v-icon>mdi-domain</v-icon>
    {{ message }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
// import { Config } from "../../common/config"
import { ref } from "vue";
// import type { Forms } from 'vuetify'

// 弹出窗是否显示
const show = ref(false);

// 输入的url
const title = ref<string>("");
const url = ref<string>("");

// 遮罩的参数
const absolute = ref<boolean>(true);
const overlay = ref<boolean>(false);

// 弹出消息的参数
const message = ref<string>("");
const snackbar = ref<boolean>(false);

const formRef = ref();
const titleRef = ref();
const urlRef = ref();

// 提示框的颜色
const color = ref<string>("success");

// 添加成功后，通知父组件
const emit = defineEmits(["addServerSuccess"]);

// 输入验证规则
const rules = {
  required: (value: string) => !!value || "不能为空.",

  email: (value: string) => {
    const pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    return pattern.test(value) || "格式不是有效的url";
  }
};

/**
* 添加一个服务器
*/
function addServer() {
  console.log("addServer");

  // 初始化弹出窗数据
  title.value = "";
  url.value = "";
  show.value = true
}

/**
 *  取消
 */
function cancel() {
  // 关闭弹出窗
  show.value = false;
}

/**
 * 确定
 */
async function ok() {
  const validResult = await formRef.value?.validate();
  if (validResult.valid) {
    // 通过验证
    // 关闭窗口
    show.value = false;

    // 打开遮罩，执行结束后关闭遮罩
    overlay.value = true;

    try {
      // 调用远程方法
      const config = await window.electronAPI.AddServer(title.value, url.value);

      // 添加服务器成功
      console.log("添加服务器成功");

      // 成功提示
      snackbar.value = true;
      color.value = "success";
      message.value = "执行electronAPI成功";

      // 添加成功后，通知父组件
      emit("addServerSuccess");
    } catch (err) {
      // 添加服务器失败
      // 失败提示
      console.error(err);
      snackbar.value = true;
      color.value = "red";
      message.value = "执行electronAPI出错";
    } finally {
      console.log("关闭遮挡");
      overlay.value = false;
    }
  } else {
    // 未通过验证
    console.log("err:", validResult.errors);
    // 失败提示
    snackbar.value = true;
    color.value = "red";
    message.value = "执行electronAPI出错";
  }
}
</script>
