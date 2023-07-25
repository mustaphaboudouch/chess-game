import { reactive } from "vue";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import router from "./router";

export const state = reactive({
  chess: new Chess(),
  game: null,
  stats: null
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

socket.on("game-current", function ({ game: newGame }) {
  console.log("game-current", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
});

socket.on("game-create-success", function ({ game: newGame }) {
  console.log("game-create-success", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
  router.push(`/game/${state.game._id}`);
});

socket.on("game-create-failed", function ({ message }) {
  console.log("game-create-failed", message);
});

socket.on("game-join-success", function ({ game: newGame }) {
  console.log("game-join-success", newGame);
  state.game = newGame;
  state.chess = new Chess(newGame.fen);
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

socket.on("game-checkmate", function () {
  console.log("GAME CHECKMATE *************");
});

socket.on("game-draw", function () {
  console.log("GAME DRAW *************");
});

export default socket;
