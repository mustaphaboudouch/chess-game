<script setup>
const props = defineProps({
  game: Object
});
</script>

<template>
  <h1>Chess Board</h1>

  <pre>{{ JSON.stringify(props.game, null, 2) }}</pre>
</template>
