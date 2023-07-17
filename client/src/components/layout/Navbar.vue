<script setup>
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

async function handleClick() {
  await authStore.signOut();
}
</script>

<template>
  <nav>
    <template v-if="!!user">
      <RouterLink to="/">Home</RouterLink>
      <button @click="handleClick">Sign Out</button>
    </template>
    <template v-if="!user">
      <RouterLink to="/sign-in">Sign In</RouterLink>
      <RouterLink to="/sign-up">Sign Up</RouterLink>
    </template>
  </nav>
</template>
