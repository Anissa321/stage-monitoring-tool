<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

const loading = ref(true)
const student = ref(null)
const stage = ref(null)
const logboeken = ref([])
const docentInfo = ref(null)
const tussentijdsRapportBeschikbaar = ref(false)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [meRes, studentRes, rapportRes] = await Promise.all([
      fetch('http://10.2.160.246:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/dashboards/docent/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/tussentijdse-rapporten/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    const meData = await meRes.json()
    docentInfo.value = meData.user

    const studentData = await studentRes.json()
    student.value = studentData.student
    stage.value = studentData.stage
    logboeken.value = studentData.logboeken || []

    const rapportData = await rapportRes.json()
    tussentijdsRapportBeschikbaar.value = !!rapportData.rapport
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function initialen() {
  if (!student.value) return '??'
  return (student.value.voornaam?.[0] || '') + (student.value.achternaam?.[0] || '')
}

function docentInitialen() {
  if (!docentInfo.value) return 'D'
  return (docentInfo.value.voornaam?.[0] || '') + (docentInfo.value.achternaam?.[0] || '')
}

function studentNaam() {
  if (!student.value) return '...'
  return `${student.value.voornaam} ${student.value.achternaam}`
}

const logboekenIngevuld = computed(() => logboeken.value.filter(l => l.status !== 'niet_ingevuld').length)
const logboekenTotaal = computed(() => logboeken.value.length)

const logboekenPerWeek = computed(() => {
  const weken = {}
  logboeken.value.forEach(log => {
    const week = log.week_number
    if (!weken[week]) weken[week] = { week, logs: [], status: 'niet_ingevuld' }
    weken[week].logs.push(log)
  })

  Object.values(weken).forEach(w => {
    const statussen = w.logs.map(l => l.status)
    if (statussen.every(s => s === 'goedgekeurd')) w.status = 'goedgekeurd'
    else if (statussen.some(s => s === 'ingediend')) w.status = 'ingediend'
    else if (statussen.some(s => s === 'concept')) w.status = 'concept'
    else w.status = 'niet_ingevuld'
  })

  return Object.values(weken).sort((a, b) => b.week - a.week)
})

function weekStatusLabel(status) {
  if (status === 'goedgekeurd') return 'Goedgekeurd'
  if (status === 'ingediend') return 'Ingediend'
  if (status === 'concept') return 'Concept'
  return 'Niet ingevuld'
}

function weekStatusKlasse(status) {
  if (status === 'goedgekeurd') return 'badge groen'
  if (status === 'ingediend') return 'badge blauw'
  if (status === 'concept') return 'badge oranje'
  return 'badge grijs'
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
        <a class="active" @click="router.push('/docent/studenten')">Studenten</a>
        <a @click="router.push('/docent/evaluaties')">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ docentInfo?.voornaam || 'Docent' }}</span>
        <div class="avatar-small">{{ docentInitialen() }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>

    <section v-else class="content">
      <button class="back-btn" @click="router.push('/docent/studenten')">← Terug naar vorige pagina</button>

      <div class="header-row">
        <h1>Studentdossier</h1>
        <div class="header-acties">
          <button
            v-if="tussentijdsRapportBeschikbaar"
            class="rapport-btn"
            @click="router.push(`/docent/studenten/${studentId}/tussentijds-rapport/overzicht`)"
          >
            📋 Tussentijds rapport
          </button>
          <button class="eindrapport-btn" @click="router.push(`/docent/studenten/${studentId}/eindrapport`)">📄 Bekijk eindrapport</button>
          <button class="bespreking-btn" @click="router.push(`/docent/studenten/${studentId}/bespreking`)">+ Tussentijdse bespreking</button>
        </div>
      </div>

      <!-- Student card -->
      <section class="student-card">
        <div class="student-left">
          <div class="avatar">{{ initialen() }}</div>
          <div>
            <h2>{{ studentNaam() }}</h2>
            <p>{{ student?.email }} • Toegepaste Informatica • 3e jaar</p>
          </div>
        </div>
        <span class="status-pill">Op schema</span>
      </section>

      <!-- Stage + voortgang -->
      <section class="info-grid">
        <article class="info-card">
          <h3>Stage informatie</h3>
          <div class="info-columns">
            <div>
              <span>Bedrijf</span>
              <strong>{{ stage?.company_name || '—' }}</strong>
            </div>
            <div>
              <span>Mentor</span>
              <strong>{{ stage?.mentor_naam || '—' }}</strong>
            </div>
            <div>
              <span>Periode</span>
              <strong>{{ stage?.startdatum || '—' }} — {{ stage?.einddatum || '—' }}</strong>
            </div>
            <div>
              <span>Locatie</span>
              <strong>{{ stage?.locatie || '—' }}</strong>
            </div>
          </div>
          <p v-if="stage?.opdracht" class="assignment">
            <strong>Opdracht:</strong> {{ stage.opdracht }}
          </p>
        </article>

        <article class="info-card">
          <h3>Voortgang</h3>
          <div class="progress-row">
            <span>Logboeken ingevuld</span>
            <strong>{{ logboekenIngevuld }} / {{ logboekenTotaal }} dagen</strong>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: logboekenTotaal ? (logboekenIngevuld / logboekenTotaal * 100) + '%' : '0%' }"></div>
          </div>
          <div class="progress-row" :class="tussentijdsRapportBeschikbaar ? 'success' : 'warning'">
            <span>Tussentijds rapport</span>
            <strong>{{ tussentijdsRapportBeschikbaar ? 'Opgesteld' : 'Nog niet opgesteld' }}</strong>
          </div>
          <div class="progress-row success">
            <span>Stageovereenkomst</span>
            <strong>Ondertekend</strong>
          </div>
        </article>
      </section>

      <!-- Logboeken per week -->
      <section class="logbook-card">
        <h3>Recente logboeken</h3>
        <div v-if="logboekenPerWeek.length === 0" class="leeg">Geen logboeken gevonden.</div>
        <table v-else>
          <thead>
            <tr>
              <th>Week</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="weekGroep in logboekenPerWeek" :key="weekGroep.week">
              <td><strong>Week {{ weekGroep.week }}</strong></td>
              <td><span :class="weekStatusKlasse(weekGroep.status)">{{ weekStatusLabel(weekGroep.status) }}</span></td>
              <td>
                <button
                  class="bekijk-btn"
                  @click="router.push(`/docent/studenten/${studentId}/logboek/week/${weekGroep.week}`)"
                >
                  Bekijk →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  </main>
</template>

<style scoped>
* { box-sizing: border-box; font-family: Inter, sans-serif; }
.page { min-height: 100vh; background: #f1f5f9; color: #0f172a; }
.topbar { height: 64px; background: white; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 44px; position: sticky; top: 0; z-index: 10; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 32px; height: 32px; border-radius: 9px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 12px; }
nav { display: flex; gap: 24px; }
nav a { font-size: 13px; font-weight: 700; color: #64748b; text-decoration: none; cursor: pointer; }
nav a.active { color: #991b1b; }
.profile { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; color: #334155; }
.avatar-small { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 12px; font-weight: 700; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.content { padding: 34px 56px 48px; }
.back-btn { border: none; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; margin-bottom: 12px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; }
.header-row h1 { margin: 0; font-size: 28px; font-weight: 800; }
.header-acties { display: flex; gap: 12px; flex-wrap: wrap; }
.bespreking-btn { border: none; background: #1d4ed8; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.bespreking-btn:hover { background: #1e40af; }
.eindrapport-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.eindrapport-btn:hover { background: #f8fafc; }
.rapport-btn { border: 1px solid #15803d; background: white; color: #15803d; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.rapport-btn:hover { background: #ecfdf5; }

.student-card { background: white; border-radius: 18px; border: 1px solid #e5e7eb; padding: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 8px 20px rgba(15,23,42,0.04); margin-bottom: 24px; }
.student-left { display: flex; align-items: center; gap: 18px; }
.avatar { width: 62px; height: 62px; border-radius: 50%; background: #fee2e2; color: #991b1b; display: grid; place-items: center; font-weight: 800; font-size: 18px; }
.student-card h2 { margin: 0 0 6px; font-size: 20px; font-weight: 800; }
.student-card p { margin: 0; color: #64748b; font-size: 14px; }
.status-pill { background: #dcfce7; color: #166534; padding: 8px 14px; border-radius: 999px; font-weight: 800; font-size: 12px; }

.info-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; margin-bottom: 24px; }
.info-card { background: white; border-radius: 18px; border: 1px solid #e5e7eb; padding: 24px; box-shadow: 0 8px 20px rgba(15,23,42,0.04); }
.info-card h3 { margin: 0 0 20px; font-size: 16px; font-weight: 800; }
.info-columns { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 16px; }
.info-columns span { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.info-columns strong { font-size: 14px; color: #0f172a; }
.assignment { margin: 0; color: #475569; font-size: 14px; }

.progress-row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569; font-size: 14px; }
.progress-bar { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 16px; }
.progress-fill { height: 100%; background: #991b1b; border-radius: 999px; transition: width 0.3s; }
.warning strong { color: #b45309; }
.success strong { color: #166634; }

.logbook-card { background: white; border-radius: 18px; border: 1px solid #e5e7eb; padding: 24px; box-shadow: 0 8px 20px rgba(15,23,42,0.04); }
.logbook-card h3 { margin: 0 0 20px; font-size: 16px; font-weight: 800; }
.leeg { color: #64748b; font-size: 14px; }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 12px 16px; }
td { padding: 16px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }

.badge { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge.groen { background: #dcfce7; color: #15803d; }
.badge.blauw { background: #dbeafe; color: #1d4ed8; }
.badge.oranje { background: #fef3c7; color: #b45309; }
.badge.grijs { background: #f1f5f9; color: #64748b; }

.bekijk-btn { border: none; background: transparent; color: #1d4ed8; font-weight: 700; cursor: pointer; font-size: 14px; padding: 0; }
.bekijk-btn:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .content { padding: 24px 20px; }
  .info-grid { grid-template-columns: 1fr; }
  nav { display: none; }
  .header-row { flex-direction: column; align-items: flex-start; }
  .header-acties { flex-direction: column; width: 100%; }
}
</style>