<script setup>
import { onMounted, ref } from "vue";
import axios from "../lib/axios";
import { RouterLink } from "vue-router";

const users = ref([]);

onMounted(async function () {
  try {
    const response = await axios.get("users");
    users.value = response.data;
  } catch (error) {
    console.log(error.message);
  }
});

async function onDeleteUser(userId) {
  try {
    const response = await axios.delete(`users/${userId}`);
    users.value = response.data;
  } catch (error) {
    console.log(error.message);
  }
}
</script>

<template>
  <h1>Users Page</h1>

  <div v-for="(user, index) in users" :key="index">
    <div>
      <RouterLink :to="`/users/${user._id}`">{{ user.username }}</RouterLink>
      <button @click="onDeleteUser(user._id)">DELETE</button>
    </div>
  </div>
</template>
