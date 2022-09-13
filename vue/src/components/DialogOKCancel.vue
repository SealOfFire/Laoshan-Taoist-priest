<!--确认取消弹出窗-->
<template>
  <v-dialog v-model="showDialog" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>
      <v-card-text>
        {{ message }}
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
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps(["title", "message"]);
const emit = defineEmits(["ok", "cancel"]);

const showDialog = ref<boolean>(false);

//const show = ref<boolean>(false);

// watch(props, (value, prevValue) => { console.log({ value, prevValue }); });

// watch(() => props.show, (newValue) => { console.log({ newValue }); });

//onMounted(() => {
//    showDialog.value = show
//});

function show1() {
  console.log("show");
}

function ok() {
  showDialog.value = false;
  emit("ok");
}

function cancel() {
  showDialog.value = false;
  emit("cancel");
}
</script>

<style scoped>
</style>
