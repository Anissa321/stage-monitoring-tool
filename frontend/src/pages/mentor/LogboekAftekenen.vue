<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const studentId = route.params.studentId
const weekNummer = route.params.weekNummer
const loading = ref(true)
const error = ref('')
const succes = ref('')
const feedback = ref('')

const logboeken = ref([])
const student = ref(null)
const mentor = ref(null)

const checklist = ref({
  takenCorrect: false,
  competentiesCorrect: false,
  urenCorrect: false,
  feedbackIngevuld: false
})

onMounted(async () => {
  const token = localStorage.getItem('token')

  try {
    const resMe = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const meData = await resMe.json()
    mentor.value = meData.user

    const res = await fetch(`http://localhost:3000/api/logboeken/mentor/week/${studentId}/${weekNummer}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Kon logboeken niet ophalen'
      return
    }

    logboeken.value = data.logboeken
    student.value = data.student
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  } finally {
    loading.value = false
  }
})

function initialen(voornaam, achternaam) {
  return `${voornaam?.[0] || ''}${achternaam?.[0] || ''}`
}

function formatDag(datum) {
  if (!datum) return ''
  const d = new Date(datum)
  return d.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function statusKlasse(status) {
  if (status === 'goedgekeurd' || status === 'ingediend') return 'badge green'
  if (status === 'niet_ingevuld' || status === 'concept') return 'badge warning'
  if (status === 'vrije_dag') return 'badge gray'
  return 'badge warning'
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return '✓ Goedgekeurd'
  if (status === 'ingediend') return '✓ Ingediend'
  if (status === 'niet_ingevuld') return '⚠ Niet ingevuld'
  if (status === 'concept') return '✎ Concept'
  if (status === 'vrije_dag') return 'Feestdag'
  return status
}

function totaalUren() {
  return logboeken.value.reduce((sum, l) => sum + (l.uren_gewerkt || 0), 0)
}

function aantalIngediend() {
  return logboeken.value.filter(l => ['ingediend', 'goedgekeurd'].includes(l.status)).length
}

async function aftekenen(week_status) {
  if (!feedback.value) {
    error.value = 'Vul eerst feedback in'
    return
  }

  const token = localStorage.getItem('token')

  try {
    // Teken alle ingediende logboeken af
    const ingediend = logboeken.value.filter(l => l.status === 'ingediend')

    for (const log of ingediend) {
      await fetch(`http://localhost:3000/api/logboeken/${log.id}/aftekenen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback: feedback.value,
          week_feedback: feedback.value,
          week_status
        })
      })
    }

    succes.value = week_status === 'goedgekeurd' ? 'Week goedgekeurd!' : 'Week afgekeurd!'
    setTimeout(() => router.push('/mentor'), 1500)
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  }
}

