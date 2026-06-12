<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const logboekId = route.query.id || null
const readonly = ref(false)

const form = ref({
  datum: new Date().toISOString().split('T')[0],
  week_number: 24,
  taken: '',
  uren: 8,
  reflectie: '',
  leerpunten: '',
  competenties: [],
  competentieDescriptions: {
    'Communicatie': '',
    'Probleemoplossing': '',
    'Teamwork': '',
    'Vaktechnisch handelen': ''
  }
})

const isLoading = ref(false)
const error = ref('')

const competenties = [
  { naam: 'Communicatie' },
  { naam: 'Probleemoplossing' },
  { naam: 'Teamwork' },
  { naam: 'Vaktechnisch handelen' }
]

function terug() {
  router.push('/student/logboek')
}

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

onMounted(async () => {
  if (logboekId) {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:3000/api/logboeken/mijn', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const logboek = data.logboeken?.find(l => l.id == logboekId)

    if (logboek) {
      form.value.datum = logboek.datum
      form.value.week_number = logboek.week_number
      form.value.taken = logboek.tasks || ''
      form.value.uren = logboek.uren_gewerkt || 8
      form.value.reflectie = logboek.reflection || ''
      form.value.leerpunten = logboek.learning_points || ''

      if (logboek.competenties && logboek.competenties.length > 0) {
        form.value.competenties = logboek.competenties.map(c =>
          typeof c === 'string' ? c : c.naam
        )
        logboek.competenties.forEach(c => {
          if (typeof c === 'object' && c.naam) {
            form.value.competentieDescriptions[c.naam] = c.description || ''
          }
        })
      }

      if (logboek.status === 'ingediend' || logboek.status === 'goedgekeurd') {
        readonly.value = true
      }
    }
  }
})

async function verstuurLogboek(status) {
  if (readonly.value) return
  error.value = ''
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const url = logboekId
      ? `http://localhost:3000/api/logboeken/${logboekId}`
      : 'http://localhost:3000/api/logboeken'
    const method = logboekId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        datum: form.value.datum,
        week_number: form.value.week_number,
        tasks: form.value.taken,
        reflection: form.value.reflectie,
        learning_points: form.value.leerpunten,
        uren_gewerkt: Number(form.value.uren),
        status,
        competenties: form.value.competenties.map(naam => ({
          naam,
          description: form.value.competentieDescriptions[naam] || ''
        }))
      })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Logboek kon niet opgeslagen worden'
      return
    }
    router.push('/student/logboek')
  } catch (err) {
    console.error(err)
    error.value = 'Verbindingsfout met backend'
  } finally {
    isLoading.value = false
  }
}

function opslaanConcept() { verstuurLogboek('concept') }
function indienen() { verstuurLogboek('ingediend') }

function formatTitelDatum(datum) {
  return new Date(datum).toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
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
        <a class="active">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>

      <div class="profile">
        <span>Anissa</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">A</div>
      </div>
    </header>

    <section class="content">
      <button class="back-btn" @click="terug">← Terug naar logboek overzicht</button>

      <div class="title-block">
        <h1>Logboek - {{ formatTitelDatum(form.datum) }}</h1>
        <p>Week {{ form.week_number }}</p>
      </div>

      <div v-if="readonly" class="readonly-banner">
        🔒 Dit logboek is al ingediend of goedgekeurd en kan niet meer aangepast worden.
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>

      <section class="card">
        <label class="section-label">Uitgevoerde taken</label>
        <textarea v-model="form.taken" placeholder="Beschrijf wat je vandaag gedaan hebt..." :disabled="readonly"></textarea>
      </section>

      <section class="small-section">
        <label>⏱ Uren gewerkt vandaag</label>
        <div class="hours-row">
          <input v-model="form.uren" type="number" min="0" max="24" :disabled="readonly" />
          <span>uur</span>
        </div>
      </section>

      <section class="competence-section">
        <h2>📌 Competenties toegepast vandaag</h2>
        <p>Vink aan welke competenties je vandaag hebt toegepast en beschrijf wat je deed.</p>
        <div v-for="comp in competenties" :key="comp.naam" class="competence-item">
          <label class="check-row">
            <input v-model="form.competenties" type="checkbox" :value="comp.naam" :disabled="readonly" />
            <strong>{{ comp.naam }}</strong>
          </label>
          <textarea
            v-model="form.competentieDescriptions[comp.naam]"
            :placeholder="'Beschrijf kort hoe je deze competentie gebruikte...'"
            :disabled="readonly"
          ></textarea>
        </div>
      </section>

      <section class="card">
        <label class="section-label">💡 Leerpunten / Reflectie</label>
        <textarea v-model="form.reflectie" placeholder="Wat heb je vandaag bijgeleerd?" :disabled="readonly"></textarea>
      </section>

      <div v-if="!readonly" class="actions">
        <button class="draft-btn" :disabled="isLoading" @click="opslaanConcept">Opslaan als concept</button>
        <button class="submit-btn" :disabled="isLoading" @click="indienen">
          {{ isLoading ? 'Bezig...' : 'Indienen →' }}
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #0f172a;
}

.topbar {
  height: 72px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  color: #991b1b;
}

.logo-circle {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #991b1b;
  color: white;
  display: grid;
  place-items: center;
  font-size: 13px;
}

nav {
  display: flex;
  gap: 8px;
}

nav a {
  text-decoration: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

nav a:hover,
nav a.active {
  background: #fee2e2;
  color: #991b1b;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.logout-btn {
  border: none;
  background: #991b1b;
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.logout-btn:hover { background: #7f1d1d; }

.content {
  padding: 40px 64px 48px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 14px;
  font-size: 14px;
}

.back-btn:hover { color: #991b1b; }

.title-block h1 { margin: 0; font-size: 26px; font-weight: 800; }
.title-block p { margin: 6px 0 24px; color: #64748b; }

.readonly-banner {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  margin-bottom: 18px;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 22px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.section-label { display: block; font-weight: 800; margin-bottom: 12px; }

textarea {
  width: 100%;
  min-height: 92px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 13px;
  resize: vertical;
  outline: none;
  font-size: 14px;
  background: white;
}

textarea:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

textarea:focus:not(:disabled), input:focus:not(:disabled) {
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.1);
}

.small-section { margin: 18px 0 28px; }
.small-section label { font-weight: 800; display: block; margin-bottom: 10px; }

.hours-row { display: flex; align-items: center; gap: 10px; }

.hours-row input {
  width: 72px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 10px;
}

.hours-row input:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.hours-row span { color: #64748b; font-size: 13px; }

.competence-section { margin: 28px 0; }
.competence-section h2 { font-size: 16px; margin: 0 0 6px; color: #991b1b; }
.competence-section p { margin: 0 0 18px; color: #64748b; font-size: 13px; }

.competence-item { margin-bottom: 16px; }

.check-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 14px; }
.check-row input { accent-color: #991b1b; }

.competence-item textarea {
  margin-left: 28px;
  width: calc(100% - 28px);
  background: white;
  min-height: 70px;
}

.actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 36px; }

.draft-btn, .submit-btn {
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 800;
  cursor: pointer;
}

.draft-btn { background: white; color: #334155; border: 1px solid #cbd5e1; }
.submit-btn { background: #991b1b; color: white; border: none; }
.submit-btn:hover { background: #7f1d1d; }

.error-message {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 700;
  margin-bottom: 18px;
}

button:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 1000px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 20px; }
  .competence-item textarea { margin-left: 0; width: 100%; }
}
</style>