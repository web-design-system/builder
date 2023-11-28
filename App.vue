<template>
  <div class="builder">
    <div class="builder__toolbar">
      <Toolbar @run="onActionRun" :actions="toolbarActions" />

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
      <div
        class="builder__preview"
        v-if="
          snippet &&
          (layout === SetLayoutAction.layouts.both ||
            layout === SetLayoutAction.layouts.preview)
        "
      >
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
        v-if="
          layout === SetLayoutAction.layouts.both ||
          layout === SetLayoutAction.layouts.code
        "
        @change="onSnippetUpdate"
      ></textarea>
    </div>
    <form class="builder__instruction" @submit.prevent="onApply">
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
import Toolbar from "./Toolbar.vue";
import { select, dispatch, set } from "./state.js";
import {
  HistoryLoadAction,
  HistorySaveAction,
  SetLayoutAction,
  UndoAction,
  UpdateAction,
  SetViewportSizeAction,
  PublishAction,
} from "./actions";
import "./effects.js";

const viewportSize = select((s) => s.viewportSize);
const viewportSizes = select((s) => s.viewportSizes);
const layoutOptions = select((s) => s.layoutOptions);
const layout = select((s) => s.layout);
const history = select((s) => s.history);
const input = select((s) => s.input);
const snippet = select((s) => s.snippet);
const running = select((s) => s.running);
const publishing = select((s) => s.publishing);
const saving = select((s) => s.saving);
const height = computed(() => input.value.split("\n").length);

const toolbarActions = computed(() => [
  {
    id: "save",
    label: "Save",
    icon: "save",
    action: HistorySaveAction,
    busy: saving.value,
    disabled: !(snippet.value.length || history.value.length),
  },
  {
    id: "publish",
    label: "Publish",
    icon: "publish",
    action: PublishAction,
    busy: publishing.value,
    disabled: !(snippet.value.length || history.value.length),
  },
  {
    id: 'undo',
    label: "",
    icon: "undo",
    action: UndoAction,
  },
]);

function onActionRun(action) {
  dispatch(new action.action());
}

function setWidth(value: string) {
  dispatch(new SetViewportSizeAction(value));
}

function setLayout(value: string) {
  dispatch(new SetLayoutAction(value));
}

async function onSnippetUpdate() {
  set("snippet", snippet.value);
}

async function onApply() {
  dispatch(new UpdateAction());
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    dispatch(new UpdateAction());
  }
}

onMounted(() => dispatch(new HistoryLoadAction()));
</script>
