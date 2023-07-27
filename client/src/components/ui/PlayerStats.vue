<script setup>
const props = defineProps(["stats"]);
</script>

<template>
  <pre>{{ JSON.stringify(props.stats, null, 2) }}</pre>
</template>
