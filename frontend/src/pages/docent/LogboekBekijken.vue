<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const weekDagen = [
  { dag: 'Maandag', datum: '5 mei', status: 'Ingevuld', type: 'done' },
  { dag: 'Dinsdag', datum: '6 mei', status: 'Ingevuld', type: 'done' },
  { dag: 'Woensdag', datum: '7 mei', status: 'Niet ingevuld', type: 'warning' },
  { dag: 'Donderdag', datum: '8 mei', status: 'Ingevuld', type: 'done' },
  { dag: 'Vrijdag', datum: '9 mei', status: 'Ingevuld', type: 'active' }
]

const competenties = [
  {
    naam: 'Communicatie',
    actief: true,
    tekst: 'Heeft klantmail beantwoord en mentor gebrieft over openstaande punten.'
  },
  {
    naam: 'Probleemoplossing',
    actief: false,
    tekst: 'Niet toegepast vandaag.'
  },
  {
    naam: 'Teamwork',
    actief: true,
    tekst: 'Sprint review meegeleid en collega geholpen met code review.'
  },
  {
    naam: 'Vaktechnisch handelen',
    actief: true,
    tekst: 'API-integratie met externe service afgewerkt en getest in Postman.'
  }
]

function terug() {
  router.push('/docent/student-detail')
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
        <div class="avatar">J</div>
      </div>
    </header>

    <section class="content">
      <button class="back-btn" @click="terug">
        ← Terug naar studentdossier
      </button>

      <div class="title-block">
        <h1>Logboek — Anissa Canton</h1>
        <p>Acme Corp • Week 12 van 16</p>
      </div>

      <section class="week-section">
        <h2>Week 12 (huidige week)</h2>

        <div class="week-grid">
          <article
            v-for="dag in weekDagen"
            :key="dag.datum"
            class="day-box"
            :class="dag.type"
          >
            <span>{{ dag.dag }}</span>
            <strong>{{ dag.datum }}</strong>

            <p>
              {{ dag.type === 'warning' ? '⚠' : '✓' }}
              {{ dag.status }}
            </p>
          </article>
        </div>
      </section>

      <section class="detail-card">
        <h2>Logboek details — Vrijdag 9 mei 2026</h2>

        <div class="block">
          <span class="small-label">✎ Uitgevoerde taken</span>
          <p>
            Vandaag heb ik gewerkt aan de API integratie met onze externe payment provider.
            Ik heb een bug opgelost in de checkout flow waardoor klanten met sommige
            creditcards niet konden afrekenen. Daarnaast heb ik unit tests geschreven voor
            de nieuwe authentication module.
          </p>
        </div>

        <div class="block">
          <span class="small-label">⏱ Uren gewerkt</span>
          <strong>8 uur</strong>
        </div>

        <div class="block">
          <span class="small-label red">📌 Competenties toegepast vandaag</span>

          <div
            v-for="competentie in competenties"
            :key="competentie.naam"
            class="competentie"
          >
            <input type="checkbox" :checked="competentie.actief" disabled />

            <div>
              <strong>{{ competentie.naam }}</strong>
              <p>{{ competentie.tekst }}</p>
            </div>
          </div>
        </div>

        <div class="block">
          <span class="small-label yellow">💡 Leerpunten / Reflectie</span>
          <p>
            Het was leerzaam om met een echte payment provider te werken. Ik merk dat ik
            beter begin te begrijpen hoe ik moet debuggen onder druk. Het team gaf positieve
            feedback op mijn aanpak. Ik liep tegen rate limiting aan bij de externe API —
            volgende keer ga ik vooraf de API documentatie beter doornemen om dit soort
            beperkingen op tijd te identificeren.
          </p>
        </div>

        <p class="submitted">
          Ingediend op vrijdag 9 mei 2026 om 17:24
        </p>
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
}

.brand {
  display: flex;
  align-items: center;
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
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  display: grid;
  place-items: center;
}

.content {
  padding: 34px 56px 52px;
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
  font-size: 30px;
  font-weight: 800;
}

.title-block p {
  margin: 6px 0 30px;
  color: #64748b;
}

.week-section h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  margin-bottom: 30px;
}

.day-box {
  background: white;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.day-box span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.day-box strong {
  display: block;
  margin: 8px 0;
  font-size: 18px;
}

.day-box p {
  display: inline-block;
  margin: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.day-box.done p {
  background: #dcfce7;
  color: #166534;
}

.day-box.warning p {
  background: #fef3c7;
  color: #92400e;
}

.day-box.active {
  border: 2px solid #991b1b;
}

.day-box.active p {
  background: #fee2e2;
  color: #991b1b;
}

.detail-card {
  background: white;
  border-radius: 18px;
  padding: 30px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.detail-card h2 {
  margin: 0 0 24px;
  font-size: 20px;
}

.block {
  margin-bottom: 26px;
}

.small-label {
  display: block;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 10px;
}

.small-label.red {
  color: #991b1b;
}

.small-label.yellow {
  color: #b45309;
}

.block p {
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.block strong {
  font-size: 18px;
}

.competentie {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.competentie input {
  margin-top: 3px;
  accent-color: #991b1b;
}

.competentie strong {
  font-size: 14px;
}

.competentie p {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.submitted {
  margin-top: 38px;
  color: #64748b;
  font-style: italic;
  font-size: 13px;
}

@media (max-width: 1000px) {
  .week-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  nav {
    display: none;
  }
}

@media (max-width: 700px) {
  .content {
    padding: 24px 20px;
  }

  .week-grid {
    grid-template-columns: 1fr;
  }
}
</style>