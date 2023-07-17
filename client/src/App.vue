<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth";
import Navbar from "./components/layout/Navbar.vue";

onMounted(async function () {
  const authStore = useAuthStore();
  await authStore.setUser();
});
</script>

<template>
  <Navbar />
  <main>
    <RouterView />
  </main>
</template>
