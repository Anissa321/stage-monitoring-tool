<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logboeken = [
  {
    id: 1,
    dag: 'Maandag 5 mei',
    status: 'Goedgekeurd',
    uren: 8,
    type: 'approved',
    statusClass: 'green',
    taken: 'API koppeling getest en dashboard verbeterd.',
    competenties: ['Communicatie', 'Teamwork']
  },
  {
    id: 2,
    dag: 'Dinsdag 6 mei',
    status: 'Goedgekeurd',
    uren: 8,
    type: 'approved',
    statusClass: 'green',
    taken: 'Router guards getest en loginflow nagekeken.',
    competenties: ['Probleemoplossing']
  },
  {
    id: 3,
    dag: 'Woensdag 7 mei',
    status: 'In behandeling',
    uren: 8,
    type: 'waiting',
    statusClass: 'orange',
    taken: 'Logout functie gebouwd en getest.',
    competenties: ['Vaktechnisch']
  },
  {
    id: 4,
    dag: 'Donderdag 8 mei',
    status: 'Nog niet ingevuld',
    uren: 0,
    type: 'empty',
    statusClass: 'gray',
    taken: '',
    competenties: []
  },
  {
    id: 5,
    dag: 'Vrijdag 9 mei',
    status: 'Vandaag',
    uren: 0,
    type: 'empty',
    statusClass: 'blue',
    taken: '',
    competenties: []
  }
]

function gaNaarInvullen() {
  router.push('/student/logboek-invullen')
}
</script>

<template>
  <main class="logboek-page">
    <section class="hero">
      <p class="label">Stage Logboek</p>
      <h1>Mijn Logboek</h1>
      <p class="subtitle">Overzicht van je ingediende logboeken</p>

      <div class="progress-wrapper">
        <span>Uren deze week: 32 / 40 uur</span>

        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </section>

    <section class="week-section">
      <div class="section-header">
        <h2>Week 13 (huidige week)</h2>

        <button class="new-btn" @click="gaNaarInvullen">
          + Logboek invullen
        </button>
      </div>

      <div class="cards">
        <article
          v-for="logboek in logboeken"
          :key="logboek.id"
          class="day-card"
          :class="logboek.type"
        >
          <h3>{{ logboek.dag }}</h3>

          <span class="status" :class="logboek.statusClass">
            {{ logboek.status }}
          </span>

          <p>{{ logboek.uren }} uur gewerkt</p>

          <p v-if="logboek.taken" class="tasks">
            {{ logboek.taken }}
          </p>

          <button
            v-else
            class="fill-card-btn"
            @click="gaNaarInvullen"
          >
            Invullen
          </button>

          <div v-if="logboek.competenties.length" class="tags">
            <span
              v-for="competentie in logboek.competenties"
              :key="competentie"
            >
              {{ competentie }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <section class="feedback-card">
      <h3>Wekelijkse Feedback</h3>

      <p>
        Sterk werk, Anissa. Je technische kennis groeit zichtbaar en je
        communicatie verloopt steeds beter.
      </p>
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
  background: #f8fafc;
  padding: 40px;
}

.hero {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0,0,0,.05);
}

.label {
  color: #991b1b;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}

.hero h1 {
  margin: 10px 0;
  font-size: 38px;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
}

.progress-wrapper {
  margin-top: 24px;
}

.progress-wrapper span {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  width: 80%;
  height: 100%;
  background: #991b1b;
}

.week-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #0f172a;
}

.new-btn {
  border: none;
  background: #991b1b;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.new-btn:hover {
  background: #7f1d1d;
}

.cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
}

.day-card {
  background: white;
  border-radius: 18px;
  padding: 18px;
  min-height: 210px;
  box-shadow: 0 8px 20px rgba(0,0,0,.04);
}

.approved {
  border-top: 5px solid #16a34a;
}

.waiting {
  border-top: 5px solid #f59e0b;
}

.empty {
  border-top: 5px solid #991b1b;
}

.day-card h3 {
  font-size: 15px;
  margin-bottom: 12px;
}

.status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.green {
  background: #dcfce7;
  color: #166534;
}

.orange {
  background: #fef3c7;
  color: #92400e;
}

.gray {
  background: #e2e8f0;
  color: #475569;
}

.blue {
  background: #fee2e2;
  color: #991b1b;
}

.tasks {
  margin-top: 12px;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags span {
  background: #fee2e2;
  color: #991b1b;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
}

.fill-card-btn {
  margin-top: 18px;
  border: none;
  background: #991b1b;
  color: white;
  padding: 9px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.fill-card-btn:hover {
  background: #7f1d1d;
}

.feedback-card {
  margin-top: 32px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 20px;
  padding: 24px;
}

.feedback-card h3 {
  margin-bottom: 12px;
  color: #991b1b;
}

.feedback-card p {
  color: #475569;
}

@media (max-width: 1200px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>