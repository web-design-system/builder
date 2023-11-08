<template>
  <div class="flex flex-col w-screen h-screen p-4">
    <div class="md:grid-columns-2 flex-grow flex gap-2 bg-gray-100">
      <code class="whitespace-pre h-1/2 overflow-auto bg-white rounded shadow">{{ snippet }}</code>
      <div class="flex-grow bg-white rounded shadow" v-html="snippet"></div>
    </div>
    <div class="flex p-4">
      <textarea :rows="height" aut class="flex-grow p-2" v-model="input" @keyup="onKeyUp"></textarea>
      <button class="px-4 py-2 bg-blue-500 text-white" @click="apply">
        <span v-if="running" class="material-icons animate-spin">refresh</span>
        <span v-else class="material-icons">send</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import buildHtmlComponent from "https://aifn.run/fn/fffeebb3-4605-4b91-ad56-7c25a2344b3c.js";

const input = ref("");
const snippet = ref("");
const running = ref(false);
const height = computed(() => Math.min(input.value.split('\n').length + 1, 1));

async function apply() {
  running.value = true;

  let code = await buildHtmlComponent({
    snippet: snippet.value,
    input: input.value,
  });

  if (code) {
    snippet.value = sanitize(code);
    input.value = "";
  }

  running.value = false;
}

function sanitize(code) {
  if (code.trim().includes('```')) {
    return code.replaceAll('```html', '').replaceAll('```', '');
  }

  return code;
}

function onKeyUp(event: KeyboardEvent) {
  event.key === "Enter" && apply();
}
</script>
