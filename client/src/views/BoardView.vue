<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useSocketStore } from "../stores/socket";
import ChessBoard from "../components/ui/ChessBoard.vue";

const route = useRoute();
const socketStore = useSocketStore();
const { game } = storeToRefs(socketStore);

onMounted(function () {
  socketStore.socket.emit("game-join", { gameId: route.params.id });
});
</script>

<template>
  <h1>Board Page</h1>

  <div v-if="game">
    <div>{{ game.fen }}</div>

    <div
      v-if="game.status !== 'PLAYING'"
      style="background: rgba(0, 0, 0, 0.5); position: fixed; width: 100vw; height: 100vh"
    ></div>

    <ChessBoard :game="game" />
  </div>
</template>
