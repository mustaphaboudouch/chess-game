<script setup>
import { onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import socket, { state } from "../socket";
import ChessBoard from "../components/ui/ChessBoard.vue";

const route = useRoute();

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function join() {
  socket.emit("game-join", { gameId: route.params.id });
}
</script>

<template>
  <h1>Board Page</h1>

  <div v-if="!state.game">
    <button @click="join">Join game</button>
  </div>

  <div v-if="state.game">
    <div v-if="state.game.status === 'WAITING'">
      <p>Waiting for your opponent ...</p>
    </div>

    <div v-if="state.game.status === 'PLAYING'">
      <ChessBoard :game="state.game" />
    </div>
  </div>
</template>
