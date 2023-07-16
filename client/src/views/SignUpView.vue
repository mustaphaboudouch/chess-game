<script setup>
import { inject, reactive } from 'vue';

const values = reactive({ username: '', email: '', password: '' });

const signUp = inject('sign-up');

async function handleSubmit() {
  const data = await signUp({ ...values });
  console.log('DATA from REGISTER FORM :::', data);
}
</script>

<template>
  <h1>Sign up page</h1>

  <form @submit.prevent="handleSubmit">
    <div>
      <label for="username">Username</label>
      <input v-model="values.username" id="username" type="text" />
    </div>
    <div>
      <label for="email">Email</label>
      <input v-model="values.email" type="email" id="email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input v-model="values.password" type="password" id="password" />
    </div>
    <button type="submit">Submit</button>
  </form>
</template>
