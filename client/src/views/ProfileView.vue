<script setup>
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import axios from "../lib/axios";
import { getSubscriptionPlan } from "../lib/utils";
import { toast } from "vue3-toastify";

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
    toast.error(error.message, {
      autoClose: 3000,
      position: "bottom-center"
    });
  }
}

onMounted(async function () {
  try {
    const response = await axios.get("me");
    user.value = response.data;
    username.value = response.data.username;
  } catch (error) {
    toast.error(error.message, {
      autoClose: 3000,
      position: "bottom-center"
    });
  }
});

async function onSubscribe() {
  try {
    const response = await axios.get("subscribe");
    window.location.href = response.data.url;
  } catch (error) {
    toast.error(error.message, {
      autoClose: 3000,
      position: "bottom-center"
    });
  }
}
</script>

<template>
  <h1 class="text-white text-3xl mb-6">
    {{ user?.username }}
    <span class="text-base ml-2" style="color: #818181">{{ user?.email }}</span>
  </h1>

  <div
    v-if="user"
    class="flex items-center px-12 py-10 gap-12 rounded-2xl"
    style="background-color: #202020"
  >
    <div class="flex-1 flex items-center">
      <div class="flex-1 flex flex-col text-center items-center gap-2" style="color: #818181">
        <i class="fa-solid fa-chess-knight text-4xl"></i>
        <span class="text-sm">{{ user?.gamesCount }}</span>
      </div>
      <div class="flex-1 flex flex-col text-center items-center gap-2" style="color: #818181">
        <i class="fa-solid fa-calendar-days text-4xl"></i>
        <span class="text-sm">{{ dayjs(user?.createdAt).format("MMM DD, YYYY") }}</span>
      </div>
      <div class="flex-1 flex flex-col text-center items-center gap-2" style="color: #818181">
        <i class="fa-solid fa-credit-card text-4xl"></i>
        <span class="text-sm">{{ getSubscriptionPlan(user) }}</span>
      </div>
      <div class="flex-1 flex flex-col text-center items-center gap-2" style="color: #818181">
        <i class="fa-solid fa-trophy text-4xl"></i>
        <span class="text-sm">{{ user?.score }}</span>
      </div>
    </div>
  </div>

  <div v-if="user" class="px-12 py-10 gap-12 rounded-2xl mt-6" style="background-color: #202020">
    <h3 class="text-lg text-white mb-3 font-medium">Modifier profil</h3>
    <form @submit.prevent="onUpdateProfile">
      <div>
        <label for="username" class="block text-sm mb-2" style="color: #818181">Username</label>
        <input id="username" type="text" v-model="username" class="w-full p-3 rounded-md" />
      </div>
      <div class="text-right">
        <button
          type="submit"
          class="text-white uppercase text-sm font-medium py-3 px-4 rounded-md mt-2"
          style="background-color: #68a741"
        >
          Modifier
        </button>
      </div>
    </form>
  </div>

  <div v-if="user" class="px-12 py-10 gap-12 rounded-2xl mt-6" style="background-color: #202020">
    <h3 class="text-lg text-white mb-3 font-medium">Subscription</h3>
    <p class="block text-sm mb-2" style="color: #818181">
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est, vitae fugit? Praesentium illum
      labore perferendis aperiam quisquam. Veniam placeat, aut assumenda, quidem velit aspernatur
      voluptates voluptate sed pariatur numquam dignissimos.
    </p>
    <button
      @click="onSubscribe"
      class="text-white uppercase text-sm font-medium py-3 px-4 rounded-md mt-2"
      style="background-color: #68a741"
    >
      <span v-if="plan === 'FREE'">Upgrade to PRO</span>
      <span v-else>Manage Subscription</span>
    </button>
  </div>
</template>
