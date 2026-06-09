import { createRouter, createWebHistory } from 'vue-router'

import DocentDashboard from '../pages/docent/DocentDashboard.vue'
import CommissieDashboard from '../pages/commissie/CommissieDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'DocentDashboard',
    component: DocentDashboard
  },
  {
    path: '/commissie',
    name: 'CommissieDashboard',
    component: CommissieDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router