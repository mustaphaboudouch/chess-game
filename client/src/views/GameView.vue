<script setup>
import { reactive } from "vue";

const values = reactive({ code: "" });
</script>

<template>
  <h1>Game Page</h1>

  <button @click="handleClick">Create match</button>

  <form @submit.prevent="handleSubmit">
    <input id="username" type="text" v-model="values.code" />
    <button type="submit">Join match</button>
  </form>
</template>
