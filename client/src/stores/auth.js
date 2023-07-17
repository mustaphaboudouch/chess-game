import { defineStore } from "pinia";
import axios from "../lib/axios";
import router from "../router";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    user: null
  }),
  actions: {
    async setUser() {
      try {
        const response = await axios.get("me");
        this.user = response.data;
        router.push("/");
      } catch (error) {
        console.error(error);
        this.user = null;
      }
    },
    async signUp({ username, email, password }) {
      try {
        const response = await axios.post("sign-up", { username, email, password });
        localStorage.setItem("token", response.data.token);
        this.user = response.data.user;
        router.push("/");
      } catch (error) {
        console.error(error);
      }
    },
    async signIn({ email, password }) {
      try {
        const response = await axios.post("sign-in", { email, password });
        localStorage.setItem("token", response.data.token);
        this.user = response.data.user;
        router.push("/");
      } catch (error) {
        console.error(error);
      }
    },
    signOut() {
      localStorage.removeItem("token");
      this.user = null;
      router.push("/sign-in");
    }
  }
});
