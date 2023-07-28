<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import socket, { state } from "../stores/socket";
import { RouterLink } from "vue-router";
import dayjs from "dayjs";

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
  <div
    v-if="state.game && (state.game.status === 'WAITING' || state.game.status === 'PLAYING')"
    class="px-6 py-4 rounded-xl flex items-center justify-between mb-8"
    style="background-color: #68a741"
  >
    <div class="flex items-center gap-3 text-white">
      <i class="fa-solid fa-chess-knight text-xl"></i>
      <p class="text-sm">Vous avez une partie en cours...</p>
    </div>
    <RouterLink
      to="/board"
      class="bg-white text-black text-xs uppercase font-medium px-4 py-2 rounded-md"
    >
      Rejoindre la partie
    </RouterLink>
  </div>

  <div class="px-12 py-8 rounded-2xl" style="background-color: #202020">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-white text-2xl font-medium">Parties privées</h1>
      <button
        @click="onCreateGame('PRIVATE')"
        class="text-white uppercase text-xs font-medium py-3 px-4 rounded-md mt-2"
        style="background-color: #68a741"
      >
        Créer une partie
      </button>
    </div>

    <form @submit.prevent="onJoinPrivateGame" class="flex items-center gap-3">
      <input
        type="text"
        placeholder="Code"
        v-model="code"
        class="block w-full px-4 py-2 rounded-md max-w-sm"
      />
      <button
        type="submit"
        class="block text-white uppercase text-xs font-medium py-3 px-4 rounded-md mt-2 flex-none"
        style="background-color: #68a741"
      >
        Rejoindre
      </button>
    </form>
  </div>

  <div class="px-12 py-8 rounded-2xl mt-6" style="background-color: #202020">
    <div class="flex items-center justify-between">
      <h1 class="text-white text-2xl font-medium">Parties publiques</h1>
      <button
        @click="onCreateGame('PUBLIC')"
        class="text-white uppercase text-xs font-medium py-3 px-4 rounded-md mt-2"
        style="background-color: #68a741"
      >
        Créer une partie
      </button>
    </div>

    <table
      v-if="state.games.length"
      class="w-full rounded-2xl mt-8"
      style="background-color: #202020"
    >
      <tr
        class="text-sm uppercase font-medium"
        style="color: #818181; border-bottom: 1px solid #282828"
      >
        <td class="py-5">Créée</td>
        <td class="py-5">Joueur</td>
        <td class="py-5">Score</td>
        <td></td>
      </tr>
      <tr
        v-for="(game, index) in state.games"
        :key="index"
        class="text-white text-sm"
        style="border-bottom: 1px solid #282828"
      >
        <td class="py-5">
          {{ dayjs(game.createdAt).format("MMM DD, YYYY à HH:mm") }}
        </td>
        <td class="py-5">
          {{ game.player.username }}
        </td>
        <td class="py-5">
          {{ game.player.score }}
        </td>
        <td class="py-5">
          <div class="flex items-center justify-end gap-4">
            <button
              @click="onJoinPublicGame(game._id)"
              class="text-sm hover:underline"
              style="color: #818181"
            >
              Rejoindre la partie
            </button>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
