<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

// Mock data — later vervangen door API
// Wissel status tussen 'geslaagd' en 'niet_geslaagd' om beide versies te testen
const eindrapport = ref({
  status: 'niet_geslaagd',
  bedrijf: 'Acme Corp',
  periode: 'februari — april 2026',
  beoordeeld_door: 'Jan De Vries',
  logboeken: '63 / 65 dagen',
  aanwezigheid_pct: 97,
  eindpresentatie: '17 / 20',
  totaal_score: 16,
  max_score: 20,
  algemene_beoordeling: 'Uitstekend',
  competenties: [
    { naam: 'Vaktechnisch handelen', beschrijving: 'Technische kennis correct toepassen', gewicht: 30, score: 16, max: 20, gewogen: 4.8 },
    { naam: 'Communicatie', beschrijving: 'Helder en effectief communiceren', gewicht: 25, score: 14, max: 20, gewogen: 3.5 },
    { naam: 'Probleemoplossing', beschrijving: 'Analyseren en creatief oplossen', gewicht: 25, score: 17, max: 20, gewogen: 4.25 },
    { naam: 'Teamwork & samenwerking', beschrijving: 'Effectief samenwerken in team', gewicht: 20, score: 15, max: 20, gewogen: 3.0 }
  ],
  sterke_punten: [
    'Sterke technische skills, snelle adoptie van nieuwe tech',
    'Neemt zelfstandig initiatief',
    'Goede communicatie met team en stakeholders',
    'Levert kwalitatief werk binnen deadlines',
    'Positieve feedback van mentor over werktraject'
  ],
  verbeterpunten: [
    'Meer aandacht voor architectuurkeuzes',
    'Code reviews actiever bijwonen',
    'Logboek consistenter dagelijks invullen',
    'Verdere groei in schaalbare code-design',
    'Presentatieskills verfijnen'
  ],
  herkansing: {
    academiejaar: '2026-2027',
    stappen: [
      { titel: 'Maak afspraak met je docent', beschrijving: 'Bespreek de evaluatie en het herkansingstraject met Jan De Vries voor 30 juni 2026.' },
      { titel: 'Schrijf je in voor herkansing', beschrijving: 'Inschrijving via EduMaFlex voor 1 september 2026. Vraag begeleiding aan de stagecommissie.' },
      { titel: 'Bereid je nieuwe stage voor', beschrijving: 'Stagestart in academiejaar 2026-2027. Werk vooraf aan verbeterpunten met je docent.' }
    ]
  }
})

const isGeslaagd = computed(() => eindrapport.value.status === 'geslaagd')

function scoreKleur(score, max) {
  const pct = score / max
  if (pct >= 0.7) return '#15803d'
  if (pct >= 0.5) return '#f59e0b'
  return '#991b1b'
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://10.2.160.246:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
  } catch (err) {
    console.error(err)
  }
})

