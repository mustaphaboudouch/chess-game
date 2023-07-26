import { reactive } from "vue";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import router from "./router";

export const state = reactive({
  chess: new Chess(),
  stats: null,
  game: null,
  games: []
});

const socket = io("http://localhost:3001", {
  autoConnect: true,
  auth: {
    token: "Bearer " + localStorage.getItem("token")
  }
});

/**
 * Global events
 */

socket.on("connect", function () {
  console.log("Connected");
});

socket.on("disconnect", function () {
  console.log("Disconnected");
});

socket.on("connect_error", function (error) {
  console.log(error.message);
});

/**
 * Game events
 */

socket.on("game-list", function ({ games }) {
  console.log("game-list", games);
  state.games = games;
});

socket.on("game-current", function ({ game: newGame }) {
  console.log("game-current", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-create-success", function ({ game: newGame }) {
  console.log("game-create-success", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
  router.push("/board");
});

socket.on("game-create-failed", function ({ message }) {
  console.log("game-create-failed", message);
});

socket.on("game-join-success", function ({ game: newGame }) {
  console.log("game-join-success", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
  router.push("/board");
});

socket.on("game-join-failed", function ({ message }) {
  console.log("game-join-failed", message);
});

socket.on("game-move-success", function ({ game: newGame }) {
  console.log("game-move-success", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-move-failed", function ({ message }) {
  console.log("game-move-failed", message);
});

socket.on("game-quit-success", function () {
  console.log("game-quit-failed");
  state.game = null;
  state.chess = new Chess();
  router.push("/game");
});

socket.on("game-quit-failed", function () {
  console.log("game-quit-failed");
});

socket.on("game-checkmate", function ({ game: newGame }) {
  console.log("game-checkmate", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-draw", function ({ game: newGame }) {
  console.log("game-draw");
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

export default socket;
