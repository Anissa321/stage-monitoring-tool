<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logboeken = ref([])

function gaNaarInvullen() {
  router.push('/student/logboek-invullen')
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

function formatDatum(datum) {
  return new Date(datum).toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function statusClass(status) {
  if (status === 'goedgekeurd') return 'approved'
  if (status === 'ingediend') return 'submitted'
  if (status === 'concept') return 'draft'
  if (status === 'niet_ingevuld') return 'empty'
  if (status === 'vrije_dag') return 'free'
  return 'draft'
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return 'Goedgekeurd'
  if (status === 'ingediend') return 'Ingediend'
  if (status === 'concept') return 'Concept'
  if (status === 'niet_ingevuld') return 'Nog niet ingevuld'
  if (status === 'vrije_dag') return 'Vrije dag'
  return status
}

const logboekenPerWeek = computed(() => {
  const groepen = {}
  logboeken.value.forEach((logboek) => {
    const week = logboek.week_number
    if (!groepen[week]) groepen[week] = []
    groepen[week].push(logboek)
  })
  return Object.keys(groepen)
    .sort((a, b) => Number(b) - Number(a))
    .map((week) => ({
      week,
      logboeken: groepen[week].sort((a, b) => new Date(a.datum) - new Date(b.datum))
    }))
})

function korteCompetentie(competentie) {
  if (competentie === 'Communicatie') return 'Comm.'
  if (competentie === 'Probleemoplossing') return 'Prob.'
  if (competentie === 'Teamwork') return 'Team.'
  if (competentie === 'Vaktechnisch handelen') return 'Vakt.'
  return competentie
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:3000/api/logboeken/mijn', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    logboeken.value = data.logboeken || []
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <main class="logboek-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a class="active">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>

      <div class="profile">
        <span>Anissa</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">A</div>
      </div>
    </header>

    <div class="page-content">
      <section class="hero">
        <p class="label">Stage Logboek</p>
        <h1>Mijn Logboek</h1>
        <p class="subtitle">Overzicht van je ingediende logboeken</p>
        <div class="progress-wrapper">
          <span>Uren deze week: 32 / 40 uur</span>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </section>

      <section class="week-section">
        <div class="section-header">
          <h2>Logboeken per week</h2>
          <button class="new-btn" @click="gaNaarInvullen">+ Logboek invullen</button>
        </div>

        <section v-for="weekGroep in logboekenPerWeek" :key="weekGroep.week" class="week-block">
          <div class="week-title">
            <h2>
              Week {{ weekGroep.week }}
              <span v-if="Number(weekGroep.week) === 13">(huidige week)</span>
            </h2>
          </div>
          <div class="cards">
            <article
              v-for="logboek in weekGroep.logboeken"
              :key="logboek.id"
              class="day-card"
              :class="statusClass(logboek.status)"
            >
              <h3>{{ formatDatum(logboek.datum) }}</h3>
              <span class="status">{{ statusLabel(logboek.status) }}</span>
              <p class="hours">{{ logboek.uren_gewerkt }} uur gewerkt</p>
              <div v-if="logboek.competenties && logboek.competenties.length" class="tags">
                <span v-for="competentie in logboek.competenties" :key="competentie">
                  {{ korteCompetentie(competentie) }}
                </span>
              </div>
              <button v-if="logboek.status === 'niet_ingevuld'" class="fill-card-btn" @click="gaNaarInvullen">
                + Logboek invullen
              </button>
            </article>
          </div>
        </section>
      </section>

      <section class="feedback-card">
        <h3>Wekelijkse Feedback</h3>
        <p>Sterk werk, Anissa. Je technische kennis groeit zichtbaar en je communicatie verloopt steeds beter.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.logboek-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #111827;
}

.topbar {
  height: 72px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  color: #991b1b;
}

.logo-circle {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #991b1b;
  color: white;
  display: grid;
  place-items: center;
  font-size: 13px;
}

nav {
  display: flex;
  gap: 8px;
}

nav a {
  text-decoration: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

nav a:hover,
nav a.active {
  background: #fee2e2;
  color: #991b1b;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.logout-btn {
  border: none;
  background: #991b1b;
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.logout-btn:hover {
  background: #7f1d1d;
}

.page-content {
  padding: 40px 64px;
}

.hero {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.label {
  color: #991b1b;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}

.hero h1 {
  margin: 10px 0;
  font-size: 38px;
  color: #0f172a;
}

.subtitle { color: #64748b; }

.progress-wrapper { margin-top: 24px; }

.progress-wrapper span {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  width: 80%;
  height: 100%;
  background: #991b1b;
}

.week-section { margin-top: 32px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.section-header h2 { color: #0f172a; margin: 0; }

.new-btn {
  border: none;
  background: #991b1b;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.new-btn:hover { background: #7f1d1d; }

.week-block { margin-bottom: 42px; }

.week-title { margin-bottom: 18px; }

.week-title h2 { margin: 0; color: #0f172a; font-size: 24px; }

.week-title h2 span { color: #64748b; font-size: 16px; font-weight: 600; }

.cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

.day-card {
  background: white;
  border-radius: 18px;
  padding: 18px;
  min-height: 180px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.day-card h3 { font-size: 15px; margin-bottom: 12px; text-transform: capitalize; }

.status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.hours { margin-top: 18px; color: #0f172a; font-weight: 600; }

.day-card.approved { border-top: 5px solid #16a34a; }
.day-card.submitted { border-top: 5px solid #f59e0b; }
.day-card.draft { border-top: 5px solid #64748b; }
.day-card.empty { border-top: 5px solid #991b1b; }
.day-card.free { border-top: 5px solid #3b82f6; }

.day-card.approved .status { background: #dcfce7; color: #166534; }
.day-card.submitted .status { background: #fef3c7; color: #92400e; }
.day-card.draft .status { background: #e2e8f0; color: #475569; }
.day-card.empty .status { background: #fee2e2; color: #991b1b; }
.day-card.free .status { background: #dbeafe; color: #1d4ed8; }

.tags { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; }

.tags span {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.fill-card-btn {
  margin-top: 18px;
  border: none;
  background: #991b1b;
  color: white;
  padding: 9px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.fill-card-btn:hover { background: #7f1d1d; }

.feedback-card {
  margin-top: 32px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 20px;
  padding: 24px;
}

.feedback-card h3 { margin-bottom: 12px; color: #991b1b; }
.feedback-card p { color: #475569; }

@media (max-width: 1200px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1000px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-content { padding: 24px 20px; }
}
</style>