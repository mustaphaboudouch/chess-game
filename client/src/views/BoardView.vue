<script setup>
import { onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import socket, { state } from "../socket";
import ChessBoard from "../components/ui/ChessBoard.vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

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

  <div v-if="!state.game">
    <p>No game to play</p>
  </div>

  <div v-if="state.game">
    <div v-if="state.game.status === 'WAITING' || state.game.status === 'PLAYING'">
      <button @click="onQuitGame">Quit game</button>
    </div>

    <div v-if="state.game.status === 'WAITING'">
      <p>Waiting for your opponent ...</p>
      <p v-if="state.game.visibility === 'PRIVATE'">Code : {{ state.game.code }}</p>
    </div>

    <div v-if="state.game.status === 'PLAYING' || state.game.status === 'DONE'">
      <div v-if="state.game.status === 'DONE'">
        <div v-if="!state.game.winner">
          <p>DRAW !!!!!</p>
        </div>
        <div v-if="state.game.winner">
          <p v-if="user.id === state.game.winner.toString()">You win !!!</p>
          <p v-if="user.id !== state.game.winner.toString()">You lose !!!</p>
          <RouterLink to="/game">Play another game</RouterLink>
        </div>
      </div>

      <ChessBoard :game="state.game" />
    </div>
  </div>
</template>
