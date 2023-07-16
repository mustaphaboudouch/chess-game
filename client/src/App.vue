<script setup>
import { RouterView } from 'vue-router';
import AuthProvider from './providers/AuthProvider.vue';
import Navbar from './components/Navbar.vue';
</script>

<template>
  <AuthProvider>
    <Navbar />
    <main>
      <RouterView />
    </main>
  </AuthProvider>
</template>

<style scoped></style>
