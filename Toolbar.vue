<template>
  <span class="btn-toolbar">
    <button
      v-for="action of actions"
      :key="action.id"
      :title="action.label"
      class="btn-toolbar__button"
      :disabled="action.disabled"
      :class="[action.busy && 'animate-pulse', action.classes]"
      @click="onRun(action)"
    >
      <span v-if="action.icon" class="material-icons btn-toolbar__icon">{{
        action.icon
      }}</span>
      <span v-if="action.label" class="btn-toolbar__label">{{
        action.label
      }}</span>
    </button>
  </span>
</template>

<script setup>
const props = defineProps({
  actions: { type: Array },
});

const emit = defineEmits(["run"]);
const onRun = (action) => emit("run", action);
</script>
