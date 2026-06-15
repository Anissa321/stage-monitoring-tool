<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logboeken = ref([])
const weekFeedback = ref({})
const user = ref(null)

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    console.log(err)
  }
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
}

function formatDatum(datum) {
  return new Date(datum).toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function statusClass(status) {
  if (status === 'goedgekeurd') return 'submitted'
  if (status === 'ingediend') return 'submitted'
  if (status === 'concept') return 'draft'
  if (status === 'niet_ingevuld') return 'empty'
  if (status === 'vrije_dag') return 'free'
  return 'draft'
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return 'Ingediend'
  if (status === 'ingediend') return 'Ingediend'
  if (status === 'concept') return 'Concept'
  if (status === 'niet_ingevuld') return 'Nog niet ingevuld'
  if (status === 'vrije_dag') return 'Vrije dag'
  return status
}

function korteCompetentie(competentie) {
  if (competentie === 'Communicatie') return 'Comm.'
  if (competentie === 'Probleemoplossing') return 'Prob.'
  if (competentie === 'Teamwork') return 'Team.'
  if (competentie === 'Vaktechnisch handelen') return 'Vakt.'
  return competentie
}

function klikOpCard(logboek) {
  if (logboek.status === 'vrije_dag') return
  router.push(`/student/logboek-invullen?id=${logboek.id}`)
}

async function resetLogboek(logboek) {
  if (!confirm(`Logboek van ${formatDatum(logboek.datum)} resetten?`)) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/logboeken/${logboek.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const index = logboeken.value.findIndex(l => l.id === logboek.id)
      if (index !== -1) {
        logboeken.value[index] = {
          ...logboeken.value[index],
          status: 'niet_ingevuld',
          tasks: null,
          uren_gewerkt: 0,
          competenties: []
        }
      }
    } else {
      const data = await res.json()
      alert(data.error || 'Kon logboek niet resetten')
    }
  } catch (err) {
    console.error(err)
  }
}

