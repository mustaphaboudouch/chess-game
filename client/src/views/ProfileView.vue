<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "../lib/axios";
import { getSubscriptionPlan } from "../lib/utils";

const user = ref(null);

onMounted(async function () {
  try {
    const response = await axios.get("me");
    user.value = response.data;
  } catch (error) {
    console.log(error.message);
  }
});

const plan = computed(function () {
  return getSubscriptionPlan(user.value);
});

async function handleClick() {
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

  <div v-if="!user">
    <p>Loading ...</p>
  </div>

  <div v-if="!!user">
    <ul>
      <li>Username : {{ user?.username }}</li>
      <li>Email : {{ user?.email }}</li>
      <li>Role : {{ user?.role }}</li>
      <li>Score : {{ user?.score }}</li>
      <li>Plan : {{ plan }}</li>
    </ul>

    <button @click="handleClick">
      <span v-if="plan === 'FREE'">Upgrade to PRO</span>
      <span v-else>Manage Subscription</span>
    </button>
  </div>
</template>
