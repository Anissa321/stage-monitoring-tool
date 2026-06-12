<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logboeken = ref([])
const loading = ref(true)
const error = ref('')
const user = ref(null)
const weekFeedback = ref({})

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [logRes, dashRes] = await Promise.all([
      fetch('http://localhost:3000/api/logboeken/docent', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/dashboards/docent', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
    const data = await logRes.json()
    const dashData = await dashRes.json()

    if (!logRes.ok) {
      error.value = data.error || 'Kon logboeken niet ophalen'
      return
    }
    logboeken.value = data.logboeken
    user.value = dashData.user

    const reviewRes = await fetch('http://localhost:3000/api/logboeken/docent/reviews', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (reviewRes.ok) {
      const reviewData = await reviewRes.json()
      reviewData.reviews?.forEach(r => {
        if (!weekFeedback.value[r.week_number]) {
          weekFeedback.value[r.week_number] = {
            feedback: r.week_feedback,
            mentor_naam: r.mentor_naam,
            status: r.week_status
          }
        }
      })
    }
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  } finally {
    loading.value = false
  }
})

const weken = computed(() => {
  const groepen = {}
  logboeken.value.forEach(log => {
    const week = log.week_number
    if (!groepen[week]) groepen[week] = []
    groepen[week].push(log)
  })
  return Object.entries(groepen)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 2)
    .map(([weekNr, logs]) => {
      const ingevuld = logs.filter(l => ['goedgekeurd', 'ingediend'].includes(l.status)).length
      const totaal = logs.filter(l => l.status !== 'vrije_dag').length
      const totaalUren = logs.reduce((sum, l) => sum + (l.uren_gewerkt || 0), 0)
      return { weekNr, logs, ingevuld, totaal, totaalUren }
    })
})

function weekStatus(logs) {
  const statussen = logs.map(l => l.status)
  if (statussen.every(s => s === 'goedgekeurd' || s === 'vrije_dag')) return 'goedgekeurd'
  if (statussen.some(s => s === 'niet_ingevuld')) return 'onvolledig'
  if (statussen.every(s => ['goedgekeurd', 'ingediend', 'vrije_dag'].includes(s))) return 'ingediend'
  return 'bezig'
}

function weekStatusKlasse(status) {
  if (status === 'goedgekeurd') return 'badge-green'
  if (status === 'ingediend') return 'badge-green'
  if (status === 'onvolledig') return 'badge-orange'
  return 'badge-gray'
}

function weekStatusLabel(status) {
  if (status === 'goedgekeurd') return '✓ Volledig ingevuld'
  if (status === 'ingediend') return '✓ Volledig ingevuld'
  if (status === 'onvolledig') return '⚠ Niet volledig'
  return 'Bezig'
}

function voornaam() { return user.value?.voornaam || 'Docent' }
function initialen() {
  if (!user.value) return 'D'
  return (user.value.voornaam?.[0] || '') + (user.value.achternaam?.[0] || '')
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    console.log(err)
  }
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <main class="page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/docent/dashboard')">Dashboard</a>
        <a>Stagiairs</a>
        <a class="active" @click="router.push('/docent/logboek')">Logboeken</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <div v-if="loading" class="loading">Logboeken laden...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <div v-else>
        <button class="back-btn" @click="router.push('/docent/dashboard')">← Terug naar dashboard</button>

        <div class="title-block">
          <h1>Logboek overzicht</h1>
          <p>Wekelijkse opvolging van de student</p>
        </div>

        <section v-for="{ weekNr, logs, ingevuld, totaal, totaalUren } in weken" :key="weekNr" class="week-card">
          <div class="week-card-header">
            <div class="week-info">
              <h2>Week {{ weekNr }}</h2>
              <div class="week-stats">
                <span>📅 {{ ingevuld }} / {{ totaal }} dagen ingevuld</span>
                <span>⏱ {{ totaalUren }} uur gewerkt</span>
              </div>
            </div>
            <span :class="weekStatusKlasse(weekStatus(logs))" class="badge">
              {{ weekStatusLabel(weekStatus(logs)) }}
            </span>
          </div>

          <!-- Mentor feedback -->
          <div v-if="weekFeedback[weekNr]" class="mentor-feedback">
            <div class="mentor-feedback-header">
              <span>💬</span>
              <strong>Feedback van {{ weekFeedback[weekNr].mentor_naam || 'Mentor' }}</strong>
            </div>
            <p>{{ weekFeedback[weekNr].feedback }}</p>
          </div>

          <div v-else class="geen-feedback">
            Nog geen mentor feedback voor deze week.
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; font-family: 'Inter', sans-serif; }

.page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #0f172a; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }

.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }

.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }

nav { display: flex; gap: 8px; }

nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }

nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }

.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }

.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }

.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.content { padding: 40px 64px 52px; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.error-msg { text-align: center; padding: 60px; color: #991b1b; }

.back-btn { border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; margin-bottom: 14px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }

.title-block h1 { margin: 0; font-size: 30px; font-weight: 800; }
.title-block p { margin: 6px 0 30px; color: #64748b; }

.week-card { background: white; border-radius: 20px; border: 1px solid #e5e7eb; padding: 28px; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(15,23,42,0.04); }

.week-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }

.week-info h2 { margin: 0 0 8px; font-size: 20px; font-weight: 800; }

.week-stats { display: flex; gap: 20px; }

.week-stats span { font-size: 13px; color: #64748b; font-weight: 600; }

.badge { padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-orange { background: #fef3c7; color: #b45309; }
.badge-gray { background: #f1f5f9; color: #64748b; }

.mentor-feedback { background: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 18px; }

.mentor-feedback-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }

.mentor-feedback-header strong { color: #991b1b; font-size: 14px; }

.mentor-feedback p { margin: 0; color: #475569; line-height: 1.6; }

.geen-feedback { color: #94a3b8; font-style: italic; font-size: 14px; padding: 12px 0; }

@media (max-width: 1000px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 20px; }
  .week-card-header { flex-direction: column; gap: 12px; }
  .week-stats { flex-direction: column; gap: 6px; }
}
</style>