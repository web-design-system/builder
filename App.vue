<template>
  <div class="builder">
    <div class="builder__canvas">
      <code v-if="snippet" class="builder__code">{{ snippet }}</code>
      <div v-if="snippet" class="builder__preview" v-html="snippet"></div>
      <div v-if="!snippet" class="builder__greeting">
        <h1>Let's get started!</h1>
        <p>
          Add instructions below to create or update the current markup.<br />Using
          Tailwind 2 for styles
        </p>
      </div>
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
      <button v-if="history.length" class="builder__btn" @click="undo">
        <span class="material-icons">undo</span>
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
const history = ref<Array<{ s: string; i: string }>>([]);
const running = ref(false);
const height = computed(() => input.value.split("\n").length + 1);

async function undo() {
  const list = history.value;

  if (!list.length) {
    return;
  }

  const previous = list.pop()!;
  snippet.value = previous.s;
  input.value = previous.i;
  running.value = false;
}

async function apply() {
  running.value = true;
  let code = snippet.value;

  try {
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
      history.value.push({ s: snippet.value, i: input.value });
    }

    input.value = "";
  } finally {
    running.value = false;
  }
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
