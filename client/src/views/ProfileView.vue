<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "../lib/axios";
import { getSubscriptionPlan } from "../lib/utils";

const user = ref(null);
const username = ref(null);

const plan = computed(function () {
  return getSubscriptionPlan(user.value);
});

async function onUpdateProfile() {
  try {
    const response = await axios.put("update-profile", { username: username.value });
    user.value = response.data;
  } catch (error) {
    console.log(error.message);
  }
}

onMounted(async function () {
  try {
    const response = await axios.get("me");
    user.value = response.data;
    username.value = response.data.username;
  } catch (error) {
    console.log(error.message);
  }
});

async function onSubscribe() {
  try {
    const response = await axios.get("subscribe");
    window.location.href = response.data.url;
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <h1>Profile Page</h1>

  <div v-if="!!user">
    <ul>
      <li>Id : {{ user?.id }}</li>
      <li>Username : {{ user?.username }}</li>
      <li>Email : {{ user?.email }}</li>
      <li>Role : {{ user?.role }}</li>
      <li>Score : {{ user?.score }}</li>
      <li>Plan : {{ plan }}</li>
    </ul>

    <form @submit.prevent="onUpdateProfile">
      <div>
        <label for="username">Username</label>
        <input id="username" type="text" v-model="username" />
      </div>
      <button type="submit">Update</button>
    </form>

    <button @click="onSubscribe">
      <span v-if="plan === 'FREE'">Upgrade to PRO</span>
      <span v-else>Manage Subscription</span>
    </button>
  </div>
</template>
