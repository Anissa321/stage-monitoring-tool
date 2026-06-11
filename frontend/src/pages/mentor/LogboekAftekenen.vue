<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const feedback = ref(
  'Sterke week, Anissa. Je technische werk loopt goed en je klantcommunicatie wordt zelfstandiger. Probeer volgende week iets sneller te documenteren tijdens het bouwen.'
)

const checklist = ref({
  takenCorrect: false,
  competentiesCorrect: false,
  urenCorrect: false,
  feedbackIngevuld: true
})

const logbook = ref({
  student: {
    voornaam: 'Anissa',
    achternaam: 'Canton'
  },
  mentor: {
    voornaam: 'Sven',
    achternaam: 'Janssens'
  },
  company: 'Acme Corp',
  week: 12,
  period: 'Periode 5',
  date: '9 mei 2026',
  status: 'Wacht op weekgoedkeuring',
  summary: {
    totalHours: '31 uur',
    submittedDays: '4 / 5',
    competencies: '7 gebruikt',
    reviewStatus: 'Wacht op aftekening'
  },
  days: [
    {
      id: 1,
      day: 'Maandag 29 april',
      hours: '8 uur',
      status: 'Ingediend',
      task: 'API-koppeling getest, mentor gebrieft over tijdslijn.',
      competencies: ['Comm.', 'Vakt.', 'Team.']
    },
    {
      id: 2,
      day: 'Dinsdag 30 april',
      hours: '8 uur',
      status: 'Ingediend',
      task: 'Documentatie bijgewerkt en team-stand-up bijgewoond.',
      competencies: ['Vakt.', 'Prob.']
    },
    {
      id: 3,
      day: 'Woensdag 1 mei',
      hours: 'Feestdag',
      status: 'Feestdag',
      task: 'Dag van de Arbeid',
      competencies: []
    },
    {
      id: 4,
      day: 'Donderdag 2 mei',
      hours: '8 uur',
      status: 'Ingediend',
      task: 'Feature deployment naar staging en testen uitgevoerd.',
      competencies: ['Comm.', 'Team.']
    },
    {
      id: 5,
      day: 'Vrijdag 3 mei',
      hours: '7 uur',
      status: 'Ingediend',
      task: 'Code refactoring afgerond en pull request ingediend.',
      competencies: ['Vakt.', 'Prob.']
    }
  ]
})

function goBack() {
  router.push('/mentor')
}

function approveWeek() {
  const payload = {
    decision: 'goedgekeurd',
    feedback: feedback.value,
    checklist: checklist.value
  }

  console.log('Later naar backend sturen:', payload)
  alert('Week goedgekeurd. Backend-koppeling volgt wanneer Artin zijn endpoint klaar is.')
}

function rejectWeek() {
  const payload = {
    decision: 'afgekeurd',
    feedback: feedback.value,
    checklist: checklist.value
  }

  console.log('Later naar backend sturen:', payload)
  alert('Week afgekeurd. Backend-koppeling volgt wanneer Artin zijn endpoint klaar is.')
}
</script>

<template>
  <main class="mentor-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a @click="goBack">Dashboard</a>
        <a class="active">Stagiairs</a>
        <a>Logboeken</a>
        <a>Evaluaties</a>
      </nav>

      <div class="profile">
        <span>{{ logbook.mentor.voornaam }} {{ logbook.mentor.achternaam }}</span>
        <div class="avatar">SJ</div>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="goBack">
        ← Terug naar studentdossier
      </button>

      <div class="title-row">
        <div>
          <h1>
            Week {{ logbook.week }} aftekenen —
            {{ logbook.student.voornaam }} {{ logbook.student.achternaam }}
          </h1>

          <p>
            {{ logbook.company }} • {{ logbook.period }} • {{ logbook.date }}
          </p>
        </div>

        <span class="status-pill warning">
          ⏳ {{ logbook.status }}
        </span>
      </div>
    </section>

    <section class="summary-card">
      <div class="summary-item">
        <span>Totaal uren</span>
        <strong>{{ logbook.summary.totalHours }}</strong>
      </div>

      <div class="summary-item">
        <span>Ingediende dagen</span>
        <strong>{{ logbook.summary.submittedDays }}</strong>
      </div>

      <div class="summary-item">
        <span>Competenties</span>
        <strong>{{ logbook.summary.competencies }}</strong>
      </div>

      <div class="summary-item">
        <span>Status</span>
        <strong>{{ logbook.summary.reviewStatus }}</strong>
      </div>
    </section>

    <section class="days-list">
      <article
        v-for="day in logbook.days"
        :key="day.id"
        class="day-card"
      >
        <div class="day-meta">
          <h3>{{ day.day }}</h3>
          <p>⏱ {{ day.hours }}</p>

          <span
            class="status-pill"
            :class="day.status === 'Feestdag' ? 'neutral' : 'success'"
          >
            {{ day.status }}
          </span>
        </div>

        <div class="day-task">
          <span>Wat heeft ze gedaan</span>
          <p>“{{ day.task }}”</p>
        </div>

        <div class="competencies">
          <span>Competenties</span>

          <div class="tags">
            <small
              v-for="competence in day.competencies"
              :key="competence"
              class="tag"
            >
              {{ competence }}
            </small>

            <small v-if="day.competencies.length === 0" class="empty-tag">
              Geen competenties
            </small>
          </div>
        </div>
      </article>
    </section>

    <section class="feedback-section">
      <h2>Wekelijkse feedback voor {{ logbook.student.voornaam }}</h2>
      <p>Algemene reflectie over de hele week, attitude en verbeterpunten.</p>

      <textarea v-model="feedback"></textarea>

      <div class="mentor-checklist">
        <h3>Controle door mentor</h3>

        <label>
          <input v-model="checklist.takenCorrect" type="checkbox">
          Werkzaamheden komen overeen met uitgevoerde taken
        </label>

        <label>
          <input v-model="checklist.competentiesCorrect" type="checkbox">
          Competenties zijn correct aangeduid
        </label>

        <label>
          <input v-model="checklist.urenCorrect" type="checkbox">
          Student heeft voldoende uren gepresteerd
        </label>

        <label>
          <input v-model="checklist.feedbackIngevuld" type="checkbox">
          Feedback werd ingevuld
        </label>
      </div>
    </section>

    <section class="actions">
      <button class="cancel-btn" @click="goBack">
        Annuleren
      </button>

      <div class="action-buttons">
        <button class="reject-btn" @click="rejectWeek">
          × Week afkeuren
        </button>

        <button class="approve-btn" @click="approveWeek">
          ✓ Week goedkeuren
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

