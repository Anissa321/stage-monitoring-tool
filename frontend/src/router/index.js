import { createRouter, createWebHistory } from 'vue-router'
import DocentDashboard from '../pages/docent/DocentDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'DocentDashboard',
    component: DocentDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router