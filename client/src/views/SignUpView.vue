<script setup>
import { reactive } from "vue";
import { useAuthStore } from "../stores/auth";

const values = reactive({ username: "", email: "", password: "" });

const authStore = useAuthStore();

async function handleSubmit() {
  await authStore.signUp(values);
}
</script>

<template>
  <h1>Sign Up Page</h1>

  <form @submit.prevent="handleSubmit">
    <div>
      <label for="username">Username</label>
      <input id="username" type="text" v-model="values.username" />
    </div>
    <div>
      <label for="email">Email</label>
      <input id="email" type="email" v-model="values.email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input id="password" type="password" v-model="values.password" />
    </div>
    <button type="submit">Submit</button>
  </form>
</template>
