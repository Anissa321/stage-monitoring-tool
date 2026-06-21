<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const rapport = ref(null)
const competenties = ref([])
const loading = ref(true)
const error = ref('')

const scoreVelden = [
  'communicatie_score',
  'probleemoplossing_score',
  'teamwork_score',
  'vaktechnisch_score'
]

onMounted(async () => {
  const token = localStorage.getItem('token')
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  try {
    const [dashRes, rapportRes, compRes] = await Promise.all([
      fetch('http://10.2.160.246:3000/api/dashboards/student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/tussentijdse-rapporten/student/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`http://10.2.160.246:3000/api/evaluatie-competenties/mijn-opleiding`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    const dashData = await dashRes.json()
    user.value = dashData.user

    const rapportData = await rapportRes.json()
    if (!rapportData.rapport) {
      error.value = 'Je docent heeft nog geen tussentijds rapport opgesteld.'
    } else {
      rapport.value = rapportData.rapport
    }

    const compData = await compRes.json()
    if (compData.competenties) {
      competenties.value = compData.competenties.map((c, i) => {
        const maxPunten = c.evaluatie_niveaus?.length
          ? Math.max(...c.evaluatie_niveaus.map(n => n.punten))
          : 0
        return {
          naam: c.naam,
          beschrijving: c.beschrijving,
          maxPunten,
          behaald: rapportData.rapport ? (rapportData.rapport[scoreVelden[i]] || 0) : 0
        }
      })
    }
  } catch (err) {
    console.error(err)
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
})

const totaalScore = computed(() => rapport.value?.totaal_score || 0)

const beoordelingLabel = computed(() => {
  const t = totaalScore.value
  if (t >= 80) return 'Uitstekend'
  if (t >= 65) return 'Goed — op schema'
  if (t >= 50) return 'Voldoende — aandachtspunten aanwezig'
  return 'Onvoldoende — opvolging nodig'
})

const scoreKleur = computed(() => {
  const t = totaalScore.value
  if (t >= 65) return 'groen'
  if (t >= 50) return 'oranje'
  return 'rood'
})

function voornaam() { return user.value?.voornaam || 'Student' }
function initialen() {
  if (!user.value) return 'S'
  return (user.value.voornaam?.[0] || '') + (user.value.achternaam?.[0] || '')
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

function downloadPdf() {
  const token = localStorage.getItem('token')
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  fetch(`http://10.2.160.246:3000/api/tussentijdse-rapporten/student/${userData.id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    })
    .catch(() => {
      error.value = 'Kon PDF niet openen'
    })
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

    <main class="content">
      <a class="back-link" @click="router.push('/student/evaluatie/tussentijds')">← Terug naar tussentijdse evaluatie</a>

      <div v-if="loading" class="loading">Laden...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <div v-else>
        <div class="header-row">
          <div>
            <h1>Tussentijds rapport</h1>
            <p class="subtitle">Finale beoordeling door je docent</p>
          </div>
          <div class="header-acties">
            <span class="status-badge">✓ Afgerond</span>
            <button class="download-btn" @click="downloadPdf">📄 Download PDF</button>
          </div>
        </div>

        <section class="score-card">
          <div class="score-cirkel" :class="scoreKleur">
            <span class="score-getal">{{ totaalScore }}</span>
            <span class="score-max">/ 100</span>
          </div>
          <div class="score-info">
            <h2>{{ beoordelingLabel }}</h2>
            <p>Gewogen totaalscore op basis van {{ competenties.length }} competenties</p>
          </div>
        </section>

        <h2 class="sectie-titel">Competentiescores</h2>
        <div class="tabel-wrap">
          <div class="tabel-header">
            <span class="th-naam">Competentie</span>
            <span class="th-gewicht">Gewicht</span>
            <span class="th-score">Score</span>
          </div>
          <div v-for="comp in competenties" :key="comp.naam" class="tabel-rij">
            <div class="td-naam">
              <strong>{{ comp.naam }}</strong>
              <p>{{ comp.beschrijving }}</p>
            </div>
            <span class="td-gewicht">{{ comp.maxPunten }}%</span>
            <span class="td-score">{{ comp.behaald }} / {{ comp.maxPunten }}</span>
          </div>
        </div>

        <h2 class="sectie-titel">Algemene feedback</h2>
        <div class="feedback-card">
          <p>{{ rapport?.algemene_feedback || 'Geen feedback ingevuld.' }}</p>
        </div>
      </div>
    </main>
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

.content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 20px; }
.back-link:hover { color: #991b1b; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 12px; padding: 16px 20px; font-size: 14px; font-weight: 600; }

.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.header-row h1 { margin: 0 0 4px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }
.header-acties { display: flex; align-items: center; gap: 12px; }
.status-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.download-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 10px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.download-btn:hover { background: #f8fafc; border-color: #991b1b; color: #991b1b; }

.score-card { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 28px; display: flex; align-items: center; gap: 28px; box-shadow: 0 8px 20px rgba(15,23,42,0.04); margin-bottom: 28px; flex-wrap: wrap; }
.score-cirkel { width: 110px; height: 110px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.score-cirkel.groen { background: #dcfce7; color: #166534; }
.score-cirkel.oranje { background: #fef3c7; color: #92400e; }
.score-cirkel.rood { background: #fee2e2; color: #991b1b; }
.score-getal { font-size: 32px; font-weight: 800; line-height: 1; }
.score-max { font-size: 12px; font-weight: 700; }
.score-info { flex: 1; min-width: 200px; }
.score-info h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.score-info p { margin: 0; color: #64748b; font-size: 14px; }

.sectie-titel { font-size: 20px; font-weight: 800; margin: 0 0 14px; }

.tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 28px; }
.tabel-header { display: flex; align-items: center; background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 14px 20px; }
.th-naam { flex: 1; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.th-gewicht { width: 100px; text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.th-score { width: 100px; text-align: right; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.tabel-rij { display: flex; align-items: center; padding: 16px 20px; border-top: 1px solid #f1f5f9; }
.td-naam { flex: 1; }
.td-naam strong { display: block; font-size: 15px; font-weight: 700; margin-bottom: 2px; }
.td-naam p { margin: 0; color: #64748b; font-size: 12px; }
.td-gewicht { width: 100px; text-align: center; font-weight: 700; color: #334155; font-size: 14px; }
.td-score { width: 100px; text-align: right; font-weight: 800; color: #0f172a; font-size: 14px; }

.feedback-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.feedback-card p { margin: 0; color: #334155; line-height: 1.7; font-size: 14px; white-space: pre-wrap; }

@media (max-width: 700px) {
  .content { padding: 24px 16px 40px; }
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .score-card { flex-direction: column; text-align: center; }
  .tabel-header { display: none; }
  .tabel-rij { flex-direction: column; align-items: flex-start; gap: 6px; }
  .td-gewicht, .td-score { width: auto; text-align: left; }
}
</style>