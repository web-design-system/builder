<template>
  <div class="builder">
    <div class="builder__toolbar">
      <span class="btn-group">
        <button
          class="btn-icon"
          title="Save"
          :disabled="!(snippet.length || history.length)"
          :class="[(saving && 'animate-pulse') || '']"
          type="button"
          @click="save"
        >
          <span class="material-icons">save</span>
        </button>

        <button
          class="btn-icon"
          title="Publish"
          :disabled="!(snippet.length || history.length)"
          :class="[(publishing && 'animate-pulse') || '']"
          type="button"
          @click="onPublish"
        >
          <span class="material-icons">publish</span>
        </button>
      </span>

      <Selector
        @select="setWidth($event)"
        :options="viewportSizes"
        :value="viewportSize"
      />

      <Selector
        @select="setLayout($event)"
        :options="layoutOptions"
        :value="layout"
      />
    </div>
    <div class="builder__canvas">
      <div v-if="snippet" class="builder__preview">
        <div
          class="builder__preview-frame"
          v-html="snippet"
          v-bind:style="{ maxWidth: viewportSize }"
        ></div>
      </div>
      <div v-if="!snippet" class="builder__greeting">
        <h1 class="builder__greeting-title">Let's get started!</h1>
        <p class="builder__greeting-text">
          Add instructions below to create or update the current markup.<br />
          Use Tailwind 2.x for styling.
        </p>
      </div>
      <textarea
        class="builder__code"
        v-model="snippet"
        v-if="showCode"
      ></textarea>
    </div>
    <form
      class="builder__instruction"
      @submit.prevent="onApply"
      v-if="showConsole"
    >
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
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import Selector from "./Selector.vue";
import { select, dispatch } from "./state.js";
import {
  HistoryLoadAction,
  HistorySaveAction,
  SetLayoutAction,
  UndoAction,
  UpdateAction,
  ViewportSizeAction,
} from "./actions";

const viewportSize = select((s) => s.viewportSize);
const viewportSizes = select((s) => s.viewportSizes);
const layoutOptions = select((s) => s.layoutOptions);
const layout = select((s) => s.layout);
const showCode = select((s) => s.showCode);
const showConsole = select((s) => s.showConsole);
const history = select((s) => s.history);
const input = select((s) => s.input);
const snippet = select((s) => s.snippet);
const running = select((s) => s.running);
const publishing = select((s) => s.publishing);
const saving = select((s) => s.saving);
const height = computed(() => input.value.split("\n").length);

function setWidth(value: string) {
  dispatch(new ViewportSizeAction(value));
}

function setLayout(value: string) {
  dispatch(new SetLayoutAction(value));
}

async function save() {
  dispatch(new HistorySaveAction(null));
}

async function undo() {
  dispatch(new UndoAction(null));
}

async function onPublish() {
  dispatch(new UndoAction(null));
}

async function onApply() {
  dispatch(new UpdateAction(null));
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    dispatch(new UpdateAction(null));
  }
}

onMounted(() => dispatch(new HistoryLoadAction(null)));
</script>
