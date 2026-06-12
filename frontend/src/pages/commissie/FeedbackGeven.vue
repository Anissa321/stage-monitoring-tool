<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const feedback = ref({
  aanpassen:
    'De omschrijving van de opdracht is te vaag. Specificeer concreet welke technologieën gebruikt worden, wat de verwachte deliverables zijn en hoe de student zal worden begeleid.',
  goed:
    'De bedrijfsinformatie is volledig en correct. De periode en werkuren zijn duidelijk omschreven.',
  checklist:
    '- Concretere omschrijving van de opdracht (min. 150 woorden)\n- Vermelding van gebruikte technologieën\n- Naam en contactgegevens directe begeleider op de werkvloer',
  deadline: '2026-01-31'
})

function goBack() {
  router.push('/commissie/stagevoorstel')
}

function sendFeedback() {
  console.log('Feedback versturen:', feedback.value)
  alert('Feedback verstuurd naar student')
  router.push('/commissie')
}
</script>

<template>
  <main class="commissie-page">
    <header class="topbar">
      <strong>Stage Monitor</strong>

      <nav>
        <a @click="router.push('/commissie/dashboard')">Dashboard</a>
        <a class="active">Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="profile">
        <div class="avatar">MD</div>
        <span>Marie Declercq</span>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="goBack">
        ← Terug naar voorstel
      </button>

      <h1>Aanpassingen vereist</h1>
      <p>Stagevoorstel van Sara De Vos — DataLab</p>

      <span class="badge purple">
        ● Aanpassingen vereist
      </span>
    </section>
  </main>
</template>

<style scoped>
.commissie-page {
  min-height: 100vh;
}
</style>

<template>
  <main class="commissie-page">
    <header class="topbar">
      <strong>Stage Monitor</strong>

      <nav>
        <a @click="router.push('/commissie/dashboard')">Dashboard</a>
        <a class="active">Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="profile">
        <div class="avatar">MD</div>
        <span>Marie Declercq</span>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="goBack">
        ← Terug naar voorstel
      </button>

      <h1>Aanpassingen vereist</h1>
      <p>Stagevoorstel van Sara De Vos — DataLab</p>

      <span class="badge purple">
        ● Aanpassingen vereist
      </span>
    </section>

    <section class="alert">
      ⚠ De student ontvangt een melding met jouw feedback en kan het voorstel aanpassen en opnieuw indienen.
    </section>

    <section class="student-card">
      <div class="avatar green-avatar">SD</div>

      <div>
        <h3>Sara De Vos</h3>
        <p>sara.devos@student.ehb.be • Toegepaste Informatica • 3e jaar</p>
        <p>Stage bij DataLab • 1 mrt - 31 mei 2026</p>
      </div>
    </section>
  </main>
</template>