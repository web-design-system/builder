<template>
  <span
    class="inline-flex -space-x-px overflow-hidden rounded-md border bg-white shadow-sm"
  >
    <button
      v-for="option of options"
      class="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:relative"
      :class="option.value === value && 'bg-gray-50'"
      @click="onSelect(option.value)"
    >
      {{ option.label }}
    </button>
  </span>
</template>

<script setup>
const props = defineProps({
  options: { type: Array },
  value: { type: string },
});

const emit = defineEmits(["select"]);
const onSelect = (value) => emit("select", value);
</script>