.mentor-page {
  min-height: 100vh;
  background: #f1f3f6;
  color: #111827;
}

.topbar {
  height: 72px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
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

.page-header {
  padding: 30px 64px 20px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 14px;
}

.back-btn:hover {
  color: #991b1b;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-row h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
}

.title-row p {
  margin: 6px 0 0;
  color: #64748b;
}

.summary-card {
  margin: 0 64px 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.summary-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.summary-item span {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-item strong {
  font-size: 20px;
  color: #111827;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 700;
}

.warning {
  background: #fef3c7;
  color: #92400e;
}

.success {
  background: #dcfce7;
  color: #15803d;
}

.neutral {
  background: #f1f5f9;
  color: #64748b;
}

.days-list {
  padding: 8px 64px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.day-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 22px;
  min-height: 120px;
  display: grid;
  grid-template-columns: 170px 1fr 320px;
  gap: 28px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.day-meta h3 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #111827;
}

.day-meta p {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 13px;
}

.day-task span,
.competencies span {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.day-task p {
  margin: 0;
  color: #334155;
  font-style: italic;
  line-height: 1.5;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag,
.empty-tag {
  border-radius: 999px;
  padding: 5px 12px;
  font-weight: 700;
  font-size: 12px;
}

.tag {
  background: #e0e7ff;
  color: #3730a3;
}

.tag:nth-child(2) {
  background: #f3e8ff;
  color: #7e22ce;
}

.tag:nth-child(3) {
  background: #fce7f3;
  color: #be185d;
}

.empty-tag {
  background: #f1f5f9;
  color: #64748b;
}

.feedback-section {
  margin: 10px 64px 26px;
}

.feedback-section h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.feedback-section p {
  margin: 0 0 14px;
  color: #64748b;
}

textarea {
  width: 100%;
  min-height: 145px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 16px;
  resize: vertical;
  color: #334155;
  line-height: 1.5;
  background: white;
}

textarea:focus {
  outline: none;
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153, 27, 27, 0.12);
}

.mentor-checklist {
  margin-top: 18px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.mentor-checklist h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.mentor-checklist label {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #334155;
  font-size: 14px;
}

.actions {
  margin: 0 64px;
  padding-bottom: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.reject-btn,
.approve-btn {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.cancel-btn {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
}

.cancel-btn:hover {
  background: #f8fafc;
}

.reject-btn {
  border: 1px solid #ef4444;
  background: white;
  color: #dc2626;
}

.reject-btn:hover {
  background: #fee2e2;
}

.approve-btn {
  border: none;
  background: #10b981;
  color: white;
}

.approve-btn:hover {
  background: #059669;
}

@media (max-width: 900px) {
  .topbar {
    padding: 0 20px;
  }

  nav {
    display: none;
  }

  .page-header,
  .days-list,
  .feedback-section,
  .actions {
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 0;
    margin-right: 0;
  }

  .summary-card {
    margin-left: 20px;
    margin-right: 20px;
    grid-template-columns: 1fr;
  }

  .title-row {
    flex-direction: column;
  }

  .day-card {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>