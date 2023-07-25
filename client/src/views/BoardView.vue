<script setup>
import { onMounted, onUnmounted } from "vue";
import socket, { state } from "../socket";
import ChessBoard from "../components/ui/ChessBoard.vue";

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function onQuitGame() {
  socket.emit("game-quit", { gameId: state.game._id });
}
</script>

<template>
  <h1>Board Page</h1>

  <div v-if="!state.game"></div>

  <div v-if="state.game">
    <button @click="onQuitGame">Quit game</button>

    <div v-if="state.game.status === 'WAITING'">
      <p>Waiting for your opponent ...</p>
      <p v-if="state.game.visibility === 'PRIVATE'">Code : {{ state.game.code }}</p>
    </div>

    <div v-if="state.game.status === 'PLAYING'">
      <ChessBoard :game="state.game" />
    </div>
  </div>
</template>
