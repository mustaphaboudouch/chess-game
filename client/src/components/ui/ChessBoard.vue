<script setup>
import { computed, onMounted, onUnmounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth";
import socket, { state } from "../../socket";
import { fenToArray, cleanPosition } from "../../lib/chess";

const props = defineProps({
  game: Object
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const values = reactive({
  selectedPiece: null,
  legalMoves: []
});

const board = computed(function () {
  return fenToArray(props.game.fen);
});

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});

function isPromoting(move) {
  const piece = state.chess.get(move.from);

  if (piece?.type !== "p") return false;

  if (piece.color !== state.chess.turn()) return false;

  if (!["1", "8"].some((it) => move.to.endsWith(it))) return false;

  return state.chess
    .moves({ square: move.from, verbose: true })
    .map((it) => it.to)
    .includes(move.to);
}

function onClickPiece(piece, position) {
  const moves = state.chess.moves({ square: position });

  const isMyTurn =
    (user.value.id === props.game.player && state.chess.turn() === "w") ||
    (user.value.id === props.game.opponent && state.chess.turn() === "b");

  if (!isMyTurn) return;

  if (values.selectedPiece && values.legalMoves.includes(position)) {
    console.log(
      "IS PROMOTING :::",
      isPromoting({ from: values.selectedPiece.position, to: position })
    );

    socket.emit("game-move", {
      gameId: state.game._id,
      move: { from: values.selectedPiece.position, to: position }
    });

    values.selectedPiece = null;
    values.legalMoves = [];
  } else {
    values.selectedPiece = moves.length ? { piece, position } : null;
    values.legalMoves = [...moves.map((m) => cleanPosition(m))];
  }
}
</script>

<template>
  <h1>Chess Board</h1>

  <pre>{{ JSON.stringify(props.game, null, 2) }}</pre>

  <div v-for="(row, index) in board" :key="index" style="display: flex">
    <button
      v-for="(cell, index) in row"
      :key="index"
      @click="onClickPiece(cell.piece, cell.position)"
      :class="[
        {
          'cell-selected': cell.position === values.selectedPiece?.position,
          'cell-move': values.legalMoves.includes(cell.position)
        },
        ''
      ]"
      style="width: 50px; height: 50px; border: 1px solid #000000; font-size: 30px"
    >
      {{ cell.emoji }}
    </button>
  </div>
</template>
