<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const rapport = ref({
  student: 'Anissa Canton',
  bedrijf: 'Acme Corp',
  periode: 'februari – april 2026',
  score: 16,
  aanwezigheid: 97,
  logboeken: '63 / 65 dagen',
  eindpresentatie: '17 / 20',
  beoordeling: 'Uitstekend',
  docent: 'Jan De Vries',
  mentor: 'Sven Janssens',
  competenties: [
    { naam: 'Vaktechnisch handelen', beschrijving: 'Technische kennis correct toepassen', gewicht: 30, score: 16, gewogen: 4.8 },
    { naam: 'Communicatie', beschrijving: 'Helder en professioneel communiceren', gewicht: 25, score: 14, gewogen: 3.5 },
    { naam: 'Probleemoplossing', beschrijving: 'Analyseren en creatief oplossen', gewicht: 25, score: 17, gewogen: 4.25 },
    { naam: 'Teamwork & samenwerking', beschrijving: 'Effectief samenwerken in team', gewicht: 20, score: 15, gewogen: 3.0 }
  ],
  sterkePunten: [
    'Sterke technische skills, leerde adoptie van nieuwe tech',
    'Neemt zelfstandig initiatief',
    'Goede communicatie met team en stakeholders',
    'Levert kwalitatief werk binnen deadlines'
  ],
  verbeterpunten: [
    'Meer aandacht voor architectuurkeuzes',
    'Code reviews actiever bijwonen',
    'Logboek consistenter dagelijks invullen',
    'Presentatieskills verfijnen'
  ]
})

const geslaagd = computed(() => rapport.value.score >= 10)

function goBack() {
  router.push('/student/dashboard')
}
</script>

<template>
  <main class="student-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a>Logboek</a>
        <a>Documenten</a>
        <a class="active">Evaluatie</a>
      </nav>

      <div class="profile">
        <span>{{ rapport.student }}</span>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="goBack">← Terug naar dashboard</button>

      <div class="title-row">
        <div>
          <h1>Mijn eindrapport</h1>
          <p>Stage afgerond bij {{ rapport.bedrijf }} • {{ rapport.periode }}</p>
        </div>

        <span :class="['status-badge', geslaagd ? 'green' : 'red']">
          {{ geslaagd ? '✓ Afgerond' : '× Niet geslaagd' }}
        </span>
      </div>
    </section>

    <section :class="['alert', geslaagd ? 'success' : 'danger']">
      {{ geslaagd
        ? '🎉 Proficiat! Je hebt je stage met onderscheiding afgerond.'
        : '⚠ Je stage werd niet als geslaagd beoordeeld. Herkansing mogelijk in academiejaar 2026-2027.'
      }}
    </section>

    <section class="result-card">
      <div :class="['score-circle', geslaagd ? 'score-green' : 'score-red']">
        <strong>{{ rapport.score }}</strong>
        <span>/ 20</span>
      </div>

      <div>
        <h2>{{ geslaagd ? 'Geslaagd met onderscheiding' : 'Niet geslaagd' }}</h2>
        <p>{{ geslaagd ? 'Overtuigend eindresultaat op basis van 4 competenties' : 'Onvoldoende eindscore op basis van 4 competenties' }}</p>

        <div class="result-stats">
          <div>
            <span>Logboeken</span>
            <strong>{{ rapport.logboeken }}</strong>
          </div>

          <div>
            <span>Aanwezigheid</span>
            <strong>{{ rapport.aanwezigheid }}%</strong>
          </div>

          <div>
            <span>Eindpresentatie</span>
            <strong>{{ rapport.eindpresentatie }}</strong>
          </div>
        </div>
      </div>

      <div class="rating">
        <span>Overall beoordeling</span>
        <strong>{{ rapport.beoordeling }}</strong>
        <p>Beoordeeld door {{ rapport.docent }}</p>
      </div>
    </section>

    <section class="card">
      <h2>Competentiescores</h2>

      <table>
        <thead>
          <tr>
            <th>Competentie</th>
            <th>Gewicht</th>
            <th>Score</th>
            <th>Gewogen</th>
            <th>Visueel</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="comp in rapport.competenties" :key="comp.naam">
            <td>
              <strong>{{ comp.naam }}</strong>
              <p>{{ comp.beschrijving }}</p>
            </td>
            <td>{{ comp.gewicht }}%</td>
            <td :class="geslaagd ? 'text-green' : 'text-red'">{{ comp.score }} / 20</td>
            <td>{{ comp.gewogen }}</td>
            <td>
              <div class="progress">
                <div
                  class="progress-fill"
                  :class="geslaagd ? 'fill-green' : 'fill-red'"
                  :style="{ width: (comp.score / 20 * 100) + '%' }"
                ></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="feedback-grid">
      <article class="feedback-card">
        <h3>✅ Sterke punten</h3>
        <ul>
          <li v-for="punt in rapport.sterkePunten" :key="punt">{{ punt }}</li>
        </ul>
      </article>

      <article class="feedback-card warning">
        <h3>📝 Verbeterpunten</h3>
        <ul>
          <li v-for="punt in rapport.verbeterpunten" :key="punt">{{ punt }}</li>
        </ul>
      </article>
    </section>

    <section v-if="!geslaagd" class="card next-steps">
      <h2>Volgende stappen</h2>
      <p>Je hebt de mogelijkheid om je stage opnieuw te lopen in academiejaar 2026-2027.</p>

      <div class="steps">
        <div>
          <strong>1</strong>
          <span>Maak afspraak met je docent</span>
        </div>

        <div>
          <strong>2</strong>
          <span>Schrijf je in voor herkansing</span>
        </div>

        <div>
          <strong>3</strong>
          <span>Bereid je nieuwe stage voor</span>
        </div>
      </div>
    </section>

    <section class="signatures">
      <div>
        <span>Student</span>
        <strong>{{ rapport.student }}</strong>
        <p>Ondertekend op 28 april 2026</p>
      </div>

      <div>
        <span>Docent</span>
        <strong>{{ rapport.docent }}</strong>
        <p>✓ Goedgekeurd</p>
      </div>

      <div>
        <span>Mentor</span>
        <strong>{{ rapport.mentor }}</strong>
        <p>✓ Goedgekeurd</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.student-page {
  min-height: 100vh;
}
</style>