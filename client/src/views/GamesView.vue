<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import dayjs from "dayjs";
import socket, { state } from "../socket";

const status = ref("WAITING");

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function onCancelGame(gameId) {
  const isConfirmed = window.confirm("Voulez vous annuler cette partie ?");
  if (!isConfirmed) return;

  socket.emit("game-cancel", { gameId });
}

function onDeleteGame(gameId) {
  const isConfirmed = window.confirm("Voulez vous supprimer cette partie ?");
  if (!isConfirmed) return;

  socket.emit("game-delete", { gameId });
}
</script>

<template>
  <h1 class="text-white text-3xl mb-6">Parties</h1>

  <div class="flex items-center justify-end gap-6 text-white mb-6">
    <label class="flex items-center gap-3">
      <input type="radio" name="status" value="WAITING" v-model="status" />
      <span>En attente</span>
    </label>
    <label class="flex items-center gap-3">
      <input type="radio" name="status" value="PLAYING" v-model="status" />
      <span>En cours</span>
    </label>
    <label class="flex items-center gap-3">
      <input type="radio" name="status" value="DONE" v-model="status" />
      <span>Terminée(s)</span>
    </label>
    <label class="flex items-center gap-3">
      <input type="radio" name="status" value="CANCELED" v-model="status" />
      <span>Annulée(s)</span>
    </label>
  </div>

  <table v-if="status === 'WAITING'" class="w-full rounded-2xl" style="background-color: #202020">
    <tr
      class="text-sm uppercase font-medium"
      style="color: #818181; border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">Créée</td>
      <td class="px-6 py-5">Joueur</td>
      <td></td>
    </tr>
    <tr
      v-for="(game, index) in state.adminGames.WAITING"
      :key="index"
      class="text-white"
      style="border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">
        {{ dayjs(game.createdAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td class="px-6 py-5">
        {{ game.playerUsername }}
      </td>
      <td class="px-6 py-5">
        <div class="flex items-center justify-end gap-4">
          <button
            @click="onCancelGame(game._id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Annuler
          </button>
          <button
            @click="onDeleteGame(game._id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  </table>

  <table v-if="status === 'PLAYING'" class="w-full rounded-2xl" style="background-color: #202020">
    <tr
      class="text-sm uppercase font-medium"
      style="color: #818181; border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">Créée</td>
      <td class="px-6 py-5">Dernier mouvement</td>
      <td class="px-6 py-5">Joueur 1</td>
      <td class="px-6 py-5">Joueur 2</td>
      <td></td>
    </tr>
    <tr
      v-for="(game, index) in state.adminGames.PLAYING"
      :key="index"
      class="text-white"
      style="border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">
        {{ dayjs(game.createdAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td class="px-6 py-5">
        {{ dayjs(game.updatedAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td class="px-6 py-5">
        {{ game.playerUsername }}
      </td>
      <td class="px-6 py-5">
        {{ game.opponentUsername }}
      </td>
      <td class="px-6 py-5">
        <div class="flex items-center justify-end gap-4">
          <button
            @click="onCancelGame(game._id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Annuler
          </button>
          <button
            @click="onDeleteGame(game._id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  </table>

  <table v-if="status === 'DONE'" class="w-full rounded-2xl" style="background-color: #202020">
    <tr
      class="text-sm uppercase font-medium"
      style="color: #818181; border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">Créée</td>
      <td class="px-6 py-5">Dernier mouvement</td>
      <td class="px-6 py-5">Joueur 1</td>
      <td class="px-6 py-5">Joueur 2</td>
      <td></td>
    </tr>
    <tr
      v-for="(game, index) in state.adminGames.DONE"
      :key="index"
      class="text-white"
      style="border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">
        {{ dayjs(game.createdAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td class="px-6 py-5">
        {{ dayjs(game.updatedAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td :class="game.winnerId === game.playerId ? 'px-6 py-5 text-green-500' : 'px-6 py-5'">
        {{ game.playerUsername }}
      </td>
      <td :class="game.winnerId === game.opponentId ? 'px-6 py-5 text-green-500' : 'px-6 py-5'">
        {{ game.opponentUsername }}
      </td>
      <td class="px-6 py-5">
        <div class="flex items-center justify-end gap-4">
          <button
            @click="onDeleteGame(game._id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  </table>

  <table v-if="status === 'CANCELED'" class="w-full rounded-2xl" style="background-color: #202020">
    <tr
      class="text-sm uppercase font-medium"
      style="color: #818181; border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">Créée</td>
      <td class="px-6 py-5">Dernier mouvement</td>
      <td class="px-6 py-5">Joueur 1</td>
      <td class="px-6 py-5">Joueur 2</td>
      <td></td>
    </tr>
    <tr
      v-for="(game, index) in state.adminGames.CANCELED"
      :key="index"
      class="text-white"
      style="border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">
        {{ dayjs(game.createdAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td class="px-6 py-5">
        {{ dayjs(game.updatedAt).format("MMM DD, YYYY HH:mm") }}
      </td>
      <td :class="game.winnerId === game.playerId ? 'px-6 py-5 text-green-500' : 'px-6 py-5'">
        {{ game.playerUsername }}
      </td>
      <td
        :class="
          game.winnerId && game.winnerId === game.opponentId
            ? 'px-6 py-5 text-green-500'
            : 'px-6 py-5'
        "
      >
        {{ game.opponentUsername ?? "-" }}
      </td>
      <td class="px-6 py-5">
        <div class="flex items-center justify-end gap-4">
          <button
            @click="onDeleteGame(game._id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  </table>

  <!-- <h3>WAITING</h3>
  <div v-for="(game, index) in state.adminGames.WAITING" :key="index">
    <div>{{ game.playerUsername }} vs {{ game.opponentUsername }}</div>
    <div>{{ game.createdAt }}</div>
    <div>
      <button @click="onCancelGame(game._id)">Cancel</button>
      <button @click="onDeleteGame(game._id)">Delete</button>
    </div>
  </div> -->
  <!-- 
  <h3>PLAYING</h3>
  <div v-for="(game, index) in state.adminGames.PLAYING" :key="index">
    <div>{{ game.playerUsername }} vs {{ game.opponentUsername }}</div>
    <div>{{ game.createdAt }} - {{ game.updatedAt }}</div>
    <div>
      <button @click="onCancelGame(game._id)">Cancel</button>
      <button @click="onDeleteGame(game._id)">Delete</button>
    </div>
  </div> -->

  <!-- <h3>DONE</h3>
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
  </div> -->
</template>
