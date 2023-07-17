<script setup>
import { reactive } from "vue";
import { useAuthStore } from "../stores/auth";

const values = reactive({ username: "", email: "", password: "" });

async function handleSubmit() {
  const auth = useAuthStore();
  await auth.signUp(values);
  console.log("VALUES :::", values);
}
</script>

<template>
  <h1>Sign Up Page</h1>

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
