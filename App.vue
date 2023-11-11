<template>
  <div class="builder">
    <div class="builder__canvas">
      <div v-if="snippet" class="builder__preview">
        <div v-html="snippet"></div>
      </div>
      <textarea class="builder__code" v-model="snippet"></textarea>
      <div v-if="!snippet" class="builder__preview">
        <h1 class="builder__greeting-title">Let's get started!</h1>
        <p class="builder__greeting-text">
          Add instructions below to create or update the current markup.<br />
          Use Tailwind 2.x for styling.
        </p>
      </div>
    </div>
    <form class="builder__instruction" @submit.prevent="apply">
      <textarea
        :rows="height"
        class="builder__input"
        v-model="input"
        @keyup="onKeyUp"
      ></textarea>
      <button
        class="builder__btn builder__btn-primary"
        type="submit"
        :disabled="!input"
      >
        <span v-if="running" class="material-icons animate-spin">refresh</span>
        <span v-else class="material-icons">send</span>
      </button>
      <button
        v-if="history.length"
        class="builder__btn builder__btn-secondary"
        @click="undo"
        type="button"
      >
        <span class="material-icons">undo</span>
      </button>
      <button
        :disabled="!(snippet.length || history.length)"
        class="builder__btn builder__btn-secondary"
        type="button"
        @click="save"
      >
        <span class="material-icons">save</span>
      </button>
      <button
        :disabled="!(snippet.length || history.length)"
        class="builder__btn builder__btn-secondary"
        type="button"
        @click="publish"
      >
        <span class="material-icons">publish</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type HistoryEntry = {
  message: string;
  snippet: string;
};

const input = ref("");
const snippet = ref("");
const history = ref<Array<HistoryEntry>>([]);
const running = ref(false);
const height = computed(() => input.value.split("\n").length);
const url = new URL(window.location.href);

async function load() {
  const id = url.searchParams.get("id");

  if (!id) {
    return;
  }

  const state = await fetch("/components/" + id);
  const json = await state.json();

  history.value = json.history || [];
  snippet.value = json.snippet || "";
  input.value = json.input || "";
}

async function save() {
  const id = url.searchParams.get("id");

  if (!id) {
    return;
  }

  await fetch("/components/" + id, {
    method: "POST",
    body: JSON.stringify({
      history: history.value,
      snippet: snippet.value,
      input: input.value,
    }),
  });
}

async function publish() {
  const id = url.searchParams.get("id");

  if (!id) {
    return;
  }

  if (!confirm("Sure?")) {
    return;
  }

  await fetch("/publish/" + id, { method: "POST" });
}

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
    const body = JSON.stringify({
      history: history.value.map((h) => h.message),
      code: snippet.value,
      instruction: input.value,
    });

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

onMounted(load);
</script>
