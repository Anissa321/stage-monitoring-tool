<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  datum: '2026-05-09',
  uren: 8,
  taken: '',
  reflectie: '',
  leerpunten: '',
  competenties: []
})

const competenties = [
  'Communicatie',
  'Probleemoplossing',
  'Teamwork',
  'Vaktechnisch handelen'
]

function terug() {
  router.push('/student/logboek')
}

function opslaanConcept() {
  alert('Logboek opgeslagen als concept')
}

function indienen() {
  alert('Logboek ingediend')
  router.push('/student/logboek')
}
</script>

<template>
  <main class="logboek-page">
    <button class="back-btn" @click="terug">
      ← Terug naar logboek
    </button>

    <section class="hero">
      <p class="label">Stage Logboek</p>
      <h1>Logboek invullen</h1>
      <p class="subtitle">
        Vrijdag 9 mei 2026 • Week 13
      </p>
    </section>

    <section class="form-card">
      <div class="form-header">
        <h2>Dagelijkse activiteiten</h2>
        <span>Concept</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Datum</label>
          <input v-model="form.datum" type="date" />
        </div>

        <div class="field small">
          <label>Uren gewerkt</label>
          <input v-model="form.uren" type="number" min="0" max="24" />
        </div>
      </div>

      <div class="field">
        <label>Uitgevoerde taken</label>
        <textarea
          v-model="form.taken"
          placeholder="Beschrijf welke taken je vandaag hebt uitgevoerd..."
        ></textarea>
      </div>

      <div class="field">
        <label>Reflectie</label>
        <textarea
          v-model="form.reflectie"
          placeholder="Hoe verliep je dag? Wat ging goed of minder goed?"
        ></textarea>
      </div>

      <div class="field">
        <label>Leerpunten</label>
        <textarea
          v-model="form.leerpunten"
          placeholder="Wat heb je vandaag geleerd?"
        ></textarea>
      </div>

      <section class="competentie-card">
        <h3>Competenties toegepast vandaag</h3>

        <div class="competentie-grid">
          <label
            v-for="competentie in competenties"
            :key="competentie"
            class="competentie-option"
          >
            <input
              v-model="form.competenties"
              type="checkbox"
              :value="competentie"
            />
            <span>{{ competentie }}</span>
          </label>
        </div>
      </section>

      <div class="actions">
        <button class="draft-btn" @click="opslaanConcept">
          Opslaan als concept
        </button>

        <button class="submit-btn" @click="indienen">
          Indienen
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

.logboek-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  padding: 40px;
  color: #111827;
}

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 18px;
}

.back-btn:hover {
  color: #991b1b;
}

.hero {
  background: linear-gradient(135deg, #991b1b, #dc2626);
  color: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 18px 40px rgba(153, 27, 27, 0.22);
  margin-bottom: 28px;
}

.label {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px;
  opacity: 0.9;
}

.hero h1 {
  margin: 0;
  font-size: 38px;
  font-weight: 800;
}

.subtitle {
  margin-top: 10px;
  opacity: 0.9;
}

.form-card {
  background: white;
  border-radius: 22px;
  border: 1px solid #e5e7eb;
  padding: 30px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.05);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-header h2 {
  margin: 0;
  font-size: 20px;
}

.form-header span {
  background: #fee2e2;
  color: #991b1b;
  padding: 7px 13px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
}

.field-row {
  display: flex;
  gap: 18px;
}

.field {
  margin-bottom: 22px;
  width: 100%;
}

.field.small {
  max-width: 180px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #334155;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 13px 14px;
  font-size: 14px;
  outline: none;
}

textarea {
  min-height: 110px;
  resize: vertical;
}

input:focus,
textarea:focus {
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.12);
}

.competentie-card {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 18px;
  padding: 22px;
  margin-top: 8px;
}

.competentie-card h3 {
  margin: 0 0 16px;
  color: #991b1b;
}

.competentie-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.competentie-option {
  background: white;
  border: 1px solid #fecaca;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.competentie-option input {
  width: auto;
}

.actions {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.draft-btn,
.submit-btn {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
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

@media (max-width: 800px) {
  .logboek-page {
    padding: 20px;
  }

  .field-row,
  .competentie-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .field.small {
    max-width: 100%;
  }
}
</style>