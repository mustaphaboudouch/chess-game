<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";
import axios from "../lib/axios";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

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

  <ul>
    <li>Username : {{ user?.username }}</li>
    <li>Email : {{ user?.email }}</li>
    <li>Role : {{ user?.role }}</li>
    <li>Score : {{ user?.score }}</li>
    <li>Stripe Customer Id : {{ user?.stripeCustomerId }}</li>
  </ul>

  <button @click="handleClick">Upgrade to PRO</button>
</template>