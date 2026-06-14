<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logboeken = ref([])
const loading = ref(true)
const error = ref('')
const user = ref(null)
const uitgeklapt = ref({})

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
    .map(([weekNr, logs]) => {
      const sortedLogs = [...logs].sort((a, b) => new Date(a.datum) - new Date(b.datum))
      const totaalUren = sortedLogs.reduce((sum, l) => sum + (l.uren_gewerkt || 0), 0)
      const nietIngevuld = sortedLogs.filter(l => l.status === 'niet_ingevuld').length
      const eerste = sortedLogs[0]
      const mentorStatus = eerste?.mentor_week_status || null

      let signaal = 'ok'
      let signaalTekst = 'In orde'
      if (mentorStatus === 'afgekeurd') {
        signaal = 'aandacht'
        signaalTekst = 'Afgekeurd door mentor'
      } else if (nietIngevuld >= 2) {
        signaal = 'aandacht'
        signaalTekst = `${nietIngevuld} dagen niet ingevuld`
      } else if (!mentorStatus) {
        signaal = 'wacht'
        signaalTekst = 'Nog niet afgetekend'
      }

      return {
        weekNr,
        logs: sortedLogs,
        totaalUren,
        nietIngevuld,
        mentor_feedback: eerste?.mentor_feedback || null,
        mentor_week_status: mentorStatus,
        mentor_naam: eerste?.mentor_naam || null,
        signaal,
        signaalTekst
      }
    })
    .sort((a, b) => b.weekNr - a.weekNr)
})

function toggleWeek(weekNr) {
  uitgeklapt.value[weekNr] = !uitgeklapt.value[weekNr]
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return '✓ Ingevuld'
  if (status === 'ingediend') return '✓ Ingevuld'
  if (status === 'niet_ingevuld') return '⚠ Niet ingevuld'
  if (status === 'concept') return '⚠ Concept'
  if (status === 'vrije_dag') return 'Vrije dag'
  if (status === 'afgekeurd') return '✗ Afgekeurd'
  return status
}

function statusKlasse(status) {
  if (status === 'goedgekeurd' || status === 'ingediend') return 'done'
  if (status === 'niet_ingevuld' || status === 'concept') return 'warning'
  if (status === 'vrije_dag') return 'vrij'
  return 'active'
}

function formatDag(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', { weekday: 'long' })
}

function formatDatum(datum) {
  if (!datum) return ''
  const d = new Date(datum)
  return `${d.getDate()} ${d.toLocaleDateString('nl-BE', { month: 'long' })}`
}

