<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";
import { useSocketStore } from "../stores/socket";

const authStore = useAuthStore();
const socketStore = useSocketStore();

const { user } = storeToRefs(authStore);
const { stats } = storeToRefs(socketStore);
</script>

<template>
  <h1>Dashboard Page</h1>

  <div v-if="stats">
    <ul v-if="user.role === 'ADMIN'">
      <li>Users (ADMIN): {{ stats.users.admins }}</li>
      <li>Users (PLAYER): {{ stats.users.players }}</li>
    </ul>

    <ul>
      <li>Games (WAITING): {{ stats.games.playing }}</li>
      <li>Games (PLAYING): {{ stats.games.playing }}</li>
      <li>Games (DONE): {{ stats.games.playing }}</li>
      <li v-if="user.role === 'PLAYER'">Games (WINS): {{ stats.games.wins }}</li>
    </ul>
  </div>
</template>
