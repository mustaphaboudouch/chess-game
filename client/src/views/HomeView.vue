<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const { user } = storeToRefs(auth);
</script>

<template>
  <h1>Home Page</h1>
  <p>Logged as : {{ user?.username }}</p>
</template>
