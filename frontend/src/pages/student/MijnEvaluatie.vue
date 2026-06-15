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

.content { max-width: 860px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.overzicht-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
.overzicht-card { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.overzicht-label { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.score-groot { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
.score-num { font-size: 42px; font-weight: 800; color: #111827; }
.score-max { font-size: 20px; color: #94a3b8; font-weight: 600; }

.sterren-rij { display: flex; gap: 2px; }
.ster { font-size: 18px; color: #e2e8f0; }
.ster.vol { color: #f59e0b; }

.voortgang-bar { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin: 8px 0 6px; }
.voortgang-fill { height: 100%; background: #991b1b; border-radius: 999px; transition: width 0.6s ease; }
.voortgang-sub { margin: 0; font-size: 12px; color: #64748b; }

.sectie-titel { font-size: 18px; font-weight: 800; margin: 0 0 16px; }

.comp-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.comp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.comp-header h3 { margin: 0 0 6px; font-size: 16px; font-weight: 800; }
.gewicht-badge { background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }

.reflectie-blok { margin-bottom: 12px; }
.blok-label { margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #64748b; }
.blok-tekst { margin: 0; font-size: 13px; color: #334155; line-height: 1.6; }

.feedback-blok details { cursor: pointer; }
.feedback-blok summary { font-size: 12px; font-weight: 700; color: #64748b; list-style: none; display: flex; align-items: center; gap: 6px; }
.feedback-blok summary::before { content: '▶'; font-size: 9px; transition: 0.2s; }
.feedback-blok details[open] summary::before { content: '▼'; }
.feedback-tekst { margin: 8px 0 0; font-size: 13px; color: #475569; font-style: italic; line-height: 1.6; background: #f8fafc; border-left: 3px solid #e2e8f0; padding: 10px 14px; border-radius: 0 8px 8px 0; }

.rubriek-link { display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 20px; margin-top: 24px; cursor: pointer; font-size: 14px; font-weight: 600; color: #334155; transition: 0.2s; }
.rubriek-link:hover { background: #fee2e2; border-color: #fecaca; color: #991b1b; }

@media (max-width: 700px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .overzicht-grid { grid-template-columns: 1fr; }
}
</style>