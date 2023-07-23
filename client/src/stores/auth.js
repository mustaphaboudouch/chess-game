import { onMounted, ref } from "vue";
import { defineStore } from "pinia";
import axios from "../lib/axios";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);

  onMounted(() => {
    const token = localStorage.getItem("token");
    if (token) {
      user.value = JSON.parse(atob(token.split(".")[1]));
    }
  });

  async function signUp({ username, email, password }) {
    try {
      const response = await axios.post("sign-up", { username, email, password });
      localStorage.setItem("token", response.data.token);
      location.reload();
    } catch (error) {
      console.log(error);
    }
  }

  async function signIn({ email, password }) {
    try {
      const response = await axios.post("sign-in", { email, password });
      localStorage.setItem("token", response.data.token);
      location.reload();
    } catch (error) {
      console.log(error.message);
    }
  }

  function signOut() {
    localStorage.removeItem("token");
    user.value = null;
    router.push("/sign-in");
  }

  return { user, signUp, signIn, signOut };
});
