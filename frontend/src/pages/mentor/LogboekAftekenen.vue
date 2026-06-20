<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const studentId = route.params.studentId
const weekNummer = computed(() => Number(route.params.weekNummer))
const loading = ref(true)
const error = ref('')
const succes = ref('')
const feedback = ref('')

const logboeken = ref([])
const student = ref(null)
const mentor = ref(null)
const beschikbareWeken = ref([])

async function laadWeek() {
  loading.value = true
  error.value = ''
  succes.value = ''
  feedback.value = ''
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/logboeken/mentor/week/${studentId}/${weekNummer.value}`, {
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
}

async function laadBeschikbareWeken() {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/logboeken/mentor', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    const weken = (data.logboeken || [])
      .filter(l => l.student_id === studentId)
      .map(l => l.week_number)
    beschikbareWeken.value = [...new Set(weken)].sort((a, b) => a - b)
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const resMe = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const meData = await resMe.json()
    mentor.value = meData.user
  } catch (err) {
    console.error(err)
  }

  await laadBeschikbareWeken()
  await laadWeek()
})

const huidigeIndex = computed(() => beschikbareWeken.value.indexOf(weekNummer.value))
const kanVorige = computed(() => huidigeIndex.value > 0)
const kanVolgende = computed(() => huidigeIndex.value !== -1 && huidigeIndex.value < beschikbareWeken.value.length - 1)

function vorigeWeek() {
  if (!kanVorige.value) return
  const nieuweWeek = beschikbareWeken.value[huidigeIndex.value - 1]
  router.push(`/mentor/week/${studentId}/${nieuweWeek}`)
}

function volgendeWeek() {
  if (!kanVolgende.value) return
  const nieuweWeek = beschikbareWeken.value[huidigeIndex.value + 1]
  router.push(`/mentor/week/${studentId}/${nieuweWeek}`)
}

function springNaarWeek(week) {
  router.push(`/mentor/week/${studentId}/${week}`)
}

// Herlaad de week-data wanneer de route-parameter verandert (navigatie binnen dezelfde pagina)
import { watch } from 'vue'
watch(weekNummer, () => {
  laadWeek()
})

function initialen(voornaam, achternaam) {
  return `${voornaam?.[0] || ''}${achternaam?.[0] || ''}`
}

function formatDag(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
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

function parseCompetenties(competenties) {
  if (!competenties || !competenties.length) return []
  return competenties.map(c => {
    if (typeof c === 'string') {
      try {
        const parsed = JSON.parse(c)
        return { naam: parsed.naam || parsed.name, description: parsed.description }
      } catch {
        return { naam: c, description: '' }
      }
    }
    return { naam: c.naam || c.name, description: c.description }
  })
}

function weekStatusLabel() {
  const alleGoedgekeurd = logboeken.value.length > 0 && logboeken.value.every(l => ['goedgekeurd', 'vrije_dag'].includes(l.status))
  return alleGoedgekeurd ? '✓ Goedgekeurd' : '⏳ Wacht op weekgoedkeuring'
}
function weekStatusKlasse() {
  const alleGoedgekeurd = logboeken.value.length > 0 && logboeken.value.every(l => ['goedgekeurd', 'vrije_dag'].includes(l.status))
  return alleGoedgekeurd ? 'status-pill success' : 'status-pill warning'
}

async function aftekenen(week_status) {
  if (!feedback.value) {
    error.value = 'Vul eerst feedback in'
    return
  }
  const token = localStorage.getItem('token')
  try {
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
    await laadWeek()
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  }
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
        <a @click="router.push('/mentor/dashboard')">Dashboard</a>
        <a class="active" @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen(mentor?.voornaam, mentor?.achternaam) }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>
    <div v-else-if="error && !logboeken.length" class="error-msg">{{ error }}</div>

    <div v-else>
      <section class="page-header">
        <button class="back-btn" @click="router.push(`/mentor/student/${studentId}`)">← Terug naar studentdossier</button>
        <div class="title-row">
          <div>
            <h1>Week {{ weekNummer }} aftekenen — {{ student?.voornaam }} {{ student?.achternaam }}</h1>
            <p>Week {{ weekNummer }}</p>
          </div>
          <span :class="weekStatusKlasse()">{{ weekStatusLabel() }}</span>
        </div>
      </section>

      <section class="week-navigatie">
        <button class="nav-pijl" :disabled="!kanVorige" @click="vorigeWeek">← Vorige week</button>

        <select :value="weekNummer" @change="springNaarWeek(Number($event.target.value))" class="week-select">
          <option v-for="w in beschikbareWeken" :key="w" :value="w">Week {{ w }}</option>
        </select>

        <button class="nav-pijl" :disabled="!kanVolgende" @click="volgendeWeek">Volgende week →</button>
      </section>

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
            <div v-if="parseCompetenties(log.competenties).length" class="comp-list">
              <div v-for="(comp, i) in parseCompetenties(log.competenties)" :key="i" class="comp-item">
                <strong>{{ comp.naam }}</strong>
                <p v-if="comp.description">{{ comp.description }}</p>
              </div>
            </div>
            <small v-else class="empty-tag">Geen competenties</small>
          </div>
        </article>
      </section>

      <section class="feedback-section">
        <h2>Wekelijkse feedback voor {{ student?.voornaam }}</h2>
        <p>Algemene reflectie over de hele week, attitude en verbeterpunten.</p>
        <textarea v-model="feedback" placeholder="Schrijf hier je feedback..."></textarea>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="succes" class="succes-msg">{{ succes }}</div>
      </section>

      <section class="actions">
        <button class="cancel-btn" @click="router.push(`/mentor/student/${studentId}`)">Annuleren</button>
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
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.mentor-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
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
.loading { text-align: center; padding: 60px; color: #64748b; }
.error-msg { color: #991b1b; margin: 10px 0; font-size: 14px; }
.succes-msg { color: #15803d; margin: 10px 0; font-size: 14px; font-weight: 700; }
.page-header { padding: 30px 64px 20px; }
.back-btn { border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 14px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }
.title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
.title-row h1 { margin: 0; font-size: 28px; font-weight: 800; }
.title-row p { margin: 6px 0 0; color: #64748b; }
.status-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 7px 13px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.warning { background: #fef3c7; color: #92400e; }
.success { background: #dcfce7; color: #15803d; }

.week-navigatie {
  margin: 0 64px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.04);
}
.nav-pijl {
  border: 1px solid #e5e7eb;
  background: white;
  color: #334155;
  padding: 9px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}
.nav-pijl:hover:not(:disabled) { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.nav-pijl:disabled { opacity: 0.35; cursor: not-allowed; }
.week-select {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  background: white;
  cursor: pointer;
}

.days-list { padding: 8px 64px 20px; display: flex; flex-direction: column; gap: 18px; }
.day-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; display: grid; grid-template-columns: 200px 1fr 420px; gap: 28px; box-shadow: 0 8px 22px rgba(15,23,42,0.04); }
.day-meta h3 { margin: 0 0 6px; font-size: 14px; font-weight: 700; }
.day-meta p { margin: 0 0 8px; color: #64748b; font-size: 13px; }
.day-task span, .competencies span { display: block; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
.day-task p { margin: 0; color: #334155; font-style: italic; line-height: 1.5; }
.comp-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.comp-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; }
.comp-item strong { display: block; font-size: 11px; color: #991b1b; margin-bottom: 2px; }
.comp-item p { margin: 0; font-size: 11px; color: #475569; line-height: 1.4; }
.empty-tag { border-radius: 999px; padding: 5px 12px; font-weight: 700; font-size: 12px; background: #f1f5f9; color: #64748b; display: inline-block; }
.badge { display: inline-block; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge.green { background: #dcfce7; color: #15803d; }
.badge.warning { background: #fef3c7; color: #92400e; }
.badge.gray { background: #f1f5f9; color: #64748b; }
.feedback-section { margin: 10px 64px 26px; }
.feedback-section h2 { margin: 0 0 6px; font-size: 18px; font-weight: 700; }
.feedback-section p { margin: 0 0 14px; color: #64748b; }
textarea { width: 100%; min-height: 145px; border: 1px solid #cbd5e1; border-radius: 14px; padding: 16px; resize: vertical; color: #334155; line-height: 1.5; background: white; font-size: 14px; }
textarea:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.12); }
.actions { margin: 0 64px; padding-bottom: 50px; display: flex; justify-content: space-between; align-items: center; }
.action-buttons { display: flex; gap: 12px; }
.cancel-btn, .reject-btn, .approve-btn { border-radius: 12px; padding: 12px 20px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; }
.cancel-btn:hover { background: #f8fafc; }
.reject-btn { border: 1px solid #ef4444; background: white; color: #dc2626; }
.reject-btn:hover { background: #fee2e2; }
.approve-btn { border: none; background: #10b981; color: white; }
.approve-btn:hover { background: #059669; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .page-header, .days-list, .feedback-section, .actions { padding-left: 20px; padding-right: 20px; margin-left: 0; margin-right: 0; }
  .week-navigatie { margin-left: 20px; margin-right: 20px; flex-direction: column; }
  .title-row { flex-direction: column; }
  .day-card { grid-template-columns: 1fr; }
  .comp-list { grid-template-columns: 1fr; }
  .actions { flex-direction: column; align-items: stretch; gap: 14px; }
  .action-buttons { flex-direction: column; }
}
</style>