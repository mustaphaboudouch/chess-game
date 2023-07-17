<script setup>
import { reactive } from "vue";

const values = reactive({ email: "", password: "" });

function handleSubmit() {
  console.log("VALUES :::", values);
}
</script>

<template>
  <h1>Sign In Page</h1>

  <form @submit.prevent="handleSubmit">
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
