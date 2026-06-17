<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

// Mock data — later vervangen door API
// status: 'geslaagd' | 'niet_geslaagd'
const eindrapport = ref({
  status: 'geslaagd',
  student_naam: 'Anissa Canton',
  bedrijf: 'Acme Corp',
  periode: 'februari — april 2026',
  beoordeeld_door: 'Jan De Vries',
  logboeken_ingevuld: 63,
  logboeken_totaal: 65,
  aanwezigheid_pct: 97,
  eindpresentatie_score: 17,
  eindpresentatie_max: 20,
  totaal_score: 16,
  totaal_max: 20,
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
  ]
})

const docent = ref(null)
const isGeslaagd = computed(() => eindrapport.value.status === 'geslaagd')

function sterren(score, max) {
  const aantal = Math.round((score / max) * 5)
  return Array.from({ length: 5 }, (_, i) => i < aantal)
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    docent.value = data.user
    // TODO: fetch eindrapport van deze student
    // const rapportRes = await fetch(`http://localhost:3000/api/eindrapporten/student/${studentId}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // eindrapport.value = await rapportRes.json()
  } catch (err) {
    console.error(err)
  }
})
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
        <a @click="router.push('/docent/studenten')">Studenten</a>
        <a class="active">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ docent?.voornaam || 'Docent' }}</span>
      </div>
    </header>

    <template>
  <main class="page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/docent/dashboard')">Dashboard</a>
        <a @click="router.push('/docent/studenten')">Studenten</a>
        <a class="active">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ docent?.voornaam || 'Docent' }}</span>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push(`/docent/studenten/${studentId}`)">← Terug naar studentdossier</a>

      <div class="titel-rij">
        <div>
          <h1>Eindrapport</h1>
          <p class="subtitle">Stage-evaluatie {{ eindrapport.student_naam }} • {{ eindrapport.bedrijf }} • {{ eindrapport.periode }}</p>
        </div>
        <span class="status-pill" :class="isGeslaagd ? 'geslaagd' : 'gefaald'">
          {{ isGeslaagd ? '✓ Afgerond' : '✕ Niet geslaagd' }}
        </span>
      </div>

      <!-- Scorekaart -->
      <div class="score-card">
        <div class="score-links">
          <div class="score-cirkel" :class="isGeslaagd ? 'groen' : 'rood'">
            <span class="score-getal">{{ eindrapport.totaal_score }}</span>
            <span class="score-max">/ {{ eindrapport.totaal_max }}</span>
          </div>
          <div class="score-info">
            <h2>{{ isGeslaagd ? 'Geslaagd met onderscheiding' : 'Niet geslaagd' }}</h2>
            <p>Gewogen gemiddelde op basis van {{ eindrapport.competenties.length }} competenties</p>
            <div class="mini-stats">
              <div class="mini-stat">
                <span class="mini-label">Logboeken</span>
                <strong>{{ eindrapport.logboeken_ingevuld }} / {{ eindrapport.logboeken_totaal }} dagen</strong>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Aanwezigheid</span>
                <strong>{{ eindrapport.aanwezigheid_pct }}%</strong>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Eindpresentatie</span>
                <strong>{{ eindrapport.eindpresentatie_score }} / {{ eindrapport.eindpresentatie_max }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="score-rechts">
          <span class="overall-label">Overall beoordeling</span>
          <div class="sterren-rij">
            <span v-for="(vol, i) in sterren(eindrapport.totaal_score, eindrapport.totaal_max)" :key="i" class="ster" :class="{ vol }">★</span>
          </div>
          <strong class="beoordeling-label" :class="isGeslaagd ? 'groen-tekst' : 'rood-tekst'">{{ eindrapport.algemene_beoordeling }}</strong>
          <p class="beoordeeld-door">Beoordeeld door {{ eindrapport.beoordeeld_door }}</p>
        </div>
      </div>

      <!-- Competentiescores -->
      <h2 class="sectie-titel">Competentiescores</h2>
      <div class="comp-tabel-wrap">
        <table class="comp-tabel">
          <thead>
            <tr>
              <th class="col-comp">Competentie</th>
              <th class="col-gewicht">Gewicht</th>
              <th class="col-score">Score</th>
              <th class="col-gewogen">Gewogen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in eindrapport.competenties" :key="comp.naam">
              <td class="cel-comp">
                <strong>{{ comp.naam }}</strong>
                <p>{{ comp.beschrijving }}</p>
              </td>
              <td class="cel-gewicht">{{ comp.gewicht }}%</td>
              <td class="cel-score" :class="isGeslaagd ? 'groen-tekst' : 'rood-tekst'">{{ comp.score }} / {{ comp.max }}</td>
              <td class="cel-gewogen">{{ comp.gewogen }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Feedback samenvatting -->
      <h2 class="sectie-titel">Feedback samenvatting</h2>
      <div class="feedback-grid">
        <div class="feedback-card sterk">
          <h3>✅ Sterke punten</h3>
          <ul>
            <li v-for="(punt, i) in eindrapport.sterke_punten" :key="i">{{ punt }}</li>
          </ul>
        </div>
        <div class="feedback-card verbeter">
          <h3>🎯 Verbeterpunten</h3>
          <ul>
            <li v-for="(punt, i) in eindrapport.verbeterpunten" :key="i">{{ punt }}</li>
          </ul>
        </div>
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
.profile { font-size: 14px; font-weight: 600; color: #334155; }

.content { max-width: 1000px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }

.titel-rij { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.titel-rij h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

.status-pill { padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.status-pill.geslaagd { background: #dcfce7; color: #15803d; }
.status-pill.gefaald { background: #fee2e2; color: #991b1b; }

.score-card { display: flex; justify-content: space-between; gap: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 28px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.score-links { display: flex; gap: 24px; align-items: center; }
.score-cirkel { width: 88px; height: 88px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.score-cirkel.groen { background: #dcfce7; }
.score-cirkel.rood { background: #fee2e2; }
.score-getal { font-size: 28px; font-weight: 800; color: #111827; }
.score-cirkel.groen .score-getal { color: #15803d; }
.score-cirkel.rood .score-getal { color: #991b1b; }
.score-max { font-size: 12px; color: #64748b; font-weight: 600; }

.score-info h2 { margin: 0 0 4px; font-size: 18px; font-weight: 800; }
.score-info > p { margin: 0 0 14px; color: #64748b; font-size: 13px; }
.mini-stats { display: flex; gap: 28px; }
.mini-stat { display: flex; flex-direction: column; gap: 4px; }
.mini-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; }
.mini-stat strong { font-size: 14px; color: #111827; }

.score-rechts { text-align: right; flex-shrink: 0; }
.overall-label { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 6px; }
.sterren-rij { display: flex; justify-content: flex-end; gap: 2px; margin-bottom: 6px; }
.ster { font-size: 16px; color: #e2e8f0; }
.ster.vol { color: #f59e0b; }
.beoordeling-label { display: block; font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.groen-tekst { color: #15803d; }
.rood-tekst { color: #991b1b; }
.beoordeeld-door { margin: 0; font-size: 11px; color: #94a3b8; }

.sectie-titel { font-size: 17px; font-weight: 800; margin: 0 0 14px; }

.comp-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 28px; }
.comp-tabel { width: 100%; border-collapse: collapse; }
.comp-tabel thead th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 20px; border-bottom: 1px solid #e5e7eb; }
.col-gewicht, .col-score, .col-gewogen { text-align: right; }
.comp-tabel tbody tr { border-top: 1px solid #f1f5f9; }
.cel-comp { padding: 16px 20px; }
.cel-comp strong { display: block; font-size: 14px; font-weight: 700; margin-bottom: 3px; }
.cel-comp p { margin: 0; font-size: 12px; color: #64748b; }
.cel-gewicht, .cel-score, .cel-gewogen { padding: 16px 20px; text-align: right; font-size: 14px; font-weight: 700; color: #334155; }
.cel-score { font-weight: 800; }

.feedback-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.feedback-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 22px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.feedback-card h3 { margin: 0 0 14px; font-size: 13px; font-weight: 800; }
.feedback-card.sterk h3 { color: #15803d; }
.feedback-card.verbeter h3 { color: #b45309; }
.feedback-card ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
.feedback-card li { font-size: 13px; color: #475569; line-height: 1.5; }

@media (max-width: 800px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .titel-rij { flex-direction: column; gap: 12px; }
  .score-card { flex-direction: column; }
  .score-rechts { text-align: left; }
  .sterren-rij { justify-content: flex-start; }
  .feedback-grid { grid-template-columns: 1fr; }
  .mini-stats { flex-wrap: wrap; gap: 16px; }
}
</style>