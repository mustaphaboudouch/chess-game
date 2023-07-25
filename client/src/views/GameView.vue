<script setup>
import { onMounted, onUnmounted } from "vue";
import socket, { state } from "../socket";
import { RouterLink } from "vue-router";

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function onCreateGame() {
  socket.emit("game-create");
}
</script>

<template>
  <h1>Game Page</h1>

  <button @click="onCreateGame">Create game</button>
  <div v-if="state.game">
    <RouterLink :to="`/game/${state.game._id}`">Go to game</RouterLink>
  </div>

  <pre>{{ JSON.stringify(state.game, null, 2) }}</pre>
</template>
