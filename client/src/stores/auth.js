import axios from "axios";
import { defineStore } from "pinia";
import router from "../router";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    user: null
  }),
  getters: {
    getUser: (state) => state.user
  },
  actions: {
    async setUser() {
      try {
        const response = await axios.get("http://localhost:3001/me", {
          withCredentials: true
        });
        this.user = response.data;
      } catch (error) {
        console.error(error);
        this.user = null;
      }
    },
    async signUp({ username, email, password }) {
      try {
        await axios.post(
          "http://localhost:3001/sign-up",
          { username, email, password },
          { withCredentials: true }
        );
        router.push("/");
      } catch (error) {
        console.error(error);
      }
    },
    async signIn({ email, password }) {
      try {
        await axios.post(
          "http://localhost:3001/sign-in",
          { email, password },
          { withCredentials: true }
        );
        router.push("/");
      } catch (error) {
        console.error(error);
      }
    },
    async signOut() {
      try {
        await axios.post("http://localhost:3001/sign-out", {
          withCredentials: true
        });
        this.user = null;
        router.push("/sign-in");
      } catch (error) {
        console.error(error);
      }
    }
  }
});
