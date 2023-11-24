<template>
  <div class="builder">
    <div class="builder__toolbar">
      <Preview @resize="setWidth($event)"></Preview>
    </div>
    <div class="builder__canvas">
      <div v-if="snippet" class="builder__preview">
        <div v-html="snippet" v-bind:style="{ maxWidth: previewWidth }"></div>
      </div>
      <div v-if="!snippet" class="builder__greeting">
        <h1 class="builder__greeting-title">Let's get started!</h1>
        <p class="builder__greeting-text">
          Add instructions below to create or update the current markup.<br />
          Use Tailwind 2.x for styling.
        </p>
      </div>
      <textarea class="builder__code" v-model="snippet"></textarea>
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
        :disabled="!input || running"
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
        :class="[(saving && 'animate-pulse') || '']"
        type="button"
        @click="save"
      >
        <span class="material-icons">save</span>
      </button>
      <button
        :disabled="!(snippet.length || history.length)"
        class="builder__btn builder__btn-secondary"
        :class="[(publishing && 'animate-pulse') || '']"
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
import Preview from './Preview.vue';

type HistoryEntry = {
  message: string;
  snippet: string;
};

const input = ref("");
const snippet = ref("");
const history = ref<Array<HistoryEntry>>([]);
const running = ref(false);
const publishing = ref(false);
const saving = ref(false);
const height = computed(() => input.value.split("\n").length);
const url = new URL(window.location.href);
const componentId = url.searchParams.get("id") || url.pathname.replace('/edit/', '');
const previewWidth = ref("100%");

function setWidth(value) {
  previewWidth.value = value;
}

async function load() {
  if (!componentId) {
    return;
  }

  const state = await fetch("/components/" + componentId);
  const json = await state.json();

  history.value = json.history || [];
  snippet.value = json.snippet || "";
  input.value = json.input || "";
}

async function save() {
  if (!componentId) {
    return;
  }

  try {
    saving.value = true;
    await fetch("/components/" + componentId, {
      method: "POST",
      body: JSON.stringify({
        history: history.value,
        snippet: snippet.value,
        input: input.value,
      }),
    });
  } finally {
    saving.value = false;
  }
}

async function publish() {
  if (!componentId) {
    return;
  }

  if (!confirm("Sure?")) {
    return;
  }

  try {
    publishing.value = true;
    await fetch("/publish/" + componentId, { method: "POST" });
  } finally {
    publishing.value = true;
  }
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
