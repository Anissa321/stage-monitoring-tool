import { createRouter, createWebHistory } from 'vue-router'

import StudentDashboard from '../pages/student/StudentDashboard.vue'
import DocentDashboard from '../pages/docent/DocentDashboard.vue'
import CommissieDashboard from '../pages/commissie/CommissieDashboard.vue'
import MentorDashboard from '../pages/mentor/MentorDashboard.vue'
import AdminDashboard from '../pages/admin/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/student'
  },
  {
    path: '/student',
    name: 'StudentDashboard',
    component: StudentDashboard
  },
  {
    path: '/docent',
    name: 'DocentDashboard',
    component: DocentDashboard
  },
  {
    path: '/commissie',
    name: 'CommissieDashboard',
    component: CommissieDashboard
  },
  {
    path: '/mentor',
    name: 'MentorDashboard',
    component: MentorDashboard
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router