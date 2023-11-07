<template>
  <div class="flex flex-col h-screen p-4 gap-2">
    <code class="whitespace-pre h-1/2 overflow-auto">{{ snippet }}</code>
    <div class="flex-grow" v-html="snippet"></div>
    <div class="flex p-4">
      <input class="flex-grow p-2" v-model="input" />
      <button class="px-4 py-2 bg-blue-500 text-white" @click="apply">OK</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import buildHtmlComponent from 'https://aifn.run/fn/fffeebb3-4605-4b91-ad56-7c25a2344b3c.js';

const input = ref("");
const snippet = ref("");

async function apply() {
  const code = await buildHtmlComponent({
    snippet: snippet.value,
    input: input.value,
  });

  if (code) {
    snippet.value = code;
    input.value = '';
  }
}
</script>
