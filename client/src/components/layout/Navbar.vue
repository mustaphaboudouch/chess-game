<script setup>
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
  <header style="background-color: #202020">
    <div class="flex items-center gap-8 container max-2xl m-auto p-2">
      <RouterLink to="/" class="hover:text-white">
        <img src="../../assets/images/logo.png" class="h-14" />
      </RouterLink>
      <nav
        class="flex-1 flex items-center gap-4 text-sm uppercase font-medium"
        style="color: #818181"
      >
        <template v-if="!!user">
          <RouterLink to="/" class="hover:text-white">Dashboard</RouterLink>
          <RouterLink to="/game" class="hover:text-white">Jouer</RouterLink>
          <template v-if="user.role === 'ADMIN'">
            <RouterLink to="/users" class="hover:text-white">Utilisateurs</RouterLink>
            <RouterLink to="/games" class="hover:text-white">Parties</RouterLink>
          </template>
          <RouterLink to="/profile" class="hover:text-white">Profil</RouterLink>
        </template>
      </nav>
      <nav class="flex items-center gap-4 font-medium">
        <template v-if="!!user">
          <span class="text-sm text-white">Bienvenue, {{ user.username }}</span>
          <button
            @click="authStore.signOut"
            class="inline-block text-white uppercase text-xs font-medium py-2 px-4 rounded-md mt-2"
            style="background-color: #68a741"
          >
            Déconnexion
          </button>
        </template>
        <template v-if="!user">
          <RouterLink
            to="/sign-in"
            class="inline-block bg-transparent border border-white text-white uppercase text-xs font-medium py-2 px-4 rounded-md mt-2"
          >
            Se connecter
          </RouterLink>
          <RouterLink
            to="/sign-up"
            class="inline-block text-white uppercase text-xs font-medium py-2 px-4 rounded-md mt-2"
            style="background-color: #68a741"
          >
            S'inscrire
          </RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
