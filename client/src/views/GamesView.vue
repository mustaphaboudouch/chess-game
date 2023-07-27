<script setup>
import { onMounted, onUnmounted } from "vue";
import socket, { state } from "../socket";

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function onCancelGame(gameId) {
  socket.emit("game-cancel", { gameId });
}

function onDeleteGame(gameId) {
  socket.emit("game-delete", { gameId });
}
</script>

<template>
  <h1>Games Page</h1>

  <h3>WAITING</h3>
  <div v-for="(game, index) in state.adminGames.WAITING" :key="index">
    <div>{{ game.playerUsername }} vs {{ game.opponentUsername }}</div>
    <div>{{ game.createdAt }}</div>
    <div>
      <button @click="onCancelGame(game._id)">Cancel</button>
      <button @click="onDeleteGame(game._id)">Delete</button>
    </div>
  </div>

  <h3>PLAYING</h3>
  <div v-for="(game, index) in state.adminGames.PLAYING" :key="index">
    <div>{{ game.playerUsername }} vs {{ game.opponentUsername }}</div>
    <div>{{ game.createdAt }} - {{ game.updatedAt }}</div>
    <div>
      <button @click="onCancelGame(game._id)">Cancel</button>
      <button @click="onDeleteGame(game._id)">Delete</button>
    </div>
  </div>

  <h3>DONE</h3>
  <div v-for="(game, index) in state.adminGames.DONE" :key="index">
    <div>{{ game.playerUsername }} vs {{ game.opponentUsername }}</div>
    <div>{{ game.createdAt }} - {{ game.updatedAt }}</div>
    <div>
      <button @click="onDeleteGame(game._id)">Delete</button>
    </div>
  </div>

  <h3>CANCELED</h3>
  <div v-for="(game, index) in state.adminGames.CANCELED" :key="index">
    <div>{{ game.playerUsername }} vs {{ game.opponentUsername }}</div>
    <div>{{ game.createdAt }} - {{ game.updatedAt }}</div>
    <div>
      <button @click="onDeleteGame(game._id)">Delete</button>
    </div>
  </div>
</template>
