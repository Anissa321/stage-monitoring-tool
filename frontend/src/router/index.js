import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/auth/LoginPage.vue'
import StudentDashboard from '../pages/student/StudentDashboard.vue'
import DocentDashboard from '../pages/docent/DocentDashboard.vue'
import CommissieDashboard from '../pages/commissie/CommissieDashboard.vue'
import CommissieOverzicht from '../pages/commissie/OverzichtBeoordeeldeStages.vue'
import MentorDashboard from '../pages/mentor/MentorDashboard.vue'
import MentorStagiairs from '../pages/mentor/MentorStagiairs.vue'
import AdminDashboard from '../pages/admin/AdminDashboard.vue'
import LogboekAftekenen from '../pages/mentor/LogboekAftekenen.vue'
import LogboekOverzicht from '../pages/student/LogboekOverzicht.vue'
import LogboekInvullen from '../pages/student/LogboekInvullen.vue'
import LogboekBekijken from '../pages/docent/LogboekBekijken.vue'
import StudentDetailMentor from '../pages/mentor/StudentDetailMentor.vue'
import StagevoorstelIndienen from '../pages/student/StagevoorstelIndienen.vue'
import StagevoorstelDetail from '../pages/student/StagevoorstelDetail.vue'
import StagevoorstelBeoordelen from '../pages/commissie/StagevoorstelBeoordelen.vue'
import AdminCompetencies from '../pages/admin/AdminCompetencies.vue'
import FeedbackGeven from '../pages/commissie/FeedbackGeven.vue'
import CommissieAanvragen from '../pages/commissie/CommissieAanvragen.vue'
import MijnStudenten from '../pages/docent/MijnStudenten.vue'
import Documenten from '../pages/student/Documenten.vue'
import TussentijdseFeedback from '../pages/mentor/TussentijdseFeedback.vue'
import EvaluatieKeuze from '../pages/student/EvaluatieKeuze.vue'
import EvaluatieRubriek from '../pages/student/EvaluatieRubriek.vue'
import TussentijdsRapportStudent from '../pages/student/TussentijdsRapportStudent.vue'
import Eindrapport from '../pages/student/Eindrapport.vue'
import DocentStudentDetail from '../pages/docent/DocentStudentDetail.vue'
import TussentijdseBespreking from '../pages/docent/TussentijdseBespreking.vue'
import DocentEindrapport from '../pages/docent/DocentEindrapport.vue'
import DocentEvaluaties from '../pages/docent/DocentEvaluaties.vue'
import MentorEvaluaties from '../pages/mentor/MentorEvaluaties.vue'
import EindevaluatieMentor from '../pages/mentor/EindevaluatieMentor.vue'
import AdminGebruikers from '../pages/admin/AdminGebruikers.vue'
import AdminKoppelingen from '../pages/admin/AdminKoppelingen.vue'
import AdminOpleidingen from '../pages/admin/AdminOpleidingen.vue'
import TussentijdsRapport from '../pages/docent/TussentijdsRapport.vue'
import TussentijdsRapportOverzicht from '../pages/docent/TussentijdsRapportOverzicht.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'LoginPage', component: LoginPage },

  // STUDENT
  { path: '/student', redirect: '/student/dashboard' },
  { path: '/student/dashboard', name: 'StudentDashboard', component: StudentDashboard },
  { path: '/student/logboek', name: 'LogboekOverzicht', component: LogboekOverzicht },
  { path: '/student/logboek-invullen', name: 'LogboekInvullen', component: LogboekInvullen },
  { path: '/student/stagevoorstel', name: 'StagevoorstelIndienen', component: StagevoorstelIndienen },
  { path: '/student/stagevoorstel/detail', name: 'StagevoorstelDetail', component: StagevoorstelDetail },
  { path: '/student/documenten', name: 'Documenten', component: Documenten },
  { path: '/student/evaluatie', name: 'EvaluatieKeuze', component: EvaluatieKeuze },
  { path: '/student/evaluatie/tussentijds', name: 'EvaluatieRubriek', component: EvaluatieRubriek },
  { path: '/student/evaluatie/tussentijds-rapport', name: 'TussentijdsRapportStudent', component: TussentijdsRapportStudent },
  { path: '/student/eindrapport', name: 'Eindrapport', component: Eindrapport },
  
  


  // DOCENT
  { path: '/docent', redirect: '/docent/dashboard' },
  { path: '/docent/dashboard', name: 'DocentDashboard', component: DocentDashboard },
  { path: '/docent/logboek', name: 'DocentLogboek', component: LogboekBekijken },
  { path: '/docent/studenten', name: 'MijnStudenten', component: MijnStudenten },
  { path: '/docent/studenten/:id', name: 'DocentStudentDetail', component: DocentStudentDetail },
  { path: '/docent/studenten/:id/bespreking', name: 'TussentijdseBespreking', component: TussentijdseBespreking },
  { path: '/docent/studenten/:id/eindrapport', name: 'DocentEindrapport', component: DocentEindrapport },
  { path: '/docent/evaluaties', name: 'DocentEvaluaties', component: DocentEvaluaties },
  { path: '/docent/studenten/:id/tussentijds-rapport', name: 'TussentijdsRapport', component: TussentijdsRapport },
  { path: '/docent/studenten/:id/tussentijds-rapport/overzicht', name: 'TussentijdsRapportOverzicht', component: TussentijdsRapportOverzicht },

  // MENTOR
  { path: '/mentor', redirect: '/mentor/dashboard' },
  { path: '/mentor/dashboard', name: 'MentorDashboard', component: MentorDashboard },
  { path: '/mentor/stagiairs', name: 'MentorStagiairs', component: MentorStagiairs },
  { path: '/mentor/student/:id', name: 'StudentDetailMentor', component: StudentDetailMentor },
  { path: '/mentor/week/:studentId/:weekNummer', name: 'WeekAftekenen', component: LogboekAftekenen },
  { path: '/mentor/student/:id/feedback', name: 'TussentijdseFeedback', component: TussentijdseFeedback },
  { path: '/mentor/evaluaties', name: 'MentorEvaluaties', component: MentorEvaluaties },
  { path: '/mentor/student/:id/eindevaluatie', name: 'EindevaluatieMentor', component: EindevaluatieMentor },

  // COMMISSIE
  { path: '/commissie', redirect: '/commissie/dashboard' },
  { path: '/commissie/dashboard', name: 'CommissieDashboard', component: CommissieDashboard },
  { path: '/commissie/aanvragen', name: 'CommissieAanvragen', component: CommissieAanvragen },
  { path: '/commissie/stagevoorstel/:id', name: 'StagevoorstelBeoordelen', component: StagevoorstelBeoordelen },
  { path: '/commissie/overzicht', name: 'CommissieOverzicht', component: CommissieOverzicht },
  { path: '/commissie/feedback-geven', name: 'FeedbackGeven', component: FeedbackGeven },

  // ADMIN
  { path: '/admin', redirect: '/admin/dashboard' },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/admin/competenties', name: 'AdminCompetencies', component: AdminCompetencies },
  { path: '/admin/gebruikers', name: 'AdminGebruikers', component: AdminGebruikers },
  { path: '/admin/koppelingen', name: 'AdminKoppelingen', component: AdminKoppelingen },
  { path: '/admin/opleidingen', name: 'AdminOpleidingen', component: AdminOpleidingen }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const studentToegestaanZonderOvereenkomst = [
  '/student/dashboard',
  '/student/documenten',
  '/student/stagevoorstel',
  '/student/stagevoorstel/detail'
]

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.path === '/login') {
    if (token && role) {
      const target = role === 'stagecommissie' ? 'commissie' : role === 'administratie' ? 'admin' : role
      next(`/${target}/dashboard`)
    } else {
      next()
    }
    return
  }

  if (!token) { next('/login'); return }
  if (to.path.startsWith('/student') && role !== 'student') { next('/login'); return }
  if (to.path.startsWith('/docent') && role !== 'docent') { next('/login'); return }
  if (to.path.startsWith('/mentor') && role !== 'mentor') { next('/login'); return }
  if (to.path.startsWith('/commissie') && role !== 'stagecommissie') { next('/login'); return }
  if (to.path.startsWith('/admin') && role !== 'administratie') { next('/login'); return }

  if (role === 'student' && to.path.startsWith('/student')) {
    const getekend = localStorage.getItem('overeenkomstGetekend') === 'true'
    if (!getekend && !studentToegestaanZonderOvereenkomst.includes(to.path)) {
      next('/student/documenten')
      return
    }
  }

  if (role === 'mentor' && to.path.startsWith('/mentor/week/')) {
    const studentId = to.params.studentId
    const statusMap = JSON.parse(localStorage.getItem('overeenkomstenMentor') || '{}')
    if (!statusMap[studentId]) {
      next('/mentor/stagiairs')
      return
    }
  }

  next()
})

export default router