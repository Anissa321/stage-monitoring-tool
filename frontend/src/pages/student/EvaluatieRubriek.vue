<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)
const mentorEvaluatieIngevuld = ref(false)
const zelfevaluatieIngediend = ref(false)
const loading = ref(false)
const succes = ref('')
const error = ref('')

const competenties = ref([])
const beschrijvingen = ref({})

async function laadCompetencies() {
  const token = localStorage.getItem('token')
  const res = await fetch('http://localhost:3000/api/evaluatie-competenties', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const result = await res.json()
  return result.competenties.map(c => ({
    ...c,
    geselecteerd: null,
    niveaus: c.evaluatie_niveaus
  }))
}

function vulScoresIn(competentiesArray, evaluatie) {
  const veldnamen = [
    'communicatie_score',
    'probleemoplossing_score',
    'teamwork_score',
    'vaktechnisch_score'
  ]
  veldnamen.forEach((veld, i) => {
    const score = evaluatie[veld]
    if (score !== null && score !== undefined && competentiesArray[i]) {
      const idx = competentiesArray[i].niveaus.findIndex(n => n.punten === score)
      if (idx !== -1) competentiesArray[i].geselecteerd = idx
    }
  })
}

const beschrijvingVelden = [
  'communicatie_beschrijving',
  'probleemoplossing_beschrijving',
  'teamwork_beschrijving',
  'vaktechnisch_beschrijving'
]

onMounted(async () => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  try {
    const basis = await laadCompetencies()
    competenties.value = basis

    // Init beschrijvingen
    basis.forEach((_, i) => {
      beschrijvingen.value[beschrijvingVelden[i]] = ''
    })

    const [dashRes, mentorEvalRes, studentEvalRes] = await Promise.all([
      fetch('http://localhost:3000/api/dashboards/student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://localhost:3000/api/tussentijdse-evaluaties/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/student-evaluaties/mijn', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    data.value = await dashRes.json()

    const mentorEvalData = await mentorEvalRes.json()
    if (mentorEvalData.evaluatie) {
      mentorEvaluatieIngevuld.value = true
      vulScoresIn(competenties.value, mentorEvalData.evaluatie)
    }

    const studentEvalData = await studentEvalRes.json()
    if (studentEvalData.evaluatie) {
      zelfevaluatieIngediend.value = true
      beschrijvingVelden.forEach(veld => {
        if (studentEvalData.evaluatie[veld]) {
          beschrijvingen.value[veld] = studentEvalData.evaluatie[veld]
        }
      })
    }
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

function alleIngevuld() {
  return beschrijvingVelden.every(veld => beschrijvingen.value[veld]?.trim())
}

async function indienen() {
  if (!alleIngevuld()) {
    error.value = 'Vul een beschrijving in voor elke competentie.'
    return
  }
  error.value = ''
  loading.value = true
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/student-evaluaties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(beschrijvingen.value)
    })
    const result = await res.json()
    if (!res.ok) { error.value = result.error || 'Kon zelfevaluatie niet opslaan'; return }
    zelfevaluatieIngediend.value = true
    succes.value = 'Zelfevaluatie ingediend!'
    setTimeout(() => succes.value = '', 3000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
}

function voornaam() { return data.value?.user?.voornaam || 'Student' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'S'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {}
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
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a class="active" @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/student/dashboard')">← Terug naar dashboard</a>
      <h1>Tussentijdse evaluatie</h1>
      <p class="subtitle">Bekijk de beoordeling van je mentor en beschrijf je eigen vorderingen</p>

      <div class="info-banner">
        <span>ℹ️</span>
        <p>Hieronder zie je de scores die je mentor heeft gegeven. Daarna kan je per competentie beschrijven wat jij denkt te hebben bereikt.</p>
      </div>

      <!-- Mentor nog niet ingevuld -->
      <div v-if="!mentorEvaluatieIngevuld" class="wacht-banner">
        <span>⏳</span>
        <p>Je mentor heeft nog geen tussentijdse evaluatie ingevuld. Je kan je zelfevaluatie pas invullen nadat de mentor dit heeft gedaan.</p>
      </div>

      <!-- DEEL 1: MENTOR RUBRIEK (read-only) -->
      <h2 class="rubriek-titel">📋 Evaluatie door mentor</h2>

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

      <!-- DEEL 2: ZELFEVALUATIE TEKSTVELDEN -->
      <h2 class="rubriek-titel" style="margin-top: 40px;">✍️ Jouw zelfevaluatie</h2>
      <p class="subtitle">Beschrijf per competentie wat jij denkt te hebben bereikt tijdens de stage.</p>

      <div v-if="!mentorEvaluatieIngevuld" class="geblokkeerd-banner">
        🔒 Beschikbaar nadat de mentor zijn evaluatie heeft ingediend.
      </div>

      <div v-else class="zelfevaluatie-wrap">
        <div v-if="zelfevaluatieIngediend" class="succes-banner">
          ✅ Je zelfevaluatie is ingediend. Je kan je beschrijvingen nog aanpassen.
        </div>

        <div
          v-for="(comp, i) in competenties"
          :key="'zelf-' + comp.naam"
          class="zelfevaluatie-item"
        >
          <div class="zelfevaluatie-header">
            <strong>{{ comp.naam }}</strong>
            <span class="zelfevaluatie-hint">Beschrijf je vorderingen voor deze competentie</span>
          </div>
          <textarea
            v-model="beschrijvingen[beschrijvingVelden[i]]"
            class="zelfevaluatie-textarea"
            :placeholder="`Wat heb je bereikt op vlak van ${comp.naam.toLowerCase()}? Geef concrete voorbeelden uit de stage...`"
            rows="4"
          ></textarea>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="succes" class="succes-msg">{{ succes }}</div>

        <div class="actions">
          <button class="submit-btn" :disabled="loading" @click="indienen">
            <span v-if="loading">Opslaan...</span>
            <span v-else>{{ zelfevaluatieIngediend ? '✓ Zelfevaluatie bijwerken' : '✓ Zelfevaluatie indienen' }}</span>
          </button>
        </div>
      </div>

      <!-- Eindrapport -->
      <section class="eindrapport-card">
        <div>
          <span class="eindrapport-label">Finale evaluatie</span>
          <h2>Eindrapport</h2>
          <p>Bekijk je finale stagebeoordeling met totaalscore, competentiescores, feedback en resultaat.</p>
        </div>
        <button class="eindrapport-btn" @click="router.push('/student/eindrapport')">
          Bekijk eindrapport →
        </button>
      </section>
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
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.content { max-width: 1400px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 20px; color: #64748b; font-size: 14px; }

.info-banner { display: flex; gap: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 13px; color: #1e40af; line-height: 1.6; }
.info-banner p { margin: 0; }
.wacht-banner { display: flex; gap: 12px; background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #854d0e; }
.wacht-banner p { margin: 0; }
.geblokkeerd-banner { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #64748b; font-weight: 600; }
.succes-banner { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 14px; font-weight: 700; }

.rubriek-titel { font-size: 18px; font-weight: 800; margin: 0 0 14px; }
.rubriek-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 24px; }
.rubriek-header { display: flex; align-items: center; background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 12px 16px; }
.rh-criteria { width: 200px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-beoordelingen { flex: 1; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-punten { width: 90px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; }

.comp-rij { display: flex; align-items: stretch; border-top: 1px solid #f1f5f9; }
.cel-criteria { width: 200px; flex-shrink: 0; padding: 18px 16px; border-right: 1px solid #f1f5f9; }
.cel-criteria strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.cel-criteria p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }
.niveaus-wrap { flex: 1; display: flex; }
.cel-niveau { padding: 12px; cursor: default; border-left: 1px solid #f1f5f9; }
.cel-niveau.geselecteerd { background: #fef2f2; box-shadow: inset 0 0 0 2px #991b1b; }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; color: #991b1b; margin-bottom: 2px; }
.niveau-label { display: block; font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.niveau-beschrijving { margin: 0; font-size: 10px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.cel-punten { width: 90px; flex-shrink: 0; padding: 18px 16px; text-align: right; font-size: 14px; font-weight: 800; color: #111827; border-left: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: flex-end; }
.nog-geen { color: #cbd5e1; font-weight: 600; }
.totaal-rij { display: flex; justify-content: flex-end; align-items: center; gap: 24px; padding: 16px; border-top: 2px solid #e5e7eb; }
.totaal-label { font-size: 13px; font-weight: 700; color: #64748b; }
.totaal-waarde { font-size: 16px; font-weight: 800; color: #991b1b; min-width: 90px; text-align: right; }

.zelfevaluatie-wrap { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.zelfevaluatie-item { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.zelfevaluatie-header { margin-bottom: 12px; }
.zelfevaluatie-header strong { display: block; font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.zelfevaluatie-hint { font-size: 12px; color: #64748b; }
.zelfevaluatie-textarea { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; resize: vertical; color: #334155; line-height: 1.6; }
.zelfevaluatie-textarea:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }

.actions { display: flex; justify-content: flex-end; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.eindrapport-card { margin-top: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 8px 24px rgba(15,23,42,0.05); }
.eindrapport-label { display: inline-block; margin-bottom: 8px; color: #991b1b; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.eindrapport-card h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.eindrapport-card p { margin: 0; color: #64748b; font-size: 14px; max-width: 640px; }
.eindrapport-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; }
.eindrapport-btn:hover { background: #7f1d1d; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 16px 40px; }
  .rubriek-tabel-wrap { overflow-x: auto; }
  .eindrapport-card { flex-direction: column; align-items: flex-start; gap: 18px; }
}
</style>