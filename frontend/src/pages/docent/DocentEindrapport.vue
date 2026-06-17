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