<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const feedback = ref(
  'Sterke week, Anissa. Je technische werk loopt goed en je klantcommunicatie wordt zelfstandiger. Probeer volgende week iets sneller te documenteren tijdens het bouwen.'
)

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
    feedback: feedback.value
  }

  console.log('Later naar backend sturen:', payload)
  alert('Week goedgekeurd. Backend-koppeling volgt wanneer Artin zijn endpoint klaar is.')
}

function rejectWeek() {
  const payload = {
    decision: 'afgekeurd',
    feedback: feedback.value
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
        <a>Dashboard</a>
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
          </div>
        </div>
      </article>
    </section>

    <section class="feedback-section">
      <h2>Wekelijkse feedback voor {{ logbook.student.voornaam }}</h2>
      <p>Algemene reflectie over de hele week, attitude en verbeterpunten.</p>

      <textarea v-model="feedback"></textarea>
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