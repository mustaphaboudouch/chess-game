<script setup>
import Navbar from "./Navbar.vue";
</script>

<template>
  <div class="min-h-screen">
    <Navbar />
    <main class="container max-2xl m-auto px-2 py-10">
      <slot />
    </main>
  </div>
</template>
