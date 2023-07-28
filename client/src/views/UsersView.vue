<script setup>
import { onMounted, ref } from "vue";
import axios from "../lib/axios";
import { RouterLink } from "vue-router";
import { toast } from "vue3-toastify";

const users = ref([]);

onMounted(async function () {
  try {
    const response = await axios.get("users");
    users.value = response.data;
  } catch (error) {
    toast.error(error.message, {
      autoClose: 3000,
      position: "bottom-center"
    });
  }
});

async function onDeleteUser(userId) {
  try {
    const isConfirmed = window.confirm("Voulez vous supprimer cet utilisateur ?");
    if (!isConfirmed) return;

    const response = await axios.delete(`users/${userId}`);
    users.value = response.data;
  } catch (error) {
    toast.error(error.message, {
      autoClose: 3000,
      position: "bottom-center"
    });
  }
}
</script>

<template>
  <h1 class="text-white text-3xl mb-6">Utilisateurs</h1>

  <table class="w-full rounded-2xl" style="background-color: #202020">
    <tr
      class="text-sm uppercase font-medium"
      style="color: #818181; border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">Nom d'utilisateur</td>
      <td class="px-6 py-5">Adresse e-mail</td>
      <td class="px-6 py-5">Score</td>
      <td></td>
    </tr>
    <tr
      v-for="(user, index) in users"
      :key="index"
      class="text-white"
      style="border-bottom: 1px solid #282828"
    >
      <td class="px-6 py-5">
        <RouterLink :to="`/users/${user.id}`">{{ user.username }}</RouterLink>
      </td>
      <td class="px-6 py-5">
        {{ user.email }}
      </td>
      <td class="px-6 py-5">
        {{ user.score }}
      </td>
      <td class="px-6 py-5">
        <div class="flex items-center justify-end gap-4">
          <RouterLink
            :to="`/users/${user.id}`"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Voir
          </RouterLink>
          <button
            @click="onDeleteUser(user.id)"
            class="text-sm hover:underline"
            style="color: #818181"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  </table>
</template>
