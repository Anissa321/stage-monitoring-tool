<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const studentId = route.params.id
const loading = ref(true)
const error = ref('')

const student = ref(null)
const stage = ref(null)
const logboeken = ref([])
const mentor = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')

  try {
    // Haal mentor info op
    const resMe = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const meData = await resMe.json()
    mentor.value = meData.user

    // Haal student detail op
    const res = await fetch(`http://localhost:3000/api/dashboards/mentor/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Kon student niet ophalen'
      return
    }

    student.value = data.student
    stage.value = data.stage
    logboeken.value = data.logboeken

  } catch (err) {
    error.value = 'Verbindingsfout met server'
  } finally {
    loading.value = false
  }
})

function initialen(voornaam, achternaam) {
  return `${voornaam?.[0] || ''}${achternaam?.[0] || ''}`
}

function formatDatum(datum) {
  if (!datum) return ''
  const d = new Date(datum)
  return d.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function statusKlasse(status) {
  if (status === 'goedgekeurd') return 'badge green'
  if (status === 'ingediend') return 'badge blue'
  if (status === 'niet_ingevuld') return 'badge orange'
  if (status === 'concept') return 'badge orange'
  if (status === 'vrije_dag') return 'badge gray'
  return 'badge orange'
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return 'Goedgekeurd'
  if (status === 'ingediend') return 'Ingediend'
  if (status === 'niet_ingevuld') return 'Niet ingevuld'
  if (status === 'concept') return 'Concept'
  if (status === 'vrije_dag') return 'Vrije dag'
  return status
}

function goToAftekenen(logboekId) {
  router.push(`/mentor/logboek/${logboekId}`)
}

function goBack() {
  router.push('/mentor')
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
  <main class="mentor-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a @click="goBack">Dashboard</a>
        <a class="active">Stagiairs</a>
        <a>Logboeken</a>
        <a>Evaluaties</a>
      </nav>

      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen(mentor?.voornaam, mentor?.achternaam) }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else>
      <section class="page-header">
        <button class="back-btn" @click="goBack">← Terug naar dashboard</button>

        <div class="title-row">
          <div class="student-info">
            <div class="student-avatar-large">
              {{ initialen(student?.voornaam, student?.achternaam) }}
            </div>
            <div>
              <h1>{{ student?.voornaam }} {{ student?.achternaam }}</h1>
              <p>{{ student?.email }}</p>
              <span class="badge green">Op schema</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Stage info -->
      <section class="card" v-if="stage">
        <div class="card-header">
          <h2>Stage informatie</h2>
        </div>
        <div class="stage-grid">
          <div class="stage-item">
            <span>Bedrijf</span>
            <strong>{{ stage.bedrijfsnaam || 'Onbekend' }}</strong>
          </div>
          <div class="stage-item">
            <span>Mentor</span>
            <strong>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</strong>
          </div>
          <div class="stage-item">
            <span>Periode</span>
            <strong>{{ stage.startdatum }} – {{ stage.einddatum }}</strong>
          </div>
          <div class="stage-item">
            <span>Status</span>
            <strong>{{ stage.status || 'Actief' }}</strong>
          </div>
        </div>
      </section>

      <section class="card" v-else>
        <div class="card-header">
          <h2>Stage informatie</h2>
          <p>Geen stage gevonden voor deze student.</p>
        </div>
      </section>

      <!-- Recente logboeken -->
      <section class="card">
        <div class="card-header">
          <div>
            <h2>Recente logboeken</h2>
            <p>Laatste activiteit van {{ student?.voornaam }}</p>
          </div>
        </div>

        <div v-if="logboeken.length === 0" class="leeg">
          Geen logboeken gevonden.
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Week</th>
              <th>Taken</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logboeken" :key="log.id">
              <td>{{ formatDatum(log.datum) }}</td>
              <td>Week {{ log.week_number }}</td>
              <td class="taken">{{ log.tasks || 'Niet ingevuld' }}</td>
              <td><span :class="statusKlasse(log.status)">{{ statusLabel(log.status) }}</span></td>
              <td>
                <button
                  v-if="log.status === 'ingediend'"
                  class="icon-btn"
                  @click="goToAftekenen(log.id)"
                >
                  Aftekenen
                </button>
                <span v-else class="geen-actie">—</span>
              </td>
            </tr>
          </tbody>
        </table>
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

.mentor-page {
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
}

.logout-btn:hover { background: #7f1d1d; }

.loading {
  text-align: center;
  padding: 60px;
  color: #64748b;
}

.error-msg {
  text-align: center;
  padding: 60px;
  color: #991b1b;
}

.leeg {
  padding: 28px;
  color: #64748b;
  font-size: 14px;
}

.page-header {
  padding: 30px 64px 20px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
  padding: 0;
}

.back-btn:hover { color: #991b1b; }

.title-row {
  display: flex;
  align-items: center;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.student-avatar-large {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 22px;
}

.student-info h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.student-info p {
  margin: 4px 0 8px;
  color: #64748b;
  font-size: 14px;
}

.card {
  margin: 24px 64px;
  background: white;
  border-radius: 22px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.05);
}

.card-header {
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.stage-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 24px 28px;
}

.stage-item span {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 6px;
}

.stage-item strong {
  font-size: 15px;
  color: #0f172a;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  color: #94a3b8;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  padding: 16px 28px;
}

td {
  padding: 20px 28px;
  border-top: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}

.taken {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.green { background: #dcfce7; color: #15803d; }
.blue { background: #dbeafe; color: #1d4ed8; }
.orange { background: #fef3c7; color: #b45309; }
.gray { background: #f1f5f9; color: #64748b; }

.icon-btn {
  border: 1px solid #991b1b;
  background: white;
  color: #991b1b;
  padding: 7px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

.icon-btn:hover {
  background: #991b1b;
  color: white;
}

.geen-actie {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-header, .card { margin-left: 20px; margin-right: 20px; }
  .stage-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  table { display: block; overflow-x: auto; }
}
</style>