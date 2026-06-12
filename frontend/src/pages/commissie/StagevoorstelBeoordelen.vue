<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/commissie')
}

function goToFeedback() {
  router.push('/commissie/feedback-geven')
}

function approveProposal() {
  alert('Stagevoorstel goedgekeurd')
}

function rejectProposal() {
  alert('Stagevoorstel afgekeurd')
}
</script>

<template>
  <main class="commissie-page">
    <header class="topbar">
      <strong>Stage Monitor</strong>

      <nav>
        <a>Dashboard</a>
        <a class="active">Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="profile">
        <div class="avatar">MD</div>
        <span>Marie Declercq</span>
      </div>
    </header>

      <section class="page-header">
      <button class="back-btn" @click="goBack">← Terug naar dashboard</button>
      <h1>Stagevoorstel beoordelen</h1>
      <p>Ingediend door Anissa Canton op 10 jan 2026</p>
      <span class="badge orange">● Wacht op beoordeling</span>
    </section>

    <section class="grid">
      <article class="card">
        <h2>Studentgegevens</h2>

        <div class="student-box">
          <div class="avatar big">AC</div>

          <div>
            <h3>Anissa Canton</h3>
            <p>anissa.canton@student.ehb.be</p>
            <p>Toegepaste Informatica • 3e jaar</p>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <span>Docent</span>
            <strong>Jan De Vries</strong>
          </div>
          <div>
            <span>Student nr</span>
            <strong>s12345678</strong>
          </div>
        </div>
      </article>

      <article class="card">
        <h2>Bedrijfsinformatie</h2>

        <div class="info-grid">
          <div>
            <span>Bedrijf</span>
            <strong>Acme Corp</strong>
          </div>

          <div>
            <span>Adres</span>
            <strong>Brusselsesteenweg 12, 1000 Brussel</strong>
          </div>

          <div>
            <span>Mentor</span>
            <strong>Sven Janssens</strong>
            <p>sven.janssens@acmecorp.be</p>
          </div>
          <div>
            <span>Sector</span>
            <strong>IT / Software ontwikkeling</strong>
          </div>
        </div>
      </article>
    </section>

 </main>
</template>