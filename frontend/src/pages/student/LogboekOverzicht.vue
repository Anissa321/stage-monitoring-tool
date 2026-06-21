<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logboeken = ref([])
const weekFeedback = ref({})
const user = ref(null)
const loading = ref(true)
const huidigeWeekIndex = ref(null)

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://10.2.160.246:3000/api/auth/logout', {
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

function formatDatumKort(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' })
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

function weekStatusLabel(status) {
  if (status === 'goedgekeurd') return '✓ Goedgekeurd'
  if (status === 'ingediend') return '✓ Ingediend'
  if (status === 'afgekeurd') return '✗ Afgekeurd'
  return 'Nog niet afgerond'
}

function weekStatusKlasse(status) {
  if (status === 'goedgekeurd') return 'badge groen'
  if (status === 'ingediend') return 'badge groen'
  if (status === 'afgekeurd') return 'badge rood'
  return 'badge grijs'
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
    const res = await fetch(`http://10.2.160.246:3000/api/logboeken/${logboek.id}`, {
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

// Alle weken, gesorteerd oplopend op weeknummer (laagste eerst)
const alleWeken = computed(() => {
  const groepen = {}
  logboeken.value.forEach((logboek) => {
    const week = logboek.week_number
    if (!groepen[week]) groepen[week] = []
    groepen[week].push(logboek)
  })

  return Object.keys(groepen)
    .map(week => Number(week))
    .sort((a, b) => a - b)
    .map(week => {
      const dagen = groepen[week].sort((a, b) => new Date(a.datum) - new Date(b.datum))
      return {
        week,
        dagen,
        weekStatus: dagen[0]?.week_status || null,
        feedback: weekFeedback.value[week] || null
      }
    })
})

// De week die op dit moment getoond wordt
const huidigeWeek = computed(() => {
  if (huidigeWeekIndex.value === null || !alleWeken.value.length) return null
  return alleWeken.value[huidigeWeekIndex.value] || null
})

const kanVorige = computed(() => huidigeWeekIndex.value > 0)
const kanVolgende = computed(() => huidigeWeekIndex.value < alleWeken.value.length - 1)

function vorigeWeek() {
  if (kanVorige.value) huidigeWeekIndex.value--
}

function volgendeWeek() {
  if (kanVolgende.value) huidigeWeekIndex.value++
}

function springNaarWeek(weekNr) {
  const index = alleWeken.value.findIndex(w => w.week === Number(weekNr))
  if (index !== -1) huidigeWeekIndex.value = index
}

async function laadData() {
  const token = localStorage.getItem('token')

  try {
    await fetch('http://10.2.160.246:3000/api/logboeken/genereer-periode', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (genErr) {
    console.warn('Kon periode niet genereren:', genErr)
  }

  const [dashRes, logRes, reviewRes] = await Promise.all([
    fetch('http://10.2.160.246:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('http://10.2.160.246:3000/api/logboeken/mijn', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('http://10.2.160.246:3000/api/logboeken/mijn/reviews', {
      headers: { Authorization: `Bearer ${token}` }
    })
  ])

  const dashData = await dashRes.json()
  user.value = dashData.user

  const logData = await logRes.json()
  logboeken.value = logData.logboeken || []

  if (reviewRes.ok) {
    const reviewData = await reviewRes.json()
    weekFeedback.value = {}
    reviewData.reviews?.forEach(r => {
      weekFeedback.value[r.week_number] = {
        feedback: r.week_feedback,
        mentor_naam: r.mentor_naam,
        status: r.week_status
      }
    })
  }

  // Bepaal de huidige week op basis van vandaag, en zet die als startpunt
  const vandaag = new Date()
  const dagVanWeek = vandaag.getDay()
  const diffNaarMaandag = dagVanWeek === 0 ? -6 : 1 - dagVanWeek
  const maandag = new Date(vandaag)
  maandag.setDate(vandaag.getDate() + diffNaarMaandag)
  const maandagStr = maandag.toISOString().split('T')[0]

  const matchIndex = alleWeken.value.findIndex(w =>
    w.dagen.some(d => d.datum === maandagStr)
  )

  if (matchIndex !== -1) {
    huidigeWeekIndex.value = matchIndex
  } else if (alleWeken.value.length > 0) {
    huidigeWeekIndex.value = alleWeken.value.length - 1
  }
}

onMounted(async () => {
  try {
    await laadData()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
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
        <p class="subtitle">Bekijk je week, of spring naar een andere week</p>
      </section>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else-if="!huidigeWeek" class="leeg-bericht">
        Er zijn nog geen logboeken beschikbaar. Zorg dat je een goedgekeurd stagevoorstel hebt met een geldige periode.
      </div>

      <section v-else class="week-blok">
        <div class="week-navigatie">
          <button class="nav-pijl" :disabled="!kanVorige" @click="vorigeWeek">← Vorige</button>

          <div class="week-kiezer">
            <h2>Week {{ huidigeWeek.week }}</h2>
            <select :value="huidigeWeek.week" @change="springNaarWeek($event.target.value)" class="week-select">
              <option v-for="w in alleWeken" :key="w.week" :value="w.week">
                Week {{ w.week }} — {{ formatDatumKort(w.dagen[0]?.datum) }}
              </option>
            </select>
            <span :class="weekStatusKlasse(huidigeWeek.weekStatus)">{{ weekStatusLabel(huidigeWeek.weekStatus) }}</span>
          </div>

          <button class="nav-pijl" :disabled="!kanVolgende" @click="volgendeWeek">Volgende →</button>
        </div>

        <div class="cards">
          <article
            v-for="logboek in huidigeWeek.dagen"
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

            <div v-if="logboek.status === 'ingediend'" class="card-actions">
              <div class="readonly-badge">🔒 Niet meer aanpasbaar</div>
              <button class="delete-btn" @click.stop="resetLogboek(logboek)">🗑 Reset</button>
            </div>

            <div v-if="logboek.status === 'goedgekeurd'" class="readonly-badge">
              🔒 Niet meer aanpasbaar
            </div>
          </article>
        </div>

        <div v-if="huidigeWeek.feedback" class="feedback-card">
          <h3>Feedback van {{ huidigeWeek.feedback.mentor_naam || 'Mentor' }} — Week {{ huidigeWeek.week }}</h3>
          <p>{{ huidigeWeek.feedback.feedback }}</p>
        </div>
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

.subtitle { color: #64748b; margin: 0; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.leeg-bericht { background: white; border-radius: 16px; padding: 32px; text-align: center; color: #64748b; margin-top: 20px; }

.week-blok { margin-top: 28px; }

.week-navigatie {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 18px;
  padding: 18px 24px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.04);
  margin-bottom: 24px;
  gap: 16px;
}

.nav-pijl {
  border: 1px solid #e5e7eb;
  background: white;
  color: #334155;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}
.nav-pijl:hover:not(:disabled) { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.nav-pijl:disabled { opacity: 0.35; cursor: not-allowed; }

.week-kiezer { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center; }
.week-kiezer h2 { margin: 0; font-size: 22px; color: #0f172a; }

.week-select {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  background: white;
  cursor: pointer;
}

.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.badge.groen { background: #dcfce7; color: #166534; }
.badge.rood { background: #fee2e2; color: #991b1b; }
.badge.grijs { background: #e2e8f0; color: #475569; }

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
  .week-navigatie { flex-direction: column; }
}
</style>