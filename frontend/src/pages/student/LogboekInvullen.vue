<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  datum: new Date().toISOString().split('T')[0],
  week_number: 24,
  taken: '',
  uren: 8,
  reflectie: '',
  leerpunten: '',
  competenties: []
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

async function verstuurLogboek(status) {
  error.value = ''
  isLoading.value = true

  try {
    const token = localStorage.getItem('token')

    const res = await fetch('http://localhost:3000/api/logboeken', {
      method: 'POST',
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
        competenties: form.value.competenties
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

function opslaanConcept() {
  verstuurLogboek('concept')
}

function indienen() {
  verstuurLogboek('ingediend')
}
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
        <a>Dashboard</a>
        <a class="active">Logboek</a>
        <a>Documenten</a>
        <a>Evaluatie</a>
      </nav>

      <div class="profile">
        <span>Anissa</span>
        <div class="avatar">A</div>
      </div>
    </header>

    <section class="content">
      <button class="back-btn" @click="terug">
        ← Terug naar logboek overzicht
      </button>

      <div class="title-block">
        <h1>Logboek - {{ formatTitelDatum(form.datum) }}</h1>
<p>Week {{ form.week_number }}</p>
      </div>
      <p v-if="error" class="error-message">
  {{ error }}
</p>

      <section class="card">
        <label class="section-label"> Uitgevoerde taken</label>

        <textarea
          v-model="form.taken"
          placeholder="Beschrijf wat je vandaag gedaan hebt..."
        ></textarea>
      </section>

      <section class="small-section">
        <label>⏱ Uren gewerkt vandaag</label>
        <div class="hours-row">
          <input v-model="form.uren" type="number" min="0" max="24" />
          <span>uur</span>
        </div>
      </section>

      <section class="competence-section">
        <h2>📌 Competenties toegepast vandaag</h2>
        <p>Vink aan welke competenties je vandaag hebt toegepast en beschrijf wat je deed.</p>

        <div
          v-for="competentie in competenties"
          :key="competentie.naam"
          class="competence-item"
        >
          <label class="check-row">
            <input
              v-model="form.competenties"
              type="checkbox"
              :value="competentie.naam"
            />
            <strong>{{ competentie.naam }}</strong>
          </label>

          <textarea
            :placeholder="competentie.tekst || 'Beschrijf kort hoe je deze competentie gebruikte...'"
          ></textarea>
        </div>
      </section>

      <section class="card">
        <label class="section-label">💡 Leerpunten / Reflectie</label>

        <textarea
          v-model="form.reflectie"
          placeholder="Wat heb je vandaag bijgeleerd?"
        ></textarea>
      </section>

      <div class="actions">
        <button
  class="draft-btn"
  :disabled="isLoading"
  @click="opslaanConcept"
>
  Opslaan als concept
</button>

<button
  class="submit-btn"
  :disabled="isLoading"
  @click="indienen"
>
  {{ isLoading ? 'Bezig...' : 'Indienen →' }}
</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
  font-family: Inter, sans-serif;
}

.page {
  min-height: 100vh;
  background: #f1f5f9;
  color: #0f172a;
}

.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 44px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #111827;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #991b1b;
  color: white;
  display: grid;
  place-items: center;
  font-size: 12px;
}

nav {
  display: flex;
  gap: 24px;
}

nav a {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-decoration: none;
}

nav a.active {
  color: #991b1b;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #334155;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: grid;
  place-items: center;
}

.content {
  padding: 34px 56px 48px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 14px;
}

.back-btn:hover {
  color: #991b1b;
}

.title-block h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}

.title-block p {
  margin: 6px 0 24px;
  color: #64748b;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 22px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.section-label {
  display: block;
  font-weight: 800;
  margin-bottom: 12px;
}

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

textarea:focus,
input:focus {
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.1);
}

.small-section {
  margin: 18px 0 28px;
}

.small-section label {
  font-weight: 800;
  display: block;
  margin-bottom: 10px;
}

.hours-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hours-row input {
  width: 72px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 10px;
}

.hours-row span {
  color: #64748b;
  font-size: 13px;
}

.competence-section {
  margin: 28px 0;
}

.competence-section h2 {
  font-size: 16px;
  margin: 0 0 6px;
  color: #991b1b;
}

.competence-section p {
  margin: 0 0 18px;
  color: #64748b;
  font-size: 13px;
}

.competence-item {
  margin-bottom: 16px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.check-row input {
  accent-color: #991b1b;
}

.competence-item textarea {
  margin-left: 28px;
  width: calc(100% - 28px);
  background: white;
  min-height: 70px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 36px;
}

.draft-btn,
.submit-btn {
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 800;
  cursor: pointer;
}

.draft-btn {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.submit-btn {
  background: #991b1b;
  color: white;
  border: none;
}

.submit-btn:hover {
  background: #7f1d1d;
}
.error-message {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 700;
  margin-bottom: 18px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 800px) {
  .topbar {
    padding: 0 20px;
  }

  nav {
    display: none;
  }

  .content {
    padding: 24px 20px;
  }

  .competence-item textarea {
    margin-left: 0;
    width: 100%;
  }
}
</style>