<script setup>
import { storeToRefs } from "pinia";
import { useSocketStore } from "../stores/socket";

const socketStore = useSocketStore();
const { game } = storeToRefs(socketStore);

function onCreateGame() {
  socketStore.socket.emit("game-create");
}
</script>

<template>
  <h1>Game Page</h1>

  <button @click="onCreateGame">Create game</button>
  <div v-if="game">
    <RouterLink :to="`/game/${game._id}`">Go to game</RouterLink>
  </div>
</template>
