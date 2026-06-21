<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

const student = ref(null)
const mentorEvaluatieIngevuld = ref(false)
const studentEvaluatieIngevuld = ref(false)
const mentorCompetencies = ref([])
const studentCompetencies = ref([])
const docentCompetencies = ref([])
const studentBeschrijvingen = ref({})
const docentNaam = ref('')
const algemeneFeedback = ref('')
const loading = ref(false)
const error = ref('')
const succes = ref('')
const bestaandRapport = ref(null)

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

async function laadCompetencies() {
  const token = localStorage.getItem('token')
  const res = await fetch(`http://10.2.160.246:3000/api/evaluatie-competenties/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const result = await res.json()
  if (!res.ok) {
    error.value = result.error || 'Kon competenties niet ophalen'
    return []
  }
  return result.competenties.map(c => ({
    ...c,
    geselecteerd: null,
    niveaus: c.evaluatie_niveaus
  }))
}

function vulScoresIn(competentiesArray, evaluatie) {
  scoreVelden.forEach((veld, i) => {
    const score = evaluatie[veld]
    if (score !== null && score !== undefined && competentiesArray[i]) {
      const idx = competentiesArray[i].niveaus.findIndex(n => n.punten === score)
      if (idx !== -1) competentiesArray[i].geselecteerd = idx
    }
  })
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const basis = await laadCompetencies()
    mentorCompetencies.value = basis.map(c => ({ ...c, niveaus: [...c.niveaus] }))
    studentCompetencies.value = basis.map(c => ({ ...c, geselecteerd: null, niveaus: [...c.niveaus] }))
    docentCompetencies.value = basis.map(c => ({ ...c, geselecteerd: null, niveaus: [...c.niveaus] }))

    const [studentRes, mentorEvalRes, studentEvalRes, rapportRes, meRes] = await Promise.all([
      fetch(`http://10.2.160.246:3000/api/dashboards/docent/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/tussentijdse-evaluaties/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/student-evaluaties/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/tussentijdse-rapporten/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://10.2.160.246:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    const studentData = await studentRes.json()
    if (studentData.student) student.value = studentData.student

    const mentorEvalData = await mentorEvalRes.json()
    if (mentorEvalData.evaluatie) {
      mentorEvaluatieIngevuld.value = true
      vulScoresIn(mentorCompetencies.value, mentorEvalData.evaluatie)
    }

    const studentEvalData = await studentEvalRes.json()
    if (studentEvalData.evaluatie) {
      studentEvaluatieIngevuld.value = true
      vulScoresIn(studentCompetencies.value, studentEvalData.evaluatie)
      beschrijvingVelden.forEach(veld => {
        studentBeschrijvingen.value[veld] = studentEvalData.evaluatie[veld] || ''
      })
    }

    const rapportData = await rapportRes.json()
    if (rapportData.rapport) {
      bestaandRapport.value = rapportData.rapport
      vulScoresIn(docentCompetencies.value, rapportData.rapport)
      algemeneFeedback.value = rapportData.rapport.algemene_feedback || ''
    }

    const meData = await meRes.json()
    docentNaam.value = `${meData.user?.voornaam || ''} ${meData.user?.achternaam || ''}`
  } catch (err) {
    console.error(err)
  }
})

function selecteerNiveau(comp, idx) {
  comp.geselecteerd = idx
}

function totaalVan(competentiesArray) {
  return competentiesArray.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
}

function maxScore() {
  return mentorCompetencies.value.reduce((sum, c) => sum + c.niveaus[c.niveaus.length - 1].punten, 0)
}

function studentNaam() {
  if (!student.value) return '...'
  return `${student.value.voornaam} ${student.value.achternaam}`
}

function alleIngevuld() {
  return docentCompetencies.value.every(c => c.geselecteerd !== null) && algemeneFeedback.value.trim()
}

