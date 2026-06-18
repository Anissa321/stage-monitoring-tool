<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

const student = ref(null)
const loading = ref(false)
const error = ref('')
const succes = ref('')
const mentorEvaluatieIngevuld = ref(false)
const studentEvaluatieIngevuld = ref(false)
const competenties = ref([])
const studentBeschrijvingen = ref({})
const docentNaam = ref('')

const beschrijvingVelden = [
  'communicatie_beschrijving',
  'probleemoplossing_beschrijving',
  'teamwork_beschrijving',
  'vaktechnisch_beschrijving'
]

async function laadCompetencies() {
  const token = localStorage.getItem('token')
  const res = await fetch('http://localhost:3000/api/evaluatie-competenties', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const result = await res.json()
  competenties.value = result.competenties.map(c => ({
    ...c,
    geselecteerd: null,
    niveaus: c.evaluatie_niveaus
  }))
}

function vulScoresIn(evaluatie) {
  const veldnamen = [
    'communicatie_score',
    'probleemoplossing_score',
    'teamwork_score',
    'vaktechnisch_score'
  ]
  veldnamen.forEach((veld, i) => {
    const score = evaluatie[veld]
    if (score !== null && score !== undefined && competenties.value[i]) {
      const idx = competenties.value[i].niveaus.findIndex(n => n.punten === score)
      if (idx !== -1) competenties.value[i].geselecteerd = idx
    }
  })
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    await laadCompetencies()

    const [studentRes, mentorEvalRes, studentEvalRes] = await Promise.all([
      fetch(`http://localhost:3000/api/dashboards/mentor/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://localhost:3000/api/tussentijdse-evaluaties/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://localhost:3000/api/student-evaluaties/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    const studentData = await studentRes.json()
    if (studentData.student) {
      student.value = studentData.student
    }

    const mentorEvalData = await mentorEvalRes.json()
    if (mentorEvalData.evaluatie) {
      mentorEvaluatieIngevuld.value = true
      vulScoresIn(mentorEvalData.evaluatie)
    }

    const studentEvalData = await studentEvalRes.json()
    if (studentEvalData.evaluatie) {
      studentEvaluatieIngevuld.value = true
      beschrijvingVelden.forEach(veld => {
        studentBeschrijvingen.value[veld] = studentEvalData.evaluatie[veld] || ''
      })
    }

    const meRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const meData = await meRes.json()
    docentNaam.value = `${meData.user?.voornaam || ''} ${meData.user?.achternaam || ''}`
  } catch (err) {
    console.error(err)
  }
})

function totaalScore() {
  return competenties.value.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
}

function maxScore() {
  return competenties.value.reduce((sum, c) => sum + c.niveaus[c.niveaus.length - 1].punten, 0)
}

function studentNaam() {
  if (!student.value) return '...'
  return `${student.value.voornaam} ${student.value.achternaam}`
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
        <span>{{ docentNaam }}</span>
        <div class="avatar-klein">{{ docentNaam[0] || 'D' }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push(`/docent/studenten/${studentId}`)">← Terug naar studentdossier</a>
      <h1>Tussentijdse evaluatie</h1>
      <p class="subtitle">Voor {{ studentNaam() }}</p>

      <!-- DEEL 1: MENTOR EVALUATIE -->
      <h2 class="sectie-titel">📋 Evaluatie door mentor</h2>

      <div v-if="!mentorEvaluatieIngevuld" class="wacht-banner">
        <span>⏳</span>
        <p>De mentor heeft nog geen tussentijdse evaluatie ingevuld voor deze student.</p>
      </div>

      <div class="rubriek-tabel-wrap">
        <div class="rubriek-header">
          <span class="rh-criteria">Criteria</span>
          <span class="rh-beoordelingen">Beoordelingen</span>
          <span class="rh-punten">Punten</span>
        </div>

        <div v-for="comp in competenties" :key="comp.naam" class="comp-rij">
          <div class="cel-criteria">
            <strong>{{ comp.naam }}</strong>
            <p>{{ comp.beschrijving }}</p>
          </div>
          <div class="niveaus-wrap">
            <div
              v-for="(niveau, idx) in comp.niveaus"
              :key="niveau.label"
              class="cel-niveau"
              :class="{ geselecteerd: comp.geselecteerd === idx }"
              :style="{ width: (100 / comp.niveaus.length) + '%' }"
            >
              <span class="niveau-punten">{{ niveau.punten }} ptn</span>
              <span class="niveau-label">{{ niveau.label }}</span>
              <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
            </div>
          </div>
          <div class="cel-punten">
            <span v-if="comp.geselecteerd !== null">
              {{ comp.niveaus[comp.geselecteerd].punten }} / {{ comp.niveaus[comp.niveaus.length - 1].punten }}
            </span>
            <span v-else class="nog-geen">—</span>
          </div>
        </div>

        <div class="totaal-rij">
          <span class="totaal-label">Score mentor</span>
          <span class="totaal-waarde">{{ totaalScore() }} / {{ maxScore() }}</span>
        </div>
      </div>

      <!-- DEEL 2: STUDENT ZELFEVALUATIE -->
      <h2 class="sectie-titel" style="margin-top: 40px;">✍️ Zelfevaluatie student</h2>

      <div v-if="!studentEvaluatieIngevuld" class="wacht-banner">
        <span>⏳</span>
        <p>De student heeft nog geen zelfevaluatie ingediend.</p>
      </div>

      <div v-else class="zelfevaluatie-wrap">
        <div
          v-for="(comp, i) in competenties"
          :key="'zelf-' + comp.naam"
          class="zelfevaluatie-item"
        >
          <div class="zelfevaluatie-header">
            <strong>{{ comp.naam }}</strong>
          </div>
          <p class="zelfevaluatie-tekst">
            {{ studentBeschrijvingen[beschrijvingVelden[i]] || '—' }}
          </p>
        </div>
      </div>

      <div class="actions">
        <button class="cancel-btn" @click="router.push(`/docent/studenten/${studentId}`)">← Terug</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.page { min-height: 100vh; background: #f8fafc; color: #111827; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar-klein { width: 34px; height: 34px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; font-weight: 700; }

.content { max-width: 1400px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 4px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }
.sectie-titel { font-size: 18px; font-weight: 800; margin: 0 0 16px; }

.wacht-banner { display: flex; gap: 12px; background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 13px; color: #854d0e; }
.wacht-banner p { margin: 0; }

.rubriek-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 28px; }
.rubriek-header { display: flex; align-items: center; background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 12px 16px; }
.rh-criteria { width: 200px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-beoordelingen { flex: 1; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-punten { width: 90px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; }
.comp-rij { display: flex; align-items: stretch; border-top: 1px solid #f1f5f9; }
.cel-criteria { width: 200px; flex-shrink: 0; padding: 18px 16px; border-right: 1px solid #f1f5f9; }
.cel-criteria strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.cel-criteria p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }
.niveaus-wrap { flex: 1; display: flex; }
.cel-niveau { padding: 12px; border-left: 1px solid #f1f5f9; cursor: default; }
.cel-niveau.geselecteerd { background: #fef2f2; box-shadow: inset 0 0 0 2px #991b1b; }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; color: #991b1b; margin-bottom: 2px; }
.niveau-label { display: block; font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.niveau-beschrijving { margin: 0; font-size: 10px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.cel-punten { width: 90px; flex-shrink: 0; padding: 18px 16px; text-align: right; font-size: 14px; font-weight: 800; color: #111827; border-left: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: flex-end; }
.nog-geen { color: #cbd5e1; font-weight: 600; }
.totaal-rij { display: flex; justify-content: flex-end; align-items: center; gap: 24px; padding: 16px; border-top: 2px solid #e5e7eb; }
.totaal-label { font-size: 13px; font-weight: 700; color: #64748b; }
.totaal-waarde { font-size: 16px; font-weight: 800; color: #991b1b; min-width: 90px; text-align: right; }

.zelfevaluatie-wrap { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
.zelfevaluatie-item { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.zelfevaluatie-header { margin-bottom: 10px; }
.zelfevaluatie-header strong { font-size: 15px; font-weight: 800; color: #0f172a; }
.zelfevaluatie-tekst { margin: 0; font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap; }

.actions { display: flex; justify-content: flex-start; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }

@media (max-width: 800px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .rubriek-tabel-wrap { overflow-x: auto; }
  .content { padding: 24px 16px 40px; }
}
</style>