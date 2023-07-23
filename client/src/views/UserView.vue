<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "../lib/axios";

const route = useRoute();
const user = ref(null);

onMounted(async function () {
  try {
    const response = await axios.get(`users/${route.params.id}`);
    user.value = response.data;
  } catch (error) {
    console.log(error.message);
  }
});
</script>

<template>
  <h1>User Page</h1>

  <ul>
    <li>Username : {{ user?.username }}</li>
    <li>Email : {{ user?.email }}</li>
    <li>Score : {{ user?.score }}</li>
  </ul>
</template>
