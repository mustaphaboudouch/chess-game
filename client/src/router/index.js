import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import HomeView from "../views/HomeView.vue";
import BoardView from "../views/BoardView.vue";
import ProfileView from "../views/ProfileView.vue";
import SignInView from "../views/SignInView.vue";
import SignUpView from "../views/SignUpView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: "active",
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        isPrivate: true
      }
    },
    {
      path: "/board",
      name: "board",
      component: BoardView,
      meta: {
        isPrivate: true
      }
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: {
        isPrivate: true
      }
    },
    {
      path: "/sign-in",
      name: "sign-in",
      component: SignInView,
      meta: {
        isAuth: true
      }
    },
    {
      path: "/sign-up",
      name: "sign-up",
      component: SignUpView,
      meta: {
        isAuth: true
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Auth routes : redirect to `home` if user is authenticated
  if (to.meta.isAuth && authStore.user) {
    return next("/");
  }

  // Private routes : redirect to `sign-in` if user is unauthenticated
  if (to.meta.isPrivate && !authStore.user) {
    return next("/sign-in");
  }

  return next();
});

export default router;
