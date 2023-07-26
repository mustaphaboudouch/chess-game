<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import socket, { state } from "../socket";
import { RouterLink } from "vue-router";

const code = ref("");

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function onCreateGame(visibility) {
  socket.emit("game-create", { visibility });
}

function onJoinPrivateGame() {
  socket.emit("game-join-private", { code: code.value });
}

function onJoinPublicGame(gameId) {
  socket.emit("game-join-public", { gameId });
}
</script>

<template>
  <h1>Game Page</h1>

  <button @click="onCreateGame('PUBLIC')">Create public game</button>
  <button @click="onCreateGame('PRIVATE')">Create private game</button>

  <form @submit.prevent="onJoinPrivateGame">
    <input type="text" placeholder="Code" v-model="code" />
    <button type="submit">Join private game</button>
  </form>

  <div v-if="state.game && (state.game.status === 'WAITING' || state.game.status === 'PLAYING')">
    <RouterLink to="/board">Go to game</RouterLink>
  </div>

  <div v-for="(game, index) in state.games" :key="index">
    <div>{{ game._id }}</div>
    <button @click="onJoinPublicGame(game._id)">Join public game</button>
  </div>
</template>
