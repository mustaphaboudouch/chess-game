<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/sign-in">Sign In</RouterLink>
    <RouterLink to="/sign-up">Sign Up</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
