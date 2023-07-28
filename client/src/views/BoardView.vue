<script setup>
import { onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import socket, { state } from "../stores/socket";
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
  const isConfirmed = window.confirm("Voulez vous quitter cette partie ?");
  if (!isConfirmed) return;

  socket.emit("game-quit", { gameId: state.game._id });
}
</script>

<template>
  <div v-if="state.game">
    <div
      v-if="state.game.status === 'WAITING'"
      class="fixed bg-black/50 inset-0 flex items-center justify-center z-10"
    >
      <div class="bg-white p-8 w-[600px] rounded-xl">
        <h3 class="text-2xl font-medium">En attente d'un adversaire...</h3>
        <p v-if="state.game.visibility === 'PRIVATE'" class="mt-4 flex items-end gap-3">
          Code à partager :
          <span class="text-2xl font-bold" style="color: #68a741">{{ state.game.code }}</span>
        </p>
      </div>
    </div>

    <div
      v-if="state.game.status === 'WAITING' || state.game.status === 'PLAYING'"
      class="flex justify-end relative z-50"
    >
      <button
        @click="onQuitGame"
        class="text-white uppercase text-xs font-medium py-3 px-4 rounded-md mt-2"
        style="background-color: #68a741"
      >
        Quitter la partie
      </button>
    </div>

    <div v-if="state.game.status === 'PLAYING' || state.game.status === 'DONE'">
      <div
        v-if="state.game.status === 'DONE'"
        class="fixed bg-black/50 inset-0 flex items-center justify-center z-40"
      >
        <div class="bg-white p-8 w-[600px] rounded-xl z-50 flex flex-col items-center text-center">
          <div v-if="!state.game.winnerId">
            <p>Match nul 😐</p>
          </div>
          <div v-if="state.game.winnerId">
            <p v-if="user.id === state.game.winnerId" class="text-2xl font-semibold mb-4">
              Vous avez gagné 🥳
            </p>
            <p v-if="user.id !== state.game.winnerId" class="text-2xl font-semibold mb-4">
              Vous avez perdu 😢
            </p>
            <RouterLink
              to="/game"
              class="text-white uppercase text-xs font-medium py-3 px-4 rounded-md mt-2"
              style="background-color: #68a741"
            >
              Rejouer
            </RouterLink>
          </div>
        </div>
      </div>

      <ChessBoard :game="state.game" />
    </div>
  </div>

  <div v-if="!state.game" class="flex flex-col items-center">
    <p class="text-2xl font-light text-center mb-6" style="color: #818181">
      Aucune partie en cours
    </p>

    <RouterLink
      to="/game"
      class="text-white uppercase text-xs font-medium py-3 px-4 rounded-md mt-2"
      style="background-color: #68a741"
    >
      Créer une partie
    </RouterLink>
  </div>
</template>
