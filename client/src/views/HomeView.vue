<script setup>
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import socket, { state } from "../socket";
import { useAuthStore } from "../stores/auth";
import AdminStats from "../components/ui/AdminStats.vue";
import PlayerStats from "../components/ui/PlayerStats.vue";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

onMounted(function () {
  socket.connect();
});

onUnmounted(function () {
  socket.disconnect();
});
</script>

<template>
  <div v-if="user.role === 'ADMIN'">
    <AdminStats :stats="state.stats" />
  </div>
  <div v-else>
    <PlayerStats :stats="state.stats" />
  </div>
</template>
