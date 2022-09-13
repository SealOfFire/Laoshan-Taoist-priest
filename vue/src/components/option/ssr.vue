<!--ShadowsocksR的设置页面-->
<template>
    <v-form ref="formRef">
        <v-text-field v-model="v2rayHome" :rules="required" label="v2ray home路径" variant="outlined" persistent-hint
            required></v-text-field>
        <v-text-field v-model="ssrHome" :rules="required" label="SSR home路径" variant="outlined" persistent-hint
            required></v-text-field>
        <v-btn @click="save">
            保存
        </v-btn>
    </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IVPNSetting } from "../../interface/ivpn_setting";
//import { Setting as SSRSetting } from "../../ssr/setting";
//import { Setting as V2RaySetting } from "../../v2ray/setting";
//import { Manager as ssrManager } from "../../ssr/manager";
//import { Manager as v2rayManager } from "../../v2ray/manager";

//
const v2rayHome = ref<string>("");
const ssrHome = ref<string>("");
const formRef = ref();

// 输入验证规则
const required = [(value: string) => !!value || '不能为空.'];

//
let v2raySetting: IVPNSetting = {
    home: "", // vpn程序的路径
    settingFileName: "", // 保存文件名
    excuteFileName: "", // 可执行文件名
    //
    Save: () => undefined,
    Load: () => undefined,
    GetFullFileName: () => "",
    Connect: () => undefined,
};
let ssrSetting: IVPNSetting = {
    home: "", // vpn程序的路径
    settingFileName: "", // 保存文件名
    excuteFileName: "", // 可执行文件名
    //
    Save: () => undefined,
    Load: () => undefined,
    GetFullFileName: () => "",
    Connect: () => undefined,
}

onMounted(readConfig);

/**
 *
 */
async function readConfig() {
    console.log("Setting readConfig");

    v2raySetting = await window.electronAPI.LoadV2RaySetting();
    ssrSetting = await window.electronAPI.LoadSSRSetting();

    console.log(v2raySetting)
    console.log(ssrSetting)

    v2rayHome.value = ssrSetting.home;
    ssrHome.value = v2raySetting.home;
}

/**
 * 保存v2ray路径
 */
async function save() {
    console.log("Setting save");

    const validResult = await formRef.value?.validate();

    if (validResult.valid) {
        // 通过验证
        console.log("通过验证");
        // 保存设置
        v2raySetting.home = v2rayHome.value
        ssrSetting.home = ssrHome.value

        await window.electronAPI.SaveVPNSetting(v2raySetting);
        await window.electronAPI.SaveVPNSetting(ssrSetting);
    }
    else {
        // 没通过验证
        console.log("没通过验证");
    }
}

</script>

<style scoped>

</style>