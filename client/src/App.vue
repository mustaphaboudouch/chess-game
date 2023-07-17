<script setup>
import { onMounted } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth";

onMounted(async function () {
  const auth = useAuthStore();
  await auth.setUser();
});
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/sign-in">Sign In</RouterLink>
    <RouterLink to="/sign-up">Sign Up</RouterLink>
    <button @click="auth.signOut">Sign Out</button>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
