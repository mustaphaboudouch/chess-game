<script setup>
import { computed, onMounted, onUnmounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth";
import socket, { state, updateBoard } from "../../stores/socket";
import { fenToArray, cleanPosition } from "../../lib/chess";
import { Chess } from "chess.js";

const props = defineProps({
  game: Object
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const values = reactive({
  selectedPiece: null,
  targetPosition: null,
  legalMoves: [],
  showPromotionModal: false
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
    (user.value.id === props.game.playerId && state.chess.turn() === "w") ||
    (user.value.id === props.game.opponentId && state.chess.turn() === "b");

  if (!isMyTurn) return;

  if (values.selectedPiece && values.legalMoves.includes(position)) {
    values.targetPosition = position;

    if (isPromoting({ from: values.selectedPiece.position, to: position })) {
      values.showPromotionModal = true;
    } else {
      // update move client side
      const chess = new Chess(props.game.fen);
      chess.move({ from: values.selectedPiece.position, to: position });
      updateBoard(chess.fen());

      socket.emit("game-move", {
        gameId: state.game._id,
        move: { from: values.selectedPiece.position, to: position }
      });

      values.selectedPiece = null;
      values.legalMoves = [];
    }
  } else {
    values.selectedPiece = moves.length ? { piece, position } : null;
    values.legalMoves = [...moves.map((m) => cleanPosition(m))];
  }
}

function onChoosePiece(piece) {
  values.showPromotionModal = false;

  // update move client side
  const chess = new Chess(props.game.fen);
  chess.move({ from: values.selectedPiece.position, to: values.targetPosition, promotion: piece });
  updateBoard(chess.fen());

  socket.emit("game-move", {
    gameId: state.game._id,
    move: {
      from: values.selectedPiece.position,
      to: values.targetPosition,
      promotion: piece
    }
  });

  values.selectedPiece = null;
  values.legalMoves = [];
}
</script>

<template>
  <div
    v-if="values.showPromotionModal"
    class="fixed bg-black/50 inset-0 z-40 flex items-center justify-center"
  >
    <form
      @submit.prevent="onChoosePiece"
      class="bg-white px-12 py-8 w-[600px] rounded-xl z-50 flex justify-between"
    >
      <button
        @click="onChoosePiece('q')"
        class="flex flex-col items-center w-20 py-4 rounded-xl"
        style="background-color: #68a741"
      >
        <i class="fa-solid fa-chess-queen text-5xl"></i>
        <span class="text-sm">Dame</span>
      </button>
      <button
        @click="onChoosePiece('r')"
        class="flex flex-col items-center w-20 py-4 rounded-xl"
        style="background-color: #68a741"
      >
        <i class="fa-solid fa-chess-rook text-5xl"></i>
        <span class="text-sm">Tour</span>
      </button>
      <button
        @click="onChoosePiece('b')"
        class="flex flex-col items-center w-20 py-4 rounded-xl"
        style="background-color: #68a741"
      >
        <i class="fa-solid fa-chess-bishop text-5xl"></i>
        <span class="text-sm">Fou</span>
      </button>
      <button
        @click="onChoosePiece('n')"
        class="flex flex-col items-center w-20 py-4 rounded-xl"
        style="background-color: #68a741"
      >
        <i class="fa-solid fa-chess-knight text-5xl"></i>
        <span class="text-sm">Cavalier</span>
      </button>
    </form>
  </div>

  <div class="flex justify-center">
    <div
      class="inline-block text-center text-sm text-white mt-8 px-10 py-2"
      style="background-color: #202020"
    >
      Au
      <span class="font-semibold">{{ state.chess.turn() === "w" ? "BLANC" : "NOIR" }}</span>
      de jouer
    </div>
  </div>

  <div class="flex justify-center mt-4">
    <div
      :class="
        user.id === props.game.opponentId ? 'inline-block board rotate-180' : 'inline-block board'
      "
      style="background-color: #eeeed2"
    >
      <div v-for="(row, index) in board" :key="index" class="board__row flex">
        <button
          v-for="(cell, index) in row"
          :key="index"
          @click="onClickPiece(cell.piece, cell.position)"
          :class="
            user.id === props.game.opponentId
              ? 'relative w-20 h-20 text-4xl flex items-center justify-center rotate-180'
              : 'relative w-20 h-20 text-4xl flex items-center justify-center'
          "
          style="color: #202020"
        >
          <span
            v-if="cell.position === values.selectedPiece?.position"
            class="absolute w-full h-full bg-yellow-500/50"
          ></span>
          <span
            v-if="values.legalMoves.includes(cell.position)"
            class="absolute w-4 h-4 rounded-full bg-black/50"
          ></span>

          <span class="relative" v-html="cell.emoji" />
        </button>
      </div>
    </div>
  </div>
</template>