async function indienen() {
  if (!alleIngevuld()) {
    error.value = 'Selecteer een niveau voor elke competentie en vul algemene feedback in.'
    return
  }
  error.value = ''
  loading.value = true
  const token = localStorage.getItem('token')
  try {
    const scores = {}
    docentCompetencies.value.forEach((c, i) => {
      if (scoreVelden[i]) scores[scoreVelden[i]] = c.niveaus[c.geselecteerd].punten
    })

    const res = await fetch('http://10.2.160.246:3000/api/tussentijdse-rapporten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_id: studentId, ...scores, algemene_feedback: algemeneFeedback.value })
    })

    const result = await res.json()
    if (!res.ok) {
      error.value = result.error || 'Kon rapport niet opslaan'
      return
    }

    bestaandRapport.value = result.rapport
    succes.value = 'Tussentijds rapport opgeslagen!'
    setTimeout(() => router.push(`/docent/studenten/${studentId}/tussentijds-rapport/overzicht`), 1000)
    
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
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
      <a class="back-link" @click="router.push(`/docent/studenten/${studentId}/bespreking`)">← Terug naar bespreking</a>
      <h1>Tussentijds rapport opstellen</h1>
      <p class="subtitle">Voor {{ studentNaam() }} — finale beoordeling op basis van mentor en zelfevaluatie</p>

      <div v-if="bestaandRapport" class="info-banner">
        ℹ️ Er bestaat al een rapport voor deze student. Wijzigingen overschrijven het bestaande rapport.
      </div>

      <!-- Legenda -->
      <div class="legenda">
        <div class="legenda-item">
          <div class="legenda-kleur rood"></div>
          <span>Beoordeling mentor</span>
        </div>
        <div class="legenda-item">
          <div class="legenda-kleur blauw"></div>
          <span>Zelfevaluatie student</span>
        </div>
        <div class="legenda-item">
          <div class="legenda-kleur groen"></div>
          <span>Finale beoordeling docent</span>
        </div>
      </div>

      <!-- MENTOR -->
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
          <span class="totaal-waarde punten-rood">{{ totaalVan(mentorCompetencies) }} / {{ maxScore() }}</span>
        </div>
      </div>

      <!-- STUDENT -->
      <h2 class="sectie-titel" style="margin-top: 32px;">✍️ Zelfevaluatie student</h2>
      <div v-if="!studentEvaluatieIngevuld" class="wacht-banner">
        <span>⏳</span>
        <p>De student heeft nog geen zelfevaluatie ingediend.</p>
      </div>
      <div v-else class="rubriek-tabel-wrap">
        <div class="rubriek-header">
          <span class="rh-criteria">Criteria</span>
          <span class="rh-beoordelingen">Beoordelingen</span>
          <span class="rh-punten">Punten</span>
        </div>
        <div v-for="(comp, i) in studentCompetencies" :key="'student-' + comp.naam" class="comp-blok">
          <div class="comp-rij">
            <div class="cel-criteria">
              <strong>{{ comp.naam }}</strong>
              <p>{{ comp.beschrijving }}</p>
            </div>
            <div class="niveaus-wrap">
              <div
                v-for="(niveau, idx) in comp.niveaus"
                :key="niveau.label"
                class="cel-niveau"
                :class="{ 'geselecteerd-blauw': comp.geselecteerd === idx }"
                :style="{ width: (100 / comp.niveaus.length) + '%' }"
              >
                <span class="niveau-punten blauw-punten">{{ niveau.punten }} ptn</span>
                <span class="niveau-label">{{ niveau.label }}</span>
              </div>
            </div>
            <div class="cel-punten">
              <span v-if="comp.geselecteerd !== null" class="punten-blauw">
                {{ comp.niveaus[comp.geselecteerd].punten }} / {{ comp.niveaus[comp.niveaus.length - 1].punten }}
              </span>
              <span v-else class="nog-geen">—</span>
            </div>
          </div>
          <div class="beschrijving-rij" v-if="studentBeschrijvingen[beschrijvingVelden[i]]">
            <span class="beschrijving-label">Beschrijving student</span>
            <p class="beschrijving-tekst">{{ studentBeschrijvingen[beschrijvingVelden[i]] }}</p>
          </div>
        </div>
        <div class="totaal-rij">
          <span class="totaal-label">Score student</span>
          <span class="totaal-waarde punten-blauw">{{ totaalVan(studentCompetencies) }} / {{ maxScore() }}</span>
        </div>
      </div>

      <!-- DOCENT FINALE BEOORDELING -->
      <h2 class="sectie-titel" style="margin-top: 32px;">🟢 Jouw finale beoordeling</h2>
      <p class="sectie-hint">Selecteer per competentie het niveau dat volgens jou het best overeenkomt, rekening houdend met mentor en student.</p>

      <div class="rubriek-tabel-wrap">
        <div class="rubriek-header">
          <span class="rh-criteria">Criteria</span>
          <span class="rh-beoordelingen">Beoordelingen</span>
          <span class="rh-punten">Punten</span>
        </div>
        <div v-for="comp in docentCompetencies" :key="'docent-' + comp.naam" class="comp-rij">
          <div class="cel-criteria">
            <strong>{{ comp.naam }}</strong>
            <p>{{ comp.beschrijving }}</p>
          </div>
          <div class="niveaus-wrap">
            <div
              v-for="(niveau, idx) in comp.niveaus"
              :key="niveau.label"
              class="cel-niveau klikbaar"
              :class="{ 'geselecteerd-groen': comp.geselecteerd === idx }"
              :style="{ width: (100 / comp.niveaus.length) + '%' }"
              @click="selecteerNiveau(comp, idx)"
            >
              <span class="niveau-punten groen-punten">{{ niveau.punten }} ptn</span>
              <span class="niveau-label">{{ niveau.label }}</span>
              <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
            </div>
          </div>
          <div class="cel-punten">
            <span v-if="comp.geselecteerd !== null" class="punten-groen">
              {{ comp.niveaus[comp.geselecteerd].punten }} / {{ comp.niveaus[comp.niveaus.length - 1].punten }}
            </span>
            <span v-else class="nog-geen">—</span>
          </div>
        </div>
        <div class="totaal-rij">
          <span class="totaal-label">Finale score</span>
          <span class="totaal-waarde punten-groen">{{ totaalVan(docentCompetencies) }} / {{ maxScore() }}</span>
        </div>
      </div>

      <section class="feedback-section">
        <h2>Algemene feedback</h2>
        <p>Schrijf een globale reflectie over de voortgang van {{ student?.voornaam }} tot nu toe.</p>
        <textarea v-model="algemeneFeedback" placeholder="Schrijf hier je algemene feedback..."></textarea>
      </section>

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="succes" class="succes-msg">{{ succes }}</div>

      <div class="actions">
        <button class="cancel-btn" @click="router.push(`/docent/studenten/${studentId}/bespreking`)">← Terug</button>
        <button class="submit-btn" :disabled="loading" @click="indienen">
          <span v-if="loading">Opslaan...</span>
          <span v-else>{{ bestaandRapport ? '✓ Rapport bijwerken' : '✓ Rapport opslaan' }}</span>
        </button>
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
.subtitle { margin: 0 0 20px; color: #64748b; font-size: 14px; }
.sectie-titel { font-size: 18px; font-weight: 800; margin: 0 0 6px; }
.sectie-hint { margin: 0 0 14px; color: #64748b; font-size: 13px; }

.info-banner { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }

.legenda { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.legenda-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #334155; }
.legenda-kleur { width: 16px; height: 16px; border-radius: 4px; }
.legenda-kleur.rood { background: #fee2e2; border: 2px solid #991b1b; }
.legenda-kleur.blauw { background: #dbeafe; border: 2px solid #1d4ed8; }
.legenda-kleur.groen { background: #dcfce7; border: 2px solid #15803d; }

.wacht-banner { display: flex; gap: 12px; background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 13px; color: #854d0e; }
.wacht-banner p { margin: 0; }

.rubriek-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 24px; }
.rubriek-header { display: flex; align-items: center; background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 12px 16px; }
.rh-criteria { width: 200px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-beoordelingen { flex: 1; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.rh-punten { width: 90px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; text-align: right; }

.comp-blok { border-top: 1px solid #f1f5f9; }
.comp-rij { display: flex; align-items: stretch; border-top: 1px solid #f1f5f9; }
.comp-rij:first-child { border-top: none; }
.cel-criteria { width: 200px; flex-shrink: 0; padding: 18px 16px; border-right: 1px solid #f1f5f9; }
.cel-criteria strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.cel-criteria p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }
.niveaus-wrap { flex: 1; display: flex; }
.cel-niveau { padding: 12px; border-left: 1px solid #f1f5f9; cursor: default; }
.cel-niveau.klikbaar { cursor: pointer; transition: background 0.15s; }
.cel-niveau.klikbaar:hover { background: #f0fdf4; }
.cel-niveau.geselecteerd-rood { background: #fef2f2; box-shadow: inset 0 0 0 2px #991b1b; }
.cel-niveau.geselecteerd-blauw { background: #eff6ff; box-shadow: inset 0 0 0 2px #1d4ed8; }
.cel-niveau.geselecteerd-groen { background: #f0fdf4; box-shadow: inset 0 0 0 2px #15803d; }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; margin-bottom: 2px; }
.rood-punten { color: #991b1b; }
.blauw-punten { color: #1d4ed8; }
.groen-punten { color: #15803d; }
.niveau-label { display: block; font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.niveau-beschrijving { margin: 0; font-size: 10px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.cel-punten { width: 90px; flex-shrink: 0; padding: 18px 16px; text-align: right; font-size: 14px; font-weight: 800; border-left: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: flex-end; }
.nog-geen { color: #cbd5e1; font-weight: 600; }
.punten-rood { color: #991b1b; }
.punten-blauw { color: #1d4ed8; }
.punten-groen { color: #15803d; }

.beschrijving-rij { padding: 12px 16px 16px; border-top: 1px solid #f1f5f9; background: #fafcff; }
.beschrijving-label { display: block; font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; margin-bottom: 6px; }
.beschrijving-tekst { margin: 0; font-size: 13px; color: #334155; line-height: 1.6; }

.totaal-rij { display: flex; justify-content: flex-end; align-items: center; gap: 24px; padding: 16px; border-top: 2px solid #e5e7eb; }
.totaal-label { font-size: 13px; font-weight: 700; color: #64748b; }
.totaal-waarde { font-size: 16px; font-weight: 800; min-width: 90px; text-align: right; }

.feedback-section { margin: 10px 0 26px; }
.feedback-section h2 { margin: 0 0 6px; font-size: 18px; font-weight: 700; }
.feedback-section p { margin: 0 0 14px; color: #64748b; font-size: 13px; }
textarea { width: 100%; min-height: 120px; border: 1px solid #cbd5e1; border-radius: 14px; padding: 16px; resize: vertical; color: #334155; line-height: 1.5; background: white; font-size: 14px; font-family: inherit; }
textarea:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.12); }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .rubriek-tabel-wrap { overflow-x: auto; }
  .content { padding: 24px 16px 40px; }
  .actions { flex-direction: column; gap: 12px; }
}
</style>