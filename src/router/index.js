import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "",
    redirect: "login",
  },
  {
    path: "/login",
    component: () => import("../components/Login.vue"),
  },
  {
    path: "/home",
    redirect: "welcome",
    component: () => import("../components/Home.vue"),
    children: [
      {
        path: "/welcome",
        component: () => import("../components/Welcome.vue"),
      },
      {
        path: "/users",
        component: () => import("../components/user/User.vue"),
      },
      {
        path: "/rights",
        component: () => import("../components/power/Rights.vue"),
      },
      {
        path: "/roles",
        component: () => import("../components/power/Roles.vue"),
      },
    ],
  },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;
