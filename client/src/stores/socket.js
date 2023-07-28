import { reactive } from "vue";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import router from "../router";
import { toast } from "vue3-toastify";

export const state = reactive({
  chess: new Chess(),
  stats: null,
  game: null,
  games: [],
  adminGames: {
    WAITING: [],
    PLAYING: [],
    DONE: [],
    CANCELED: []
  }
});

const socket = io("http://localhost:3001", {
  autoConnect: true,
  auth: {
    token: "Bearer " + localStorage.getItem("token")
  }
});

/**
 * Actions
 */

export function updateBoard(fen) {
  state.game = { ...state.game, fen };
  state.chess = new Chess(fen);
}

/**
 * Global events
 */

socket.on("connect", function () {
  console.log("Connected");
});

socket.on("disconnect", function () {
  console.log("Disconnected");
});

socket.on("connect_error", function () {});

/**
 * Stats events
 */

socket.on("stats", function ({ stats }) {
  state.stats = stats;
});

/**
 * Game events
 */

socket.on("game-admin-list", function ({ games }) {
  state.adminGames = { ...state.adminGames, ...games };
});

socket.on("game-list", function ({ games }) {
  state.games = games;
});

socket.on("game-current", function ({ game: newGame }) {
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-create-success", function ({ game: newGame }) {
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
  router.push("/board");
});

socket.on("game-create-failed", function ({ message }) {
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center"
  });
});

socket.on("game-join-success", function ({ game: newGame }) {
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
  router.push("/board");
});

socket.on("game-join-failed", function ({ message }) {
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center"
  });
});

socket.on("game-move-success", function ({ game: newGame }) {
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-move-failed", function ({ game: newGame, message }) {
  state.game = newGame;
  state.chess = newGame ? new Chess(newGame.fen) : new Chess();
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center"
  });
});

socket.on("game-quit-success", function () {
  state.game = null;
  state.chess = new Chess();
  router.push("/game");
});

socket.on("game-quit-failed", function ({ message }) {
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center"
  });
});

socket.on("game-checkmate", function ({ game: newGame }) {
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-draw", function ({ game: newGame }) {
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-cancel-success", function () {
  state.game = null;
  state.chess = new Chess();
  // router.push("/game");
});

socket.on("game-cancel-failed", function ({ message }) {
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center"
  });
});

socket.on("game-delete-success", function () {
  state.game = null;
  state.chess = new Chess();
  // router.push("/game");
});

socket.on("game-delete-failed", function ({ message }) {
  toast.error(message, {
    autoClose: 3000,
    position: "bottom-center"
  });
});

export default socket;
