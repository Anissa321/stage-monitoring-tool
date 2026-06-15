<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

// Mock data — later vervangen door API
const evaluatie = ref({
  tussentijdse_score: 14,
  max_score: 20,
  stage_voortgang: 65,
  weken_voltooid: 13,
  totaal_weken: 20,
  competenties: [
    {
      naam: 'Communicatie',
      gewicht: 30,
      score: 4,
      max: 5,
      reflectie: 'Ik heb vaak samenwerkingsgedrag geleerd en geleerd om duidelijk te communiceren via mail en telefoon.',
      mentor_feedback: 'Goed in de klantentaak, blijf zo! Probeer ook tijdens vergaderingen meer initiatief te nemen.'
    },
    {
      naam: 'Probleemoplossing',
      gewicht: 30,
      score: 5,
      max: 5,
      reflectie: 'Ik heb verschillende bugs in de codebase kunnen oplossen door systematisch te analyseren.',
      mentor_feedback: 'Uitstekende analyse-skills! Anissa lost problemen snel en grondig op.'
    },
    {
      naam: 'Teamwork',
      gewicht: 25,
      score: 2,
      max: 5,
      reflectie: 'Ik werk goed in een team, maar mag soms meer initiatief nemen tijdens groepswerk.',
      mentor_feedback: 'Goede teamspeler, blijf actief deelnemen aan vergaderingen.'
    },
    {
      naam: 'Vaktechnisch handelen',
      gewicht: 15,
      score: 4,
      max: 5,
      reflectie: 'Ik heb React en Node.js toegepast in een echte productie-omgeving. De API integratie was uitdagend maar haalbaar.',
      mentor_feedback: 'Anissa heeft sterke technische skills. Snelle adoptie van nieuwe technologieën.'
    }
  ]
})

const totaalScore = computed(() => {
  return evaluatie.value.competenties.reduce((sum, c) => sum + c.score, 0)
})

const maxTotaal = computed(() => {
  return evaluatie.value.competenties.reduce((sum, c) => sum + c.max, 0)
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
    // TODO: fetch tussentijdse evaluatie data
    // const evalRes = await fetch('http://localhost:3000/api/evaluaties/tussentijds', {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // evaluatie.value = await evalRes.json()
  } catch (err) {
    console.error(err)
  }
})

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

function sterren(score, max) {
  return Array.from({ length: max }, (_, i) => i < score)
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
      <h1>Mijn evaluatie</h1>
      <p class="subtitle">Volg je voortgang per competentie.</p>

      <div class="overzicht-grid">
        <div class="overzicht-card">
          <p class="overzicht-label">Tussentijdse score</p>
          <div class="score-groot">
            <span class="score-num">{{ evaluatie.tussentijdse_score }}</span>
            <span class="score-max">/ {{ evaluatie.max_score }}</span>
          </div>
          <div class="sterren-rij">
            <span v-for="(vol, i) in sterren(evaluatie.tussentijdse_score, evaluatie.max_score)" :key="i" class="ster" :class="{ vol }">★</span>
          </div>
        </div>
        <div class="overzicht-card">
          <p class="overzicht-label">Stage voortgang</p>
          <div class="score-groot">
            <span class="score-num">{{ evaluatie.stage_voortgang }}</span>
            <span class="score-max">%</span>
          </div>
          <div class="voortgang-bar">
            <div class="voortgang-fill" :style="{ width: evaluatie.stage_voortgang + '%' }"></div>
          </div>
          <p class="voortgang-sub">{{ evaluatie.weken_voltooid }} van {{ evaluatie.totaal_weken }} weken voltooid</p>
        </div>
      </div>

      <h2 class="sectie-titel">Competenties</h2>

      <div v-for="comp in evaluatie.competenties" :key="comp.naam" class="comp-card">
        <div class="comp-header">
          <div>
            <h3>{{ comp.naam }}</h3>
            <div class="sterren-rij">
              <span v-for="(vol, i) in sterren(comp.score, comp.max)" :key="i" class="ster" :class="{ vol }">★</span>
            </div>
          </div>
          <span class="gewicht-badge">Gewicht: {{ comp.gewicht }}%</span>
        </div>

        <div class="reflectie-blok">
          <p class="blok-label">Mijn reflectie:</p>
          <p class="blok-tekst">{{ comp.reflectie }}</p>
        </div>

        <div class="feedback-blok">
          <details>
            <summary>Feedback van mentor:</summary>
            <p class="blok-tekst feedback-tekst">"{{ comp.mentor_feedback }}"</p>
          </details>
        </div>
      </div>

      <div class="rubriek-link" @click="router.push('/student/evaluatie/rubriek')">
        <span>📋 Bekijk de volledige beoordelingsrubriek</span>
        <span>→</span>
      </div>
    </section>
  </main>
</template>