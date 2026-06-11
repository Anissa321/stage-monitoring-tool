<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const student = {
  naam: 'Anissa Canton',
  email: 'anissa.canton@student.ehb.be',
  opleiding: 'Toegepaste Informatica',
  jaar: '3e jaar',
  status: 'Op schema',
  bedrijf: 'Acme Corp',
  mentor: 'Sven Janssens',
  periode: '1 feb 2026 — 30 apr 2026',
  locatie: 'Brussel',
  opdracht: 'Ontwikkeling van een interne dashboard voor klantenbeheer met React en Node.js',
  logboekenIngevuld: 52,
  totaalDagen: 65
}

const recenteLogboeken = [
  {
    id: 1,
    datum: 'Vrijdag 9 mei 2026',
    status: 'Ingediend',
    tekst: 'Vandaag gewerkt aan API integratie met externe payment provider.'
  },
  {
    id: 2,
    datum: 'Donderdag 8 mei 2026',
    status: 'Ingediend',
    tekst: 'Code review meeting met team. Refactoring van authenticatie module.'
  },
  {
    id: 3,
    datum: 'Woensdag 7 mei 2026',
    status: 'Aandacht nodig',
    tekst: 'Logboek nog niet ingediend door student.'
  }
]

function gaNaarLogboek(id) {
  router.push(`/docent/logboek-bekijken/${id}`)
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
        <a class="active">Studenten</a>
        <a>Evaluaties</a>
      </nav>

      <div class="profile">
        <span>Jan</span>
        <div class="avatar-small">J</div>
      </div>
    </header>

    <section class="content">
      <button class="back-btn">← Terug naar vorige pagina</button>

      <h1>Studentdossier</h1>

      <section class="student-card">
        <div class="student-left">
          <div class="avatar">AC</div>

          <div>
            <h2>{{ student.naam }}</h2>
            <p>{{ student.email }} • {{ student.opleiding }} • {{ student.jaar }}</p>
          </div>
        </div>

        <span class="status-pill">{{ student.status }}</span>
      </section>

      <section class="info-grid">
        <article class="info-card">
          <h3>Stage informatie</h3>

          <div class="info-columns">
            <div>
              <span>Bedrijf</span>
              <strong>{{ student.bedrijf }}</strong>
            </div>

            <div>
              <span>Mentor</span>
              <strong>{{ student.mentor }}</strong>
            </div>

            <div>
              <span>Periode</span>
              <strong>{{ student.periode }}</strong>
            </div>

            <div>
              <span>Locatie</span>
              <strong>{{ student.locatie }}</strong>
            </div>
          </div>

          <p class="assignment">
            <strong>Opdracht:</strong> {{ student.opdracht }}
          </p>
        </article>

        <article class="info-card">
          <h3>Voortgang</h3>

          <div class="progress-row">
            <span>Logboeken ingevuld</span>
            <strong>{{ student.logboekenIngevuld }} / {{ student.totaalDagen }} dagen</strong>
          </div>

          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>

          <div class="progress-row warning">
            <span>Evaluatie ingevuld</span>
            <strong>In afwachting</strong>
          </div>

          <div class="progress-row success">
            <span>Stageovereenkomst</span>
            <strong>Ondertekend</strong>
          </div>
        </article>
      </section>

      <section class="logbook-card">
        <h3>Recente logboeken</h3>

        <div
          v-for="logboek in recenteLogboeken"
          :key="logboek.id"
          class="logbook-row"
        >
          <div>
            <strong>{{ logboek.datum }}</strong>
            <p>{{ logboek.tekst }}</p>
          </div>

          <span
            class="log-status"
            :class="{ danger: logboek.status === 'Aandacht nodig' }"
          >
            {{ logboek.status }}
          </span>

          <button @click="gaNaarLogboek(logboek.id)">
            Bekijk +
          </button>
        </div>
      </section>
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

.brand,
.profile,
.student-left {
  display: flex;
  align-items: center;
}

.brand {
  gap: 10px;
  font-weight: 800;
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
  gap: 10px;
  font-weight: 700;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
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
  margin-bottom: 12px;
}

.back-btn:hover {
  color: #991b1b;
}

h1 {
  margin: 0 0 22px;
  font-size: 28px;
}

.student-card,
.info-card,
.logbook-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.student-card {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-left {
  gap: 18px;
}

.avatar {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #fee2e2;
  color: #991b1b;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.student-card h2 {
  margin: 0 0 6px;
}

.student-card p {
  margin: 0;
  color: #64748b;
}

.status-pill {
  background: #dcfce7;
  color: #166534;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
}

.info-grid {
  margin-top: 26px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
}

.info-card {
  padding: 24px;
}

.info-card h3,
.logbook-card h3 {
  margin: 0 0 20px;
}

.info-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-columns span {
  display: block;
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 800;
}

.info-columns strong {
  display: block;
  margin-top: 5px;
}

.assignment {
  margin-top: 20px;
  color: #475569;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #475569;
}

.progress-bar {
  height: 9px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 18px;
}

.progress-fill {
  height: 100%;
  width: 80%;
  background: #991b1b;
}

.warning strong {
  color: #b45309;
}

.success strong {
  color: #166534;
}

.logbook-card {
  margin-top: 26px;
  padding: 24px;
}

.logbook-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 18px;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #f1f5f9;
}

.logbook-row p {
  margin: 5px 0 0;
  color: #64748b;
}

.log-status {
  background: #dcfce7;
  color: #166534;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.log-status.danger {
  background: #fef3c7;
  color: #92400e;
}

.logbook-row button {
  border: none;
  background: #991b1b;
  color: white;
  border-radius: 10px;
  padding: 9px 14px;
  font-weight: 800;
  cursor: pointer;
}

.logbook-row button:hover {
  background: #7f1d1d;
}

@media (max-width: 900px) {
  .content {
    padding: 24px 20px;
  }

  .info-grid,
  .logbook-row {
    grid-template-columns: 1fr;
  }

  nav {
    display: none;
  }
}
</style>