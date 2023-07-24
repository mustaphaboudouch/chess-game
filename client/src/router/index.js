import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import ProfileView from "../views/ProfileView.vue";
import SignInView from "../views/SignInView.vue";
import SignUpView from "../views/SignUpView.vue";
import HomeView from "../views/HomeView.vue";
import GameView from "../views/GameView.vue";
import BoardView from "../views/BoardView.vue";
import UsersView from "../views/UsersView.vue";
import UserView from "../views/UserView.vue";

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
      path: "/game",
      name: "game",
      component: GameView,
      meta: {
        isPrivate: true
      }
    },
    {
      path: "/users",
      name: "users",
      component: UsersView,
      meta: {
        isPrivate: true,
        isAdmin: true
      }
    },
    {
      path: "/users/:id",
      name: "user",
      component: UserView,
      meta: {
        isPrivate: true,
        isAdmin: true
      }
    },
    {
      path: "/game/:id",
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

  // Auth routes : redirect to `dashboard` if user is authenticated
  if (to.meta.isAuth && authStore.user) {
    return next("/");
  }

  // Private routes : redirect to `sign-in` if user is unauthenticated
  if (to.meta.isPrivate && !authStore.user) {
    return next("/sign-in");
  }

  // Admin routes : redirect to `dashboard` if user is not admin
  if (to.meta.isAdmin && authStore.user && authStore.user.role !== "ADMIN") {
    return next("/");
  }

  return next();
});

export default router;
