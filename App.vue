<template>
  <div class="builder">
    <div class="builder__canvas">
      <code
        class="builder__code"
        >{{ snippet }}</code
      >
      <div class="builder__preview" v-html="snippet"></div>
    </div>
    <div class="builder__instruction">
      <textarea
        :rows="height"
        class="builder__input"
        v-model="input"
        @keyup="onKeyUp"
      ></textarea>
      <button class="builder__btn" @click="apply">
        <span v-if="running" class="material-icons animate-spin">refresh</span>
        <span v-else class="material-icons">send</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import buildHtmlComponent from "https://aifn.run/fn/fffeebb3-4605-4b91-ad56-7c25a2344b3c.js";
import generateHtmlFromInput from "https://aifn.run/fn/08d5dd80-9dc2-4ca2-9354-b16433986b16.js";

const input = ref("");
const snippet = ref("");
const running = ref(false);
const height = computed(() => Math.min(input.value.split("\n").length + 1, 1));

async function apply() {
  running.value = true;
  let code = snippet.value;

  if (code) {
    code = await buildHtmlComponent({
      snippet: code,
      input: input.value,
    });
  } else {
    code = await generateHtmlFromInput({ input: input.value });
  }

  if (code) {
    snippet.value = sanitize(code);
  }

  input.value = "";
  running.value = false;
}

function sanitize(code) {
  if (code.trim().includes("```")) {
    return code.replaceAll("```html", "").replaceAll("```", "");
  }

  return code;
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    apply();
  }
}
</script>
