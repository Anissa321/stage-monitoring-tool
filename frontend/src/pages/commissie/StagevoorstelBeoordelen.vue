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
</style>

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
  background: #ede9fe;
  color: #6d28d9;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  width: 36px;
  height: 36px;
}

.big {
  width: 58px;
  height: 58px;
  background: #dbeafe;
  color: #2563eb;
}

.page-header {
  padding: 36px 64px 20px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

h1 {
  font-size: 30px;
  margin-bottom: 6px;
}

.badge {
  display: inline-block;
  padding: 7px 13px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.orange {
  background: #fef3c7;
  color: #b45309;
}

.grid {
  padding: 0 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 26px;
  margin-bottom: 24px;
}

.wide {
  margin: 0 64px 24px;
}

.student-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.info-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.three {
  grid-template-columns: repeat(3, 1fr);
}

span {
  display: block;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
}

strong {
  display: block;
  margin-top: 6px;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 24px 0;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.commissie-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #111827;
}

.topbar {
  height: 72px;
  background: rgba(255,255,255,0.95);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar strong {
  color: #991b1b;
  font-weight: 800;
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
  font-weight: 800;
  font-size: 13px;
  color: #991b1b;
}

.big {
  width: 58px;
  height: 58px;
  background: #dbeafe;
  color: #2563eb;
}

.page-header {
  margin: 40px 64px 28px;
  padding: 42px;
  border-radius: 24px;
  background: linear-gradient(135deg, #991b1b, #dc2626);
  color: white;
  box-shadow: 0 18px 40px rgba(153,27,27,0.22);
}

.back-btn {
  border: none;
  background: transparent;
  color: white;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.9;
}

h1 {
  font-size: 38px;
  margin: 18px 0 8px;
  font-weight: 800;
}

.page-header p {
  margin: 0 0 14px;
  opacity: 0.9;
}

.badge {
  display: inline-block;
  padding: 7px 13px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.orange {
  background: #fef3c7;
  color: #b45309;
}

.grid {
  margin: 24px 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 22px;
  padding: 28px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(15,23,42,0.05);
}

.wide {
  margin: 24px 64px;
}

.student-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.info-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.three {
  grid-template-columns: repeat(3, 1fr);
}

span {
  display: block;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
}

strong {
  display: block;
  margin-top: 6px;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 24px 0;
}

.decision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 34px;
}

.decision-grid button {
  padding: 24px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.approve {
  background: #dcfce7;
  border: 2px solid #10b981;
  color: #047857;
}

.changes {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  color: #b45309;
}

.reject {
  background: #fee2e2;
  border: 2px solid #ef4444;
  color: #dc2626;
}

@media (max-width: 900px) {
  .topbar {
    padding: 0 20px;
  }

  nav {
    display: none;
  }

  .page-header,
  .grid,
  .wide {
    margin-left: 20px;
    margin-right: 20px;
  }

  .grid,
  .decision-grid,
  .three {
    grid-template-columns: 1fr;
  }
}
</style>