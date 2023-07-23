<script setup>
import { computed, onBeforeUpdate, ref } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { Chess } from "chess.js";
import { useAuthStore } from "../../stores/auth";
import { useSocketStore } from "../../stores/socket";
import { fenToArray, cleanPosition } from "../../lib/chess";

const props = defineProps({
  game: Object
});

const route = useRoute();
const socketStore = useSocketStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const chess = new Chess(props.game.fen);
const selectedPiece = ref(null);
const legalMoves = ref([]);

const board = computed(function () {
  return fenToArray(props.game.fen);
});

onBeforeUpdate(() => {
  chess.load(props.game.fen);
});

function handleClick(piece, position) {
  const moves = chess.moves({ square: position });

  const isMyTurn =
    (user.value.id === props.game.player && chess.turn() === "w") ||
    (user.value.id === props.game.opponent && chess.turn() === "b");

  if (!isMyTurn) return;

  if (selectedPiece.value && legalMoves.value.includes(position)) {
    // TODO: change UI in local

    // change UI for oppenent
    socketStore.socket.emit("game-move", {
      gameId: route.params.id,
      move: { from: selectedPiece.value.position, to: position }
    });

    // reset state
    selectedPiece.value = null;
    legalMoves.value = [];
  } else {
    // highlight legal moves
    selectedPiece.value = moves.length ? { piece, position } : null;
    legalMoves.value = [...moves.map((m) => cleanPosition(m))];
  }
}
</script>

<template>
  <h1>Chess Board</h1>

  <div v-for="(row, index) in board" :key="index" style="display: flex">
    <button
      v-for="(cell, index) in row"
      :key="index"
      @click="handleClick(cell.piece, cell.position)"
      :class="[
        {
          'cell-selected': cell.position === selectedPiece?.position,
          'cell-move': legalMoves.includes(cell.position)
        },
        ''
      ]"
      style="width: 50px; height: 50px; border: 1px solid #000000; font-size: 30px"
    >
      {{ cell.emoji }}
    </button>
  </div>
</template>
