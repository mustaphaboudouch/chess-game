<script setup>
import { reactive } from "vue";
import { useAuthStore } from "../stores/auth";

const values = reactive({ username: "", email: "", password: "" });

const authStore = useAuthStore();

async function handleSubmit() {
  await authStore.signUp(values);
}
</script>

<template>
  <div class="max-w-xl m-auto px-8 py-6 rounded-xl" style="background-color: #202020">
    <h1 class="text-2xl text-white font-medium mb-6">Inscription</h1>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="username" style="color: #818181">Nom d'utilisateur</label>
        <input
          id="username"
          type="text"
          v-model="values.username"
          class="w-full px-4 py-2 rounded-md"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="email" style="color: #818181">Email</label>
        <input id="email" type="email" v-model="values.email" class="w-full px-4 py-2 rounded-md" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="password" style="color: #818181">Mot de passe</label>
        <input
          id="password"
          type="password"
          v-model="values.password"
          class="w-full px-4 py-2 rounded-md"
        />
      </div>

      <div class="flex">
        <button
          type="submit"
          class="text-white uppercase text-sm font-medium py-3 px-4 rounded-md mt-2"
          style="background-color: #68a741"
        >
          S'inscrire
        </button>
      </div>
    </form>
  </div>
</template>