const logboekenPerWeek = computed(() => {
  const groepen = {}
  logboeken.value.forEach((logboek) => {
    const week = logboek.week_number
    if (!groepen[week]) groepen[week] = []
    groepen[week].push(logboek)
  })
  return Object.keys(groepen)
    .sort((a, b) => Number(b) - Number(a))
    .map((week) => ({
      week,
      logboeken: groepen[week].sort((a, b) => new Date(a.datum) - new Date(b.datum)),
      feedback: weekFeedback.value[week] || null,
      week_status: groepen[week][0]?.week_status || null
    }))
})

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const [logRes, dashRes, reviewRes] = await Promise.all([
      fetch('http://localhost:3000/api/logboeken/mijn', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/dashboards/student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/logboeken/mijn/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    const logData = await logRes.json()
    const dashData = await dashRes.json()

    logboeken.value = logData.logboeken || []
    user.value = dashData.user

    if (reviewRes.ok) {
      const reviewData = await reviewRes.json()
      reviewData.reviews?.forEach(r => {
        weekFeedback.value[r.week_number] = {
          feedback: r.week_feedback,
          mentor_naam: r.mentor_naam,
          status: r.week_status
        }
      })
    }
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <main class="logboek-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a class="active">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ user?.voornaam || 'Student' }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ user?.voornaam?.[0] || 'S' }}</div>
      </div>
    </header>

    <div class="page-content">
      <section class="hero">
        <p class="label">Stage Logboek</p>
        <h1>Mijn Logboek</h1>
        <p class="subtitle">Overzicht van je ingediende logboeken</p>
      </section>

      <section class="week-section">
        <div class="section-header">
          <h2>Logboeken per week</h2>
        </div>

        <section v-for="weekGroep in logboekenPerWeek" :key="weekGroep.week" class="week-block">
          <div class="week-title">
            <h2>
              Week {{ weekGroep.week }}
              <span v-if="Number(weekGroep.week) === 13" class="week-badge blue">Huidige week</span>
              <span v-if="weekGroep.week_status === 'goedgekeurd'" class="week-badge green">✓ Ingediend</span>
              <span v-else-if="weekGroep.week_status === 'ingediend'" class="week-badge green">✓ Ingediend</span>
              <span v-else-if="weekGroep.week_status === 'afgekeurd'" class="week-badge red">✗ Afgekeurd</span>
            </h2>
          </div>

          <div class="cards">
            <article
              v-for="logboek in weekGroep.logboeken"
              :key="logboek.id"
              class="day-card"
              :class="[statusClass(logboek.status), (logboek.status !== 'niet_ingevuld' && logboek.status !== 'vrije_dag') ? 'clickable' : '']"
              @click="klikOpCard(logboek)"
            >
              <h3>{{ formatDatum(logboek.datum) }}</h3>
              <span class="status">{{ statusLabel(logboek.status) }}</span>

              <p v-if="logboek.tasks" class="taken-preview">{{ logboek.tasks }}</p>
              <p v-if="logboek.uren_gewerkt" class="hours">{{ logboek.uren_gewerkt }} uur gewerkt</p>

              <div v-if="logboek.competenties && logboek.competenties.length" class="tags">
                <span v-for="competentie in logboek.competenties" :key="competentie.naam || competentie">
                  {{ korteCompetentie(competentie.naam || competentie) }}
                </span>
              </div>

              <button
                v-if="logboek.status === 'niet_ingevuld'"
                class="fill-card-btn"
                @click.stop="router.push(`/student/logboek-invullen?id=${logboek.id}`)"
              >
                + Logboek invullen
              </button>

              <div v-if="logboek.status === 'ingediend' && logboek.datum === '2026-05-08'" class="card-actions">
                <div class="readonly-badge">🔒 Niet meer aanpasbaar</div>
                <button class="delete-btn" @click.stop="resetLogboek(logboek)">🗑 Reset</button>
              </div>

              <div v-if="logboek.status === 'ingediend' && logboek.datum !== '2026-05-08'" class="readonly-badge">
                🔒 Niet meer aanpasbaar
              </div>

              <div v-if="logboek.status === 'goedgekeurd'" class="readonly-badge">
                🔒 Niet meer aanpasbaar
              </div>
            </article>
          </div>

          <div v-if="weekGroep.feedback" class="feedback-card">
            <h3>Feedback van {{ weekGroep.feedback.mentor_naam || 'Mentor' }} — Week {{ weekGroep.week }}</h3>
            <p>{{ weekGroep.feedback.feedback }}</p>
          </div>
        </section>
      </section>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; font-family: 'Inter', sans-serif; }

.logboek-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }

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

.page-content { padding: 40px 64px; }

.hero { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }

.label { color: #991b1b; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }

.hero h1 { margin: 10px 0; font-size: 38px; color: #0f172a; }

.subtitle { color: #64748b; }

.week-section { margin-top: 32px; }

.section-header { margin-bottom: 28px; }

.section-header h2 { color: #0f172a; margin: 0; }

.week-block { margin-bottom: 42px; }

.week-title { margin-bottom: 18px; }

.week-title h2 { margin: 0; color: #0f172a; font-size: 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.week-badge { padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.week-badge.green { background: #dcfce7; color: #15803d; }
.week-badge.red { background: #fee2e2; color: #991b1b; }
.week-badge.blue { background: #dbeafe; color: #1d4ed8; }

.cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }

.day-card { background: white; border-radius: 18px; padding: 18px; min-height: 180px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); transition: box-shadow 0.2s, transform 0.2s; }

.day-card.clickable { cursor: pointer; }
.day-card.clickable:hover { box-shadow: 0 12px 28px rgba(15,23,42,0.1); transform: translateY(-2px); }

.day-card h3 { font-size: 15px; margin-bottom: 12px; text-transform: capitalize; }

.status { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }

.taken-preview { margin-top: 10px; font-size: 12px; color: #64748b; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.hours { margin-top: 8px; color: #0f172a; font-weight: 600; font-size: 13px; }

.day-card.submitted { border-top: 5px solid #16a34a; }
.day-card.draft { border-top: 5px solid #64748b; }
.day-card.empty { border-top: 5px solid #991b1b; }
.day-card.free { border-top: 5px solid #3b82f6; }

.day-card.submitted .status { background: #dcfce7; color: #166534; }
.day-card.draft .status { background: #e2e8f0; color: #475569; }
.day-card.empty .status { background: #fee2e2; color: #991b1b; }
.day-card.free .status { background: #dbeafe; color: #1d4ed8; }

.tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }

.tags span { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }

.fill-card-btn { margin-top: 18px; border: none; background: #991b1b; color: white; padding: 9px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; width: 100%; }
.fill-card-btn:hover { background: #7f1d1d; }

.card-actions { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; }

.readonly-badge { margin-top: 10px; font-size: 11px; color: #94a3b8; }

.delete-btn { border: none; background: transparent; color: #ef4444; font-size: 11px; font-weight: 600; cursor: pointer; padding: 0; }
.delete-btn:hover { color: #dc2626; }

.feedback-card { margin-top: 20px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 20px; padding: 24px; }
.feedback-card h3 { margin-bottom: 12px; color: #991b1b; font-size: 16px; }
.feedback-card p { color: #475569; margin: 0; }

@media (max-width: 1200px) { .cards { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 1000px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-content { padding: 24px 20px; }
}
</style>