function voornaam() { return data.value?.user?.voornaam || 'Student' }

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
  <main class="student-page">
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
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="router.push('/student/dashboard')">← Terug naar dashboard</button>
      <div class="title-row">
        <div>
          <h1>Mijn eindrapport</h1>
          <p>Stage afgerond bij {{ eindrapport.bedrijf }} • {{ eindrapport.periode }}</p>
        </div>
        <span class="status-badge" :class="isGeslaagd ? 'green' : 'red'">
          {{ isGeslaagd ? '✓ Afgerond' : '× Niet geslaagd' }}
        </span>
      </div>
    </section>

    <section class="alert" :class="isGeslaagd ? 'success' : 'danger'">
      <span v-if="isGeslaagd">Proficiat! Je hebt je stage met onderscheiding afgerond.</span>
      <span v-else>⚠ Je stage werd niet als geslaagd beoordeeld. Herkansing mogelijk in academiejaar {{ eindrapport.herkansing.academiejaar }}.</span>
    </section>

    <!-- Scorekaart -->
    <section class="result-card">
      <div class="score-circle" :class="isGeslaagd ? 'score-green' : 'score-red'">
        <strong>{{ eindrapport.totaal_score }}</strong>
        <span>/ {{ eindrapport.max_score }}</span>
      </div>
      <div class="result-info">
        <h2>{{ isGeslaagd ? 'Geslaagd met onderscheiding' : 'Niet geslaagd' }}</h2>
        <p>Gewogen gemiddelde op basis van {{ eindrapport.competenties.length }} competenties</p>
        <div class="result-stats">
          <div>
            <span>Logboeken</span>
            <strong>{{ eindrapport.logboeken }}</strong>
          </div>
          <div>
            <span>Aanwezigheid</span>
            <strong>{{ eindrapport.aanwezigheid_pct }}%</strong>
          </div>
          <div>
            <span>Eindpresentatie</span>
            <strong>{{ eindrapport.eindpresentatie }}</strong>
          </div>
        </div>
      </div>
      <div class="rating">
        <span>Overall beoordeling</span>
        <strong :class="isGeslaagd ? 'tekst-groen' : 'tekst-rood'">{{ eindrapport.algemene_beoordeling }}</strong>
        <p>Beoordeeld door {{ eindrapport.beoordeeld_door }}</p>
      </div>
    </section>

    <!-- Competentiescores -->
    <section class="section-block">
      <h2 class="sectie-titel">Competentiescores</h2>
      <div class="comp-tabel-wrap">
        <table class="comp-tabel">
          <thead>
            <tr>
              <th class="col-comp">Competentie</th>
              <th class="col-num">Gewicht</th>
              <th class="col-num">Score</th>
              <th class="col-num">Gewogen</th>
              <th class="col-visueel">Visueel</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in eindrapport.competenties" :key="comp.naam">
              <td class="cel-comp">
                <strong>{{ comp.naam }}</strong>
                <p>{{ comp.beschrijving }}</p>
              </td>
              <td class="cel-num">{{ comp.gewicht }}%</td>
              <td class="cel-num cel-score" :style="{ color: scoreKleur(comp.score, comp.max) }">{{ comp.score }} / {{ comp.max }}</td>
              <td class="cel-num">{{ comp.gewogen }}</td>
              <td class="cel-visueel">
                <div class="mini-bar">
                  <div class="mini-fill" :style="{ width: (comp.score / comp.max * 100) + '%', background: scoreKleur(comp.score, comp.max) }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Feedback samenvatting -->
    <section class="section-block">
      <h2 class="sectie-titel">Feedback samenvatting</h2>
      <div class="feedback-grid">
        <div class="feedback-card sterk">
          <h3>Sterke punten</h3>
          <ul>
            <li v-for="(punt, i) in eindrapport.sterke_punten" :key="i">{{ punt }}</li>
          </ul>
        </div>
        <div class="feedback-card verbeter">
          <h3>Verbeterpunten</h3>
          <ul>
            <li v-for="(punt, i) in eindrapport.verbeterpunten" :key="i">{{ punt }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Herkansingstraject — alleen bij niet geslaagd -->
    <section v-if="!isGeslaagd" class="section-block herkansing-block">
      <div class="herkansing-card">
        <h3>Herkansingstraject</h3>
        <p>Je hebt de mogelijkheid om je stage opnieuw te lopen in academiejaar {{ eindrapport.herkansing.academiejaar }}. Volg onderstaande stappen om je herkansing te organiseren.</p>
        <div class="stappen-grid">
          <div v-for="(stap, i) in eindrapport.herkansing.stappen" :key="i" class="stap-card">
            <div class="stap-nummer">{{ i + 1 }}</div>
            <strong>{{ stap.titel }}</strong>
            <p>{{ stap.beschrijving }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.student-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.page-header { margin: 36px 64px 20px; }
.back-btn { border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 16px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }
.title-row { display: flex; justify-content: space-between; align-items: flex-start; }
h1 { margin: 0; font-size: 28px; font-weight: 800; }
.page-header p { margin: 8px 0 0; color: #64748b; font-size: 14px; }

.status-badge { padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.status-badge.green { background: #dcfce7; color: #15803d; }
.status-badge.red { background: #fee2e2; color: #991b1b; }

.alert { margin: 0 64px 24px; padding: 14px 20px; border-radius: 14px; font-size: 14px; font-weight: 600; }
.alert.success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
.alert.danger { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

.result-card { margin: 0 64px 28px; background: white; border: 1px solid #e5e7eb; border-radius: 22px; padding: 28px; display: flex; gap: 28px; align-items: center; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.score-circle { width: 88px; height: 88px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.score-circle.score-green { background: #dcfce7; }
.score-circle.score-red { background: #fee2e2; }
.score-circle strong { font-size: 26px; font-weight: 800; }
.score-circle.score-green strong { color: #15803d; }
.score-circle.score-red strong { color: #991b1b; }
.score-circle span { font-size: 12px; color: #64748b; }

.result-info { flex: 1; }
.result-info h2 { margin: 0 0 4px; font-size: 18px; font-weight: 800; }
.result-info > p { margin: 0 0 14px; color: #64748b; font-size: 13px; }
.result-stats { display: flex; gap: 28px; }
.result-stats > div { display: flex; flex-direction: column; gap: 4px; }
.result-stats span { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.result-stats strong { font-size: 14px; }

.rating { text-align: right; flex-shrink: 0; }
.rating span { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
.rating strong { display: block; font-size: 15px; margin-bottom: 4px; }
.tekst-groen { color: #15803d; }
.tekst-rood { color: #991b1b; }
.rating p { margin: 0; font-size: 11px; color: #94a3b8; }

.section-block { margin: 0 64px 28px; }
.sectie-titel { font-size: 17px; font-weight: 800; margin: 0 0 14px; }

.comp-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.comp-tabel { width: 100%; border-collapse: collapse; }
.comp-tabel thead th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 20px; border-bottom: 1px solid #e5e7eb; }
.col-num { text-align: right; }
.col-visueel { width: 140px; }
.comp-tabel tbody tr { border-top: 1px solid #f1f5f9; }
.cel-comp { padding: 16px 20px; }
.cel-comp strong { display: block; font-size: 14px; font-weight: 700; margin-bottom: 3px; }
.cel-comp p { margin: 0; font-size: 12px; color: #64748b; }
.cel-num { padding: 16px 20px; text-align: right; font-size: 14px; font-weight: 700; color: #334155; }
.cel-score { font-weight: 800; }
.cel-visueel { padding: 16px 20px; }
.mini-bar { height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.mini-fill { height: 100%; border-radius: 999px; }

.feedback-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.feedback-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 22px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.feedback-card h3 { margin: 0 0 14px; font-size: 13px; font-weight: 800; }
.feedback-card.sterk h3 { color: #15803d; }
.feedback-card.verbeter h3 { color: #b45309; }
.feedback-card ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
.feedback-card li { font-size: 13px; color: #475569; line-height: 1.5; }

.herkansing-card { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 22px 24px; }
.herkansing-card h3 { margin: 0 0 8px; font-size: 15px; font-weight: 800; color: #9a3412; }
.herkansing-card > p { margin: 0 0 18px; font-size: 13px; color: #78350f; line-height: 1.5; }
.stappen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stap-card { background: white; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; }
.stap-nummer { width: 26px; height: 26px; border-radius: 50%; background: #ea580c; color: white; display: grid; place-items: center; font-size: 12px; font-weight: 800; margin-bottom: 10px; }
.stap-card strong { display: block; font-size: 13px; margin-bottom: 6px; color: #111827; }
.stap-card p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-header, .alert, .result-card, .section-block { margin-left: 20px; margin-right: 20px; }
  .result-card { flex-direction: column; align-items: flex-start; }
  .rating { text-align: left; }
  .feedback-grid { grid-template-columns: 1fr; }
  .stappen-grid { grid-template-columns: 1fr; }
}
</style>