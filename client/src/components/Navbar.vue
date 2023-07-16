<script setup>
import { inject } from 'vue';
import { RouterLink } from 'vue-router';

const user = inject('user');
const signOut = inject('sign-out');

async function handleClick() {
  const data = await signOut();
  console.log('DATA :::', data);
}
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/sign-in">Login</RouterLink>
    <RouterLink to="/sign-up">Register</RouterLink>
    <p>{{ user?.username }}</p>
    <button @click="handleClick">Sign out</button>
  </nav>
</template>
