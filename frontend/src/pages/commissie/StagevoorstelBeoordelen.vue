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

    <section class="card wide">
      <h2>Stagedetails</h2>

      <div class="info-grid three">
        <div>
          <span>Periode</span>
          <strong>1 februari 2026 - 30 april 2026</strong>
        </div>

        <div>
          <span>Werkuren</span>
          <strong>Maandag - vrijdag, 09:00 - 17:00</strong>
        </div>

        <div>
          <span>Locatie</span>
          <strong>Brussel (on-site)</strong>
        </div>
      </div>

      <div class="divider"></div>

      <div>
        <span>Omschrijving opdracht</span>
        <p>
          Ontwikkeling van een intern dashboard voor klantenbeheer. De student werkt mee aan een React/Node.js applicatie en is verantwoordelijk voor frontend implementatie van meerdere modules inclusief rapportage en gebruikersbeheer.
        </p>
      </div>

      <div>
        <span>Verwachte competenties</span>
        <p>React • Node.js • PostgreSQL • REST API • Git</p>
      </div>
    </section>

    <section class="card wide">
      <h2>Beslissing</h2>

      <div class="decision-grid">
        <button class="approve" @click="approveProposal">✓ Goedkeuren</button>
        <button class="changes" @click="goToFeedback">✎ Aanpassingen vereist</button>
        <button class="reject" @click="rejectProposal">× Afkeuren</button>
      </div>
    </section>
 </main>
</template>

<style scoped>
.commissie-page {
  min-height: 100vh;
  background: #f3f4f6;
  color: #111827;
  font-family: Inter, Arial, sans-serif;
}

.topbar {
  height: 72px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 64px;
  border-bottom: 1px solid #e5e7eb;
}

nav {
  display: flex;
  gap: 28px;
}

nav a {
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

nav .active {
  color: #2563eb;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ede9fe;
  color: #6d28d9;
  display: grid;
  place-items: center;
  font-weight: 800;
}