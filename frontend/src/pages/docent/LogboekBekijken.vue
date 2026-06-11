<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logboeken = ref([])
const geselecteerdLogboek = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/logboeken/docent', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Kon logboeken niet ophalen'
      return
    }
    logboeken.value = data.logboeken
    if (logboeken.value.length > 0) {
      geselecteerdLogboek.value = logboeken.value[0]
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
})

function selecteerLogboek(logboek) {
  geselecteerdLogboek.value = logboek
}

function statusKlasse(status) {
  if (status === 'goedgekeurd' || status === 'ingediend') return 'done'
  if (status === 'niet_ingevuld' || status === 'concept') return 'warning'
  if (status === 'vrije_dag') return 'vrij'
  return 'active'
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

function formatDag(datum) {
  if (!datum) return ''
  const d = new Date(datum)
  return d.toLocaleDateString('nl-BE', { weekday: 'long' })
}

function formatDatum(datum) {
  if (!datum) return ''
  const d = new Date(datum)
  return `${d.getDate()} ${d.toLocaleDateString('nl-BE', { month: 'long' })}`
}

function formatVolledigDatum(datum) {
  if (!datum) return ''
  const d = new Date(datum)
  return d.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function terug() {
  router.push('/docent')
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
        <a @click="router.push('/docent')">Dashboard</a>
        <a class="active">Studenten</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>Jan</span>
        <div class="avatar">J</div>
      </div>
    </header>

    <section class="content">
      <div v-if="loading" class="loading">Logboeken laden...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <div v-else>

        <button class="back-btn" @click="terug">
          ← Terug naar studentdossier
        </button>

        <div class="title-block">
          <h1>Logboek overzicht</h1>
          <p>{{ logboeken.length }} logboeken gevonden</p>
        </div>

        <section
          v-for="[weekNr, logs] in weken"
          :key="weekNr"
          class="week-section"
        >
          <h2>Week {{ weekNr }}</h2>
          <div class="week-grid">
            <article
              v-for="log in logs"
              :key="log.id"
              class="day-box"
              :class="[statusKlasse(log.status), geselecteerdLogboek?.id === log.id ? 'selected' : '']"
              @click="selecteerLogboek(log)"
            >
              <span>{{ formatDag(log.datum) }}</span>
              <strong>{{ formatDatum(log.datum) }}</strong>
              <p>{{ statusLabel(log.status) }}</p>
            </article>
          </div>
        </section>

        <section v-if="geselecteerdLogboek" class="detail-card">
          <h2>Logboek details — {{ formatVolledigDatum(geselecteerdLogboek.datum) }}</h2>

          <div class="block">
            <span class="small-label">✎ Uitgevoerde taken</span>
            <p>{{ geselecteerdLogboek.tasks || 'Niet ingevuld' }}</p>
          </div>

          <div class="block">
            <span class="small-label">⏱ Uren gewerkt</span>
            <strong>{{ geselecteerdLogboek.uren_gewerkt || 0 }} uur</strong>
          </div>

          <div class="block">
            <span class="small-label red">📌 Competenties toegepast vandaag</span>
            <div
              v-if="geselecteerdLogboek.competenties && geselecteerdLogboek.competenties.length"
            >
              <div
                v-for="comp in geselecteerdLogboek.competenties"
                :key="comp.competence_name"
                class="competentie"
              >
                <input type="checkbox" :checked="comp.selected" disabled />
                <div>
                  <strong>{{ comp.competence_name }}</strong>
                </div>
              </div>
            </div>
            <p v-else class="geen-data">Geen competenties ingevuld</p>
          </div>

          <div class="block">
            <span class="small-label yellow">💡 Leerpunten / Reflectie</span>
            <p>{{ geselecteerdLogboek.reflection || 'Niet ingevuld' }}</p>
          </div>

          <p v-if="geselecteerdLogboek.submitted_at" class="submitted">
            Ingediend op {{ formatVolledigDatum(geselecteerdLogboek.submitted_at) }}
          </p>
        </section>

      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
  font-family: Inter, sans-serif;
}

.page {
  min-height: 100vh;
  background: #f1f5f9;
  color: #0f172a;
}

.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 44px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #991b1b;
  color: white;
  display: grid;
  place-items: center;
  font-size: 12px;
}

nav {
  display: flex;
  gap: 24px;
}

nav a {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-decoration: none;
  cursor: pointer;
}

nav a.active {
  color: #991b1b;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  display: grid;
  place-items: center;
}

.content {
  padding: 34px 56px 52px;
}

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

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 14px;
  font-size: 14px;
  padding: 0;
}

.back-btn:hover {
  color: #991b1b;
}

.title-block h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
}

.title-block p {
  margin: 6px 0 30px;
  color: #64748b;
}

.week-section {
  margin-bottom: 32px;
}

.week-section h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  margin-bottom: 30px;
}

.day-box {
  background: white;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.day-box:hover {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
}

.day-box.selected {
  border: 2px solid #991b1b;
}

.day-box span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  display: block;
}

.day-box strong {
  display: block;
  margin: 8px 0;
  font-size: 18px;
}

.day-box p {
  display: inline-block;
  margin: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.day-box.done p {
  background: #dcfce7;
  color: #166534;
}

.day-box.warning p {
  background: #fef3c7;
  color: #92400e;
}

.day-box.active p {
  background: #fee2e2;
  color: #991b1b;
}

.day-box.vrij p {
  background: #e0f2fe;
  color: #075985;
}

.detail-card {
  background: white;
  border-radius: 18px;
  padding: 30px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.detail-card h2 {
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: 800;
}

.block {
  margin-bottom: 26px;
}

.small-label {
  display: block;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 10px;
}

.small-label.red {
  color: #991b1b;
}

.small-label.yellow {
  color: #b45309;
}

.block p {
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.block strong {
  font-size: 18px;
}

.geen-data {
  color: #94a3b8;
  font-style: italic;
  font-size: 14px;
}

.competentie {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.competentie input {
  margin-top: 3px;
  accent-color: #991b1b;
  width: 16px;
  height: 16px;
}

.competentie strong {
  font-size: 14px;
  display: block;
}

.submitted {
  margin-top: 38px;
  color: #64748b;
  font-style: italic;
  font-size: 13px;
}

@media (max-width: 1000px) {
  .week-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  nav {
    display: none;
  }
}

@media (max-width: 700px) {
  .content {
    padding: 24px 20px;
  }
  .week-grid {
    grid-template-columns: 1fr;
  }
}
</style>