<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
  <h1>Home Page</h1>
  <p>Logged as : {{ user?.username }}</p>
</template>
