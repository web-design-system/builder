<template>
  <span
    class="inline-flex -space-x-px overflow-hidden rounded-md border bg-white shadow-sm"
  >
    <button
      v-for="entry of sizes"
      class="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:relative"
      @click="onSelect(entry[1])"
    >
      {{ entry[0] }}
    </button>
  </span>
</template>

<script setup>
const sizes = Object.entries({
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
});

const emits = defineEmits(["resize"]);

function onSelect(value) {
  emits("resize", value);
}
</script>
