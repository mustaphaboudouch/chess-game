<script setup>
import { reactive } from "vue";
import { useAuthStore } from "../stores/auth";

const values = reactive({ email: "", password: "" });

async function handleSubmit() {
  const authStore = useAuthStore();
  await authStore.signIn(values);
}
</script>

<template>
  <h1>Sign In Page</h1>

  <form @submit.prevent="handleSubmit">
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
