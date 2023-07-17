<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
  <h1>Profile Page</h1>

  <ul>
    <li>Username : {{ user?.username }}</li>
    <li>Email : {{ user?.email }}</li>
    <li>Role : {{ user?.role }}</li>
    <li>Score : {{ user?.score }}</li>
  </ul>
</template>
