<script setup>
import { reactive } from "vue";
import { useAuthStore } from "../stores/auth";

const values = reactive({ email: "", password: "" });

async function handleSubmit() {
  const authStore = useAuthStore();
  await authStore.signIn(values);
}
</script>

<template>
  <div class="max-w-xl m-auto px-8 py-6 rounded-xl" style="background-color: #202020">
    <h1 class="text-2xl text-white font-medium mb-6">Connexion</h1>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
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
          Se connecter
        </button>
      </div>
    </form>
  </div>
</template>
