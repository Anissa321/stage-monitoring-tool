<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)
const mentorEvaluatieIngevuld = ref(false)
const zelfevaluatieIngediend = ref(false)
const docentRapportBeschikbaar = ref(false)
const loading = ref(false)
const succes = ref('')
const error = ref('')

const mentorCompetencies = ref([])
const studentCompetencies = ref([])

const beschrijvingVelden = [
  'communicatie_beschrijving',
  'probleemoplossing_beschrijving',
  'teamwork_beschrijving',
  'vaktechnisch_beschrijving'
]

const scoreVelden = [
  'communicatie_score',
  'probleemoplossing_score',
  'teamwork_score',
  'vaktechnisch_score'
]

const beschrijvingen = ref({})

async function laadCompetencies() {
  const token = localStorage.getItem('token')
  const res = await fetch('http://10.2.160.246:3000/api/evaluatie-competenties/mijn-opleiding', {
    headers: { Authorization: `Bearer ${token}` }
  })
  const result = await res.json()
  if (!res.ok) {
    console.error('Kon competenties niet ophalen:', result.error)
    return []
  }
  return result.competenties.map(c => ({
    ...c,
    geselecteerd: null,
    niveaus: c.evaluatie_niveaus
  }))
}

function vulScoresIn(competentiesArray, evaluatie, veldnamen) {
  veldnamen.forEach((veld, i) => {
    const score = evaluatie[veld]
    if (score !== null && score !== undefined && competentiesArray[i]) {
      const idx = competentiesArray[i].niveaus.findIndex(n => n.punten === score)
      if (idx !== -1) competentiesArray[i].geselecteerd = idx
    }
  })
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  try {
    const basis = await laadCompetencies()
    mentorCompetencies.value = basis.map(c => ({ ...c, niveaus: [...c.niveaus] }))
    studentCompetencies.value = basis.map(c => ({ ...c, geselecteerd: null, niveaus: [...c.niveaus] }))

    beschrijvingVelden.forEach(veld => {
      beschrijvingen.value[veld] = ''
    })

    const [dashRes, mentorEvalRes, studentEvalRes, rapportRes] = await Promise.all([
      fetch('http://10.2.160.246:3000/api/dashboards/student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/tussentijdse-evaluaties/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://10.2.160.246:3000/api/student-evaluaties/mijn', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/tussentijdse-rapporten/student/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    data.value = await dashRes.json()

    const mentorEvalData = await mentorEvalRes.json()
    if (mentorEvalData.evaluatie) {
      mentorEvaluatieIngevuld.value = true
      vulScoresIn(mentorCompetencies.value, mentorEvalData.evaluatie, scoreVelden)
    }

    const studentEvalData = await studentEvalRes.json()
    if (studentEvalData.evaluatie) {
      zelfevaluatieIngediend.value = true
      vulScoresIn(studentCompetencies.value, studentEvalData.evaluatie, scoreVelden)
      beschrijvingVelden.forEach(veld => {
        beschrijvingen.value[veld] = studentEvalData.evaluatie[veld] || ''
      })
    }

    const rapportData = await rapportRes.json()
    if (rapportData.rapport) {
      docentRapportBeschikbaar.value = true
    }
  } catch (err) {
    console.error(err)
  }
})

function selecteerNiveau(comp, idx) {
  if (!mentorEvaluatieIngevuld.value) return
  comp.geselecteerd = idx
}

function mentorTotaal() {
  return mentorCompetencies.value.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
}

function studentTotaal() {
  return studentCompetencies.value.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
}

function maxScore() {
  return mentorCompetencies.value.reduce((sum, c) => sum + c.niveaus[c.niveaus.length - 1].punten, 0)
}

function alleIngevuld() {
  const scoresIngevuld = studentCompetencies.value.every(c => c.geselecteerd !== null)
  const beschrijvingenIngevuld = beschrijvingVelden.every(veld => beschrijvingen.value[veld]?.trim())
  return scoresIngevuld && beschrijvingenIngevuld
}

async function indienen() {
  if (!alleIngevuld()) {
    error.value = 'Selecteer een niveau en vul een beschrijving in voor elke competentie.'
    return
  }
  error.value = ''
  loading.value = true
  const token = localStorage.getItem('token')
  try {
    const scores = {}
    studentCompetencies.value.forEach((c, i) => {
      if (scoreVelden[i]) scores[scoreVelden[i]] = c.niveaus[c.geselecteerd].punten
    })

    const res = await fetch('http://10.2.160.246:3000/api/student-evaluaties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...scores, ...beschrijvingen.value })
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
    await fetch('http://10.2.160.246:3000/api/auth/logout', {
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
      <a class="back-link" @click="router.push('/student/evaluatie')">← Terug naar evaluatie-overzicht</a>
      <h1>Tussentijdse evaluatie</h1>
      <p class="subtitle">Bekijk de beoordeling van je mentor en vul je zelfevaluatie in</p>

      <div class="info-banner">
        <span>ℹ️</span>
        <p>Bovenaan zie je de scores van je mentor. Daarna selecteer je zelf een niveau per competentie en schrijf je een korte beschrijving van je vorderingen.</p>
      </div>

      <!-- Mentor nog niet ingevuld -->
      <div v-if="!mentorEvaluatieIngevuld" class="wacht-banner">
        <span>⏳</span>
        <p>Je mentor heeft nog geen tussentijdse evaluatie ingevuld. Je kan je zelfevaluatie pas invullen nadat de mentor dit heeft gedaan.</p>
      </div>

      <!-- Legenda -->
      <div class="legenda">
        <div class="legenda-item">
          <div class="legenda-kleur rood"></div>
          <span>Beoordeling mentor</span>
        </div>
        <div class="legenda-item">
          <div class="legenda-kleur blauw"></div>
          <span>Jouw zelfevaluatie</span>
        </div>
      </div>

      <!-- DEEL 1: MENTOR RUBRIEK -->
      <h2 class="rubriek-titel">📋 Evaluatie door mentor</h2>
      <div class="rubriek-tabel-wrap">
        <div class="rubriek-header">
          <span class="rh-criteria">Criteria</span>
          <span class="rh-beoordelingen">Beoordelingen</span>
          <span class="rh-punten">Punten</span>
        </div>
        <div v-for="comp in mentorCompetencies" :key="'mentor-' + comp.naam" class="comp-rij">
          <div class="cel-criteria">
            <strong>{{ comp.naam }}</strong>
            <p>{{ comp.beschrijving }}</p>
          </div>
          <div class="niveaus-wrap">
            <div
              v-for="(niveau, idx) in comp.niveaus"
              :key="niveau.label"
              class="cel-niveau"
              :class="{ 'geselecteerd-rood': comp.geselecteerd === idx }"
              :style="{ width: (100 / comp.niveaus.length) + '%' }"
            >
              <span class="niveau-punten rood-punten">{{ niveau.punten }} ptn</span>
              <span class="niveau-label">{{ niveau.label }}</span>
              <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
            </div>
          </div>
          <div class="cel-punten">
            <span v-if="comp.geselecteerd !== null" class="punten-rood">
              {{ comp.niveaus[comp.geselecteerd].punten }} / {{ comp.niveaus[comp.niveaus.length - 1].punten }}
            </span>
            <span v-else class="nog-geen">—</span>
          </div>
        </div>
        <div class="totaal-rij">
          <span class="totaal-label">Score mentor</span>
          <span class="totaal-waarde punten-rood">{{ mentorTotaal() }} / {{ maxScore() }}</span>
        </div>
      </div>

      <!-- DEEL 2: STUDENT ZELFEVALUATIE -->
      <h2 class="rubriek-titel" style="margin-top: 40px;">✍️ Jouw zelfevaluatie</h2>

      <div v-if="!mentorEvaluatieIngevuld" class="geblokkeerd-banner">
        🔒 Beschikbaar nadat de mentor zijn evaluatie heeft ingediend.
      </div>

      <div v-else>
        <div v-if="zelfevaluatieIngediend && !succes" class="succes-banner">
          ✅ Je zelfevaluatie is ingediend. Je kan het nog aanpassen.
        </div>

        <div class="rubriek-tabel-wrap">
          <div class="rubriek-header">
            <span class="rh-criteria">Criteria</span>
            <span class="rh-beoordelingen">Beoordelingen</span>
            <span class="rh-punten">Punten</span>
          </div>
          <div v-for="(comp, i) in studentCompetencies" :key="'student-' + comp.naam" class="comp-rij-uitgebreid">
            <div class="comp-rij">
              <div class="cel-criteria">
                <strong>{{ comp.naam }}</strong>
                <p>{{ comp.beschrijving }}</p>
              </div>
              <div class="niveaus-wrap">
                <div
                  v-for="(niveau, idx) in comp.niveaus"
                  :key="niveau.label"
                  class="cel-niveau klikbaar"
                  :class="{ 'geselecteerd-blauw': comp.geselecteerd === idx }"
                  :style="{ width: (100 / comp.niveaus.length) + '%' }"
                  @click="selecteerNiveau(comp, idx)"
                >
                  <span class="niveau-punten blauw-punten">{{ niveau.punten }} ptn</span>
                  <span class="niveau-label">{{ niveau.label }}</span>
                  <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
                </div>
              </div>
              <div class="cel-punten">
                <span v-if="comp.geselecteerd !== null" class="punten-blauw">
                  {{ comp.niveaus[comp.geselecteerd].punten }} / {{ comp.niveaus[comp.niveaus.length - 1].punten }}
                </span>
                <span v-else class="nog-geen">—</span>
              </div>
            </div>
            <div class="beschrijving-rij">
              <label class="beschrijving-label">Jouw beschrijving voor {{ comp.naam }}</label>
              <textarea
                v-model="beschrijvingen[beschrijvingVelden[i]]"
                class="beschrijving-textarea"
                :placeholder="`Beschrijf je vorderingen op vlak van ${comp.naam.toLowerCase()}...`"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="totaal-rij">
            <span class="totaal-label">Jouw score</span>
            <span class="totaal-waarde punten-blauw">{{ studentTotaal() }} / {{ maxScore() }}</span>
          </div>
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

      <!-- Tussentijds rapport van docent -->
      <section v-if="docentRapportBeschikbaar" class="eindrapport-card">
        <div>
          <span class="eindrapport-label">Finale evaluatie</span>
          <h2>Tussentijds rapport</h2>
          <p>Je docent heeft een tussentijds rapport opgesteld op basis van de evaluatie van je mentor en jouw zelfevaluatie. Bekijk je score, competentiescores en feedback.</p>
        </div>
        <button class="eindrapport-btn" @click="router.push('/student/evaluatie/tussentijds-rapport')">
          Bekijk tussentijds rapport →
        </button>
      </section>

      <section v-else class="wacht-rapport-card">
        <span>⏳</span>
        <p>Je docent heeft nog geen tussentijds rapport opgesteld. Zodra dit klaar is, kan je het hier bekijken.</p>
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

.info-banner { display: flex; gap: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 13px; color: #1e40af; }
.info-banner p { margin: 0; }
.wacht-banner { display: flex; gap: 12px; background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #854d0e; }
.wacht-banner p { margin: 0; }
.geblokkeerd-banner { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #64748b; font-weight: 600; }
.succes-banner { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 14px; font-weight: 700; }

.legenda { display: flex; gap: 20px; margin-bottom: 20px; }
.legenda-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #334155; }
.legenda-kleur { width: 16px; height: 16px; border-radius: 4px; }
.legenda-kleur.rood { background: #fee2e2; border: 2px solid #991b1b; }
.legenda-kleur.blauw { background: #dbeafe; border: 2px solid #1d4ed8; }

.rubriek-titel { font-size: 18px; font-weight: 800; margin: 0 0 14px; }
.rubriek-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 24px; }
.rubriek-header { display: flex; align-items: center; background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 12px 16px; }
.rh-criteria { width: 200px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-beoordelingen { flex: 1; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-punten { width: 90px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; text-align: right; }

.comp-rij-uitgebreid { border-top: 1px solid #f1f5f9; }
.comp-rij { display: flex; align-items: stretch; }
.cel-criteria { width: 200px; flex-shrink: 0; padding: 18px 16px; border-right: 1px solid #f1f5f9; }
.cel-criteria strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.cel-criteria p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }
.niveaus-wrap { flex: 1; display: flex; }
.cel-niveau { padding: 12px; border-left: 1px solid #f1f5f9; cursor: default; }
.cel-niveau.klikbaar { cursor: pointer; transition: background 0.15s; }
.cel-niveau.klikbaar:hover { background: #eff6ff; }
.cel-niveau.geselecteerd-rood { background: #fef2f2; box-shadow: inset 0 0 0 2px #991b1b; }
.cel-niveau.geselecteerd-blauw { background: #eff6ff; box-shadow: inset 0 0 0 2px #1d4ed8; }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; margin-bottom: 2px; }
.rood-punten { color: #991b1b; }
.blauw-punten { color: #1d4ed8; }
.niveau-label { display: block; font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.niveau-beschrijving { margin: 0; font-size: 10px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.cel-punten { width: 90px; flex-shrink: 0; padding: 18px 16px; text-align: right; font-size: 14px; font-weight: 800; border-left: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: flex-end; }
.nog-geen { color: #cbd5e1; font-weight: 600; }
.punten-rood { color: #991b1b; }
.punten-blauw { color: #1d4ed8; }

.beschrijving-rij { padding: 12px 16px 16px; border-top: 1px solid #f1f5f9; background: #fafcff; }
.beschrijving-label { display: block; font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; margin-bottom: 8px; }
.beschrijving-textarea { width: 100%; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: inherit; resize: vertical; color: #334155; line-height: 1.5; background: white; }
.beschrijving-textarea:focus { outline: none; border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }

.totaal-rij { display: flex; justify-content: flex-end; align-items: center; gap: 24px; padding: 16px; border-top: 2px solid #e5e7eb; }
.totaal-label { font-size: 13px; font-weight: 700; color: #64748b; }
.totaal-waarde { font-size: 16px; font-weight: 800; min-width: 90px; text-align: right; }

.actions { display: flex; justify-content: flex-end; margin-bottom: 32px; }
.submit-btn { border: none; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #1e40af; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.eindrapport-card { margin-top: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 8px 24px rgba(15,23,42,0.05); }
.eindrapport-label { display: inline-block; margin-bottom: 8px; color: #991b1b; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.eindrapport-card h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.eindrapport-card p { margin: 0; color: #64748b; font-size: 14px; max-width: 640px; }
.eindrapport-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.eindrapport-btn:hover { background: #7f1d1d; }

.wacht-rapport-card { margin-top: 24px; display: flex; gap: 12px; align-items: center; background: #fefce8; border: 1px solid #fde68a; border-radius: 18px; padding: 20px 24px; font-size: 14px; color: #854d0e; }
.wacht-rapport-card p { margin: 0; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 16px 40px; }
  .rubriek-tabel-wrap { overflow-x: auto; }
  .eindrapport-card { flex-direction: column; align-items: flex-start; gap: 18px; }
}
</style>