function goBack() {
  router.push('/mentor')
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
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <div class="avatar">{{ initialen(mentor?.voornaam, mentor?.achternaam) }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>
    <div v-else-if="error && !logboeken.length" class="error-msg">{{ error }}</div>

    <div v-else>
      <section class="page-header">
        <button class="back-btn" @click="goBack">← Terug naar studentdossier</button>
        <div class="title-row">
          <div>
            <h1>Week {{ weekNummer }} aftekenen — {{ student?.voornaam }} {{ student?.achternaam }}</h1>
            <p>Week {{ weekNummer }}</p>
          </div>
          <span class="status-pill warning">⏳ Wacht op weekgoedkeuring</span>
        </div>
      </section>

      <!-- Samenvatting -->
      <section class="summary-card">
        <div class="summary-item">
          <span>Totaal uren</span>
          <strong>{{ totaalUren() }} uur</strong>
        </div>
        <div class="summary-item">
          <span>Ingediende dagen</span>
          <strong>{{ aantalIngediend() }} / {{ logboeken.length }}</strong>
        </div>
        <div class="summary-item">
          <span>Week</span>
          <strong>Week {{ weekNummer }}</strong>
        </div>
        <div class="summary-item">
          <span>Status</span>
          <strong>Wacht op aftekening</strong>
        </div>
      </section>

      <!-- Dagen -->
      <section class="days-list">
        <article v-for="log in logboeken" :key="log.id" class="day-card">
          <div class="day-meta">
            <h3>{{ formatDag(log.datum) }}</h3>
            <p>⏱ {{ log.status === 'vrije_dag' ? 'Feestdag' : log.uren_gewerkt + ' uur' }}</p>
            <span :class="statusKlasse(log.status)">{{ statusLabel(log.status) }}</span>
          </div>

          <div class="day-task">
            <span>Wat heeft {{ student?.voornaam }} gedaan</span>
            <p>"{{ log.tasks || 'Niet ingevuld' }}"</p>
          </div>

          <div class="competencies">
            <span>Competenties</span>
            <div class="tags">
              <small
                v-if="log.competenties && log.competenties.length"
                v-for="comp in log.competenties"
                :key="comp"
                class="tag"
              >
                {{ comp }}
              </small>
              <small v-else class="empty-tag">Geen competenties</small>
            </div>
          </div>
        </article>
      </section>

      <!-- Feedback -->
      <section class="feedback-section">
        <h2>Wekelijkse feedback voor {{ student?.voornaam }}</h2>
        <p>Algemene reflectie over de hele week, attitude en verbeterpunten.</p>
        <textarea v-model="feedback" placeholder="Schrijf hier je feedback..."></textarea>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="succes" class="succes-msg">{{ succes }}</div>

        <div class="mentor-checklist">
          <h3>Controle door mentor</h3>
          <label>
            <input v-model="checklist.takenCorrect" type="checkbox">
            Werkzaamheden komen overeen met uitgevoerde taken
          </label>
          <label>
            <input v-model="checklist.competentiesCorrect" type="checkbox">
            Competenties zijn correct aangeduid
          </label>
          <label>
            <input v-model="checklist.urenCorrect" type="checkbox">
            Student heeft voldoende uren gepresteerd
          </label>
          <label>
            <input v-model="checklist.feedbackIngevuld" type="checkbox">
            Feedback werd ingevuld
          </label>
        </div>
      </section>

      <!-- Acties -->
      <section class="actions">
        <button class="cancel-btn" @click="goBack">Annuleren</button>
        <div class="action-buttons">
          <button class="reject-btn" @click="aftekenen('afgekeurd')">× Week afkeuren</button>
          <button class="approve-btn" @click="aftekenen('goedgekeurd')">✓ Week goedkeuren</button>
        </div>
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
  background: #f1f3f6;
  color: #111827;
}

.topbar {
  height: 72px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
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

.loading {
  text-align: center;
  padding: 60px;
  color: #64748b;
}

.error-msg {
  color: #991b1b;
  margin: 10px 0;
  font-size: 14px;
}

.succes-msg {
  color: #15803d;
  margin: 10px 0;
  font-size: 14px;
  font-weight: 700;
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
  margin-bottom: 14px;
  font-size: 14px;
  padding: 0;
}

.back-btn:hover { color: #991b1b; }

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-row h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.title-row p {
  margin: 6px 0 0;
  color: #64748b;
}

.summary-card {
  margin: 0 64px 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.summary-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.summary-item span {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-item strong {
  font-size: 20px;
  color: #111827;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 700;
}

.warning { background: #fef3c7; color: #92400e; }

.days-list {
  padding: 8px 64px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.day-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 22px;
  display: grid;
  grid-template-columns: 200px 1fr 320px;
  gap: 28px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.day-meta h3 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
}

.day-meta p {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 13px;
}

.day-task span,
.competencies span {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.day-task p {
  margin: 0;
  color: #334155;
  font-style: italic;
  line-height: 1.5;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  border-radius: 999px;
  padding: 5px 12px;
  font-weight: 700;
  font-size: 12px;
  background: #e0e7ff;
  color: #3730a3;
}

.empty-tag {
  border-radius: 999px;
  padding: 5px 12px;
  font-weight: 700;
  font-size: 12px;
  background: #f1f5f9;
  color: #64748b;
}

.badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge.green { background: #dcfce7; color: #15803d; }
.badge.warning { background: #fef3c7; color: #92400e; }
.badge.gray { background: #f1f5f9; color: #64748b; }

.feedback-section {
  margin: 10px 64px 26px;
}

.feedback-section h2 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
}

.feedback-section p {
  margin: 0 0 14px;
  color: #64748b;
}

textarea {
  width: 100%;
  min-height: 145px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 16px;
  resize: vertical;
  color: #334155;
  line-height: 1.5;
  background: white;
  font-size: 14px;
}

textarea:focus {
  outline: none;
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.12);
}

.mentor-checklist {
  margin-top: 18px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.mentor-checklist h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 15px;
}

.mentor-checklist label {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #334155;
  font-size: 14px;
}

.actions {
  margin: 0 64px;
  padding-bottom: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.reject-btn,
.approve-btn {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
}

.cancel-btn:hover { background: #f8fafc; }

.reject-btn {
  border: 1px solid #ef4444;
  background: white;
  color: #dc2626;
}

.reject-btn:hover { background: #fee2e2; }

.approve-btn {
  border: none;
  background: #10b981;
  color: white;
}

.approve-btn:hover { background: #059669; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-header, .days-list, .feedback-section, .actions {
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 0;
    margin-right: 0;
  }
  .summary-card {
    margin-left: 20px;
    margin-right: 20px;
    grid-template-columns: 1fr 1fr;
  }
  .title-row { flex-direction: column; }
  .day-card { grid-template-columns: 1fr; }
  .actions { flex-direction: column; align-items: stretch; gap: 14px; }
  .action-buttons { flex-direction: column; }
}
</style>