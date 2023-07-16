<script setup>
import { onMounted, provide, ref } from 'vue';

const user = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3001/me', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      user.value = await response.json();
    }
  } catch (error) {
    console.log('ERROR :::', error);
  }
});

async function signUp({ username, email, password }) {
  try {
    const response = await fetch('http://localhost:3001/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('ERROR :::', error);
  }
}

async function signIn({ email, password }) {
  try {
    const response = await fetch('http://localhost:3001/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('ERROR :::', error);
  }
}

async function signOut() {
  try {
    const response = await fetch('http://localhost:3001/sign-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('ERROR :::', error);
  }
}

provide('user', user);
provide('sign-up', signUp);
provide('sign-in', signIn);
provide('sign-out', signOut);
</script>

<template>
  <slot :user="user"></slot>
</template>
