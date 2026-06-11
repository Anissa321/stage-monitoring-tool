import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/auth/LoginPage.vue'
import StudentDashboard from '../pages/student/StudentDashboard.vue'
import DocentDashboard from '../pages/docent/DocentDashboard.vue'
import CommissieDashboard from '../pages/commissie/CommissieDashboard.vue'
import MentorDashboard from '../pages/mentor/MentorDashboard.vue'
import AdminDashboard from '../pages/admin/AdminDashboard.vue'
import LogboekAftekenen from '../pages/mentor/LogboekAftekenen.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
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
    path: '/mentor/logboek',
    name: 'MentorLogboek',
    component: LogboekAftekenen
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.path === '/login') {
    next()
    return
  }

  if (!token) {
    next('/login')
    return
  }

  if (to.path.startsWith('/student') && role !== 'student') {
    next('/login')
    return
  }

  if (to.path.startsWith('/docent') && role !== 'docent') {
    next('/login')
    return
  }

  if (to.path.startsWith('/mentor') && role !== 'mentor') {
    next('/login')
    return
  }

  if (to.path.startsWith('/commissie') && role !== 'stagecommissie') {
    next('/login')
    return
  }

  if (to.path.startsWith('/admin') && role !== 'administratie') {
    next('/login')
    return
  }

  next()
})

export default router