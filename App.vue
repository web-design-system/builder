<template>
  <div class="builder">
    <div class="builder__canvas">
      <code v-if="snippet" class="builder__code">{{ snippet }}</code>
      <div v-if="snippet" class="builder__preview" v-html="snippet"></div>
      <div v-if="!snippet" class="builder__greeting">
        <h1 class="builder__greeting-title">Let's get started!</h1>
        <p class="builder__greeting-text">
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

type HistoryEntry = {
  message: string;
  snippet: string;
};

const input = ref("");
const snippet = ref("");
const history = ref<Array<HistoryEntry>>([]);
const running = ref(false);
const height = computed(() => input.value.split("\n").length + 1);

async function undo() {
  const list = history.value;

  if (!list.length) {
    return;
  }

  const previous = list.pop()!;
  snippet.value = previous.snippet;
  input.value = previous.message;
  running.value = false;
}

async function apply() {
  running.value = true;

  try {
    const body = JSON.stringify([
      ...history.value.map((h) => ({ role: "user", message: h.message })),
      { role: "assistant", message: snippet.value },
      { role: "user", message: input.value },
    ]);

    const req = await fetch("/run", { method: "POST", body });
    const code = await req.text();

    if (code) {
      snippet.value = sanitize(code);
      history.value.push({ snippet: snippet.value, message: input.value });
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
