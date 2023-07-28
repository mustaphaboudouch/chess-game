<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import axios from "../lib/axios";
import { getSubscriptionPlan } from "../lib/utils";
import { toast } from "vue3-toastify";

const route = useRoute();
const user = ref(null);

onMounted(async function () {
  try {
    const response = await axios.get(`users/${route.params.id}`);
    user.value = response.data;
  } catch (error) {
    toast.error(error.message, {
      autoClose: 3000,
      position: "bottom-center"
    });
  }
});
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
</template>
