import { ref } from "vue";
import { defineStore } from "pinia";
import { io } from "socket.io-client";
import router from "../router";

export const useSocketStore = defineStore("socket", () => {
  const socket = io("http://localhost:3001", {
    auth: {
      token: "Bearer " + localStorage.getItem("token")
    }
  });

  const game = ref(null);

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
    console.log("game-current");
    game.value = newGame;
  });

  socket.on("game-create-success", function ({ game: newGame }) {
    console.log("game-create-success");
    game.value = newGame;
    router.push(`/game/${game.value._id}`);
  });

  socket.on("game-create-failed", function ({ message }) {
    console.log("game-create-failed", message);
  });

  socket.on("game-join-success", function ({ game: newGame }) {
    console.log("game-join-success");
    game.value = newGame;
  });

  socket.on("game-join-failed", function ({ message }) {
    console.log("game-join-failed", message);
  });

  return { socket, game };
});
