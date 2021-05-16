import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./assets/css/global.css";
import { request } from "./network/index";
import TreeTable from "vue-table-with-tree-grid";

Vue.prototype.request = request;

Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