function mentorStatusLabel(status) {
  if (status === 'goedgekeurd') return '✓ Goedgekeurd door mentor'
  if (status === 'afgekeurd') return '✗ Afgekeurd door mentor'
  return 'Nog niet afgetekend door mentor'
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
        <a @click="router.push('/docent/studenten')">Stagiairs</a>
        <a class="active" @click="router.push('/docent/logboek')">Logboeken</a>
        <a @click="router.push('/docent/evaluaties')">Evaluaties</a>
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
        <button class="back-btn" @click="router.push('/docent/studenten')">← Terug naar stagiairs</button>

        <div class="title-block">
          <h1>Logboek overzicht</h1>
          <p>Wekelijkse voortgang — klik op een week voor details</p>
        </div>

        <section v-for="week in weken" :key="week.weekNr" class="week-card" :class="'signaal-' + week.signaal">
          <div class="week-header" @click="toggleWeek(week.weekNr)">
            <div class="week-titel">
              <h2>Week {{ week.weekNr }}</h2>
              <span class="signaal-badge" :class="'badge-' + week.signaal">{{ week.signaalTekst }}</span>
            </div>
            <div class="week-rechts">
              <span class="uren-badge">⏱ {{ week.totaalUren }} uur</span>
              <span class="chevron" :class="{ open: uitgeklapt[week.weekNr] }">▾</span>
            </div>
          </div>

          <div class="mentor-feedback-block" :class="'mentor-' + (week.mentor_week_status || 'wacht')">
            <span class="small-label">👤 Feedback van mentor</span>
            <p class="mentor-status">{{ mentorStatusLabel(week.mentor_week_status) }}</p>
            <p v-if="week.mentor_feedback">{{ week.mentor_feedback }}</p>
            <p v-if="week.mentor_naam" class="mentor-naam-info">— {{ week.mentor_naam }}</p>
          </div>

          <div v-if="uitgeklapt[week.weekNr]" class="dagen-detail">
            <div v-for="log in week.logs" :key="log.id" class="dag-item" :class="statusKlasse(log.status)">
              <div class="dag-kop">
                <span class="dag-naam">{{ formatDag(log.datum) }} {{ formatDatum(log.datum) }}</span>
                <span class="dag-status" :class="statusKlasse(log.status)">{{ statusLabel(log.status) }}</span>
              </div>
              <p v-if="log.tasks" class="dag-taak">{{ log.tasks }}</p>
            </div>
          </div>
        </section>

        <p v-if="!weken.length" class="geen-data">Geen logboeken gevonden.</p>
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

.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.logout-btn:hover { background: #7f1d1d; }

.content { padding: 40px 64px 52px; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.error-msg { text-align: center; padding: 60px; color: #991b1b; }

.back-btn { border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; margin-bottom: 14px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }

.title-block h1 { margin: 0; font-size: 30px; font-weight: 800; }
.title-block p { margin: 6px 0 30px; color: #64748b; }

.week-card { background: white; border-radius: 18px; padding: 24px 28px; border: 1px solid #e5e7eb; box-shadow: 0 8px 20px rgba(15,23,42,0.04); margin-bottom: 18px; border-left: 5px solid #cbd5e1; }
.week-card.signaal-aandacht { border-left-color: #dc2626; }
.week-card.signaal-ok { border-left-color: #16a34a; }
.week-card.signaal-wacht { border-left-color: #f59e0b; }

.week-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.week-titel { display: flex; align-items: center; gap: 14px; }
.week-titel h2 { font-size: 18px; font-weight: 800; margin: 0; }

.signaal-badge { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-aandacht { background: #fee2e2; color: #991b1b; }
.badge-wacht { background: #fef3c7; color: #92400e; }

.week-rechts { display: flex; align-items: center; gap: 16px; }
.uren-badge { background: #f1f5f9; color: #334155; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.chevron { color: #94a3b8; font-size: 16px; transition: transform 0.2s; display: inline-block; }
.chevron.open { transform: rotate(180deg); }

.mentor-feedback-block { border-radius: 14px; padding: 16px 18px; margin-top: 16px; }
.mentor-feedback-block.mentor-goedgekeurd { background: #ecfdf5; border: 1px solid #a7f3d0; }
.mentor-feedback-block.mentor-afgekeurd { background: #fef2f2; border: 1px solid #fecaca; }
.mentor-feedback-block.mentor-wacht { background: #f8fafc; border: 1px solid #e2e8f0; }
.small-label { display: block; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: 800; margin-bottom: 8px; }
.mentor-status { font-weight: 700; margin: 0 0 6px; color: #334155; font-size: 14px; }
.mentor-feedback-block p { margin: 0; color: #334155; line-height: 1.6; font-size: 14px; }
.mentor-naam-info { margin-top: 6px !important; font-size: 13px; color: #64748b; font-style: italic; }

.dagen-detail { margin-top: 18px; padding-top: 18px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 12px; }
.dag-item { border-radius: 12px; padding: 12px 14px; border: 1px solid #f1f5f9; background: #fafbfc; }
.dag-kop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.dag-naam { font-size: 13px; font-weight: 700; color: #334155; text-transform: capitalize; }
.dag-status { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.dag-item.done .dag-status { background: #dcfce7; color: #166534; }
.dag-item.warning .dag-status { background: #fef3c7; color: #92400e; }
.dag-item.active .dag-status { background: #fee2e2; color: #991b1b; }
.dag-item.vrij .dag-status { background: #e0f2fe; color: #075985; }
.dag-taak { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }

.geen-data { color: #94a3b8; font-style: italic; padding: 40px; text-align: center; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 20px; }
  .week-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>