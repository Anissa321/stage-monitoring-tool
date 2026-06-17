<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

// Mock data — later vervangen door API
const student = ref({ naam: 'Anissa Canton', bedrijf: 'Acme Corp' })

// TODO: vervang door echte check via API (bv. of er al een tussentijdse evaluatie bestaat voor deze student)
// const tussentijdsAfgerond = ref(false)
const tussentijdsAfgerond = ref(true)

function gaNaarTussentijds() {
  router.push(`/mentor/student/${studentId}/feedback`)
}

const competenties = ref([
  {
    naam: 'Vaktechnisch handelen',
    beschrijving: 'Technische kennis correct toepassen in praktijksituaties — 5 niveaus voor extra nuance',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Past technische kennis onvoldoende toe in praktijksituaties. Maakt herhaalde basisfouten en herkent ze niet zelfstandig. Heeft veel begeleiding nodig.' },
      { label: 'Beperkt', punten: 8, beschrijving: 'Past basiskennis toe met fouten. Herkent eigen fouten niet altijd en corrigeert met begeleiding. Leert traag bij nieuwe technologieën of tools.' },
      { label: 'Voldoende', punten: 15, beschrijving: 'Past basiskennis correct toe met begeleiding. Voert standaardtaken volgens instructie uit. Stelt vragen wanneer nodig en past best practices toe.' },
      { label: 'Goed', punten: 23, beschrijving: 'Past technische kennis zelfstandig en correct toe. Pikt nieuwe tools en frameworks vlot op. Levert kwalitatief werk dat voldoet aan teamstandaarden.' },
      { label: 'Uitstekend', punten: 30, beschrijving: 'Beheerst technieken uitstekend en experimenteert met nieuwe technologie. Deelt kennis via documentatie, demo\'s of code reviews. Werkt als referentie binnen het team.' }
    ]
  },
  {
    naam: 'Communicatie',
    beschrijving: 'Helder en effectief communiceren met team, mentor en stakeholders, zowel mondeling als schriftelijk',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Communiceert onduidelijk of onvolledig, mondeling en schriftelijk. Uitleg is moeilijk te volgen of mist context.' },
      { label: 'Voldoende', punten: 13, beschrijving: 'Communiceert correct na aansporing of vraag. Berichten zijn begrijpelijk maar kunnen scherper en beknopter.' },
      { label: 'Goed', punten: 19, beschrijving: 'Communiceert helder en zelfstandig met team en mentor. Schriftelijke en mondelinge boodschappen zijn gestructureerd en doelgericht.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Stuurt overleg proactief en neemt initiatief in moeilijke gesprekken. Rapporteert helder, beknopt en volledig.' }
    ]
  },
  {
    naam: 'Probleemoplossing',
    beschrijving: 'Analyseren, redeneren en creatieve oplossingen vinden voor praktijkproblemen',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Lost problemen niet zelfstandig op. Herkent uitdagingen pas wanneer ze escaleren.' },
      { label: 'Voldoende', punten: 13, beschrijving: 'Lost eenvoudige problemen op met begeleiding. Analyseert oppervlakkig.' },
      { label: 'Goed', punten: 19, beschrijving: 'Analyseert problemen zelfstandig en systematisch. Weegt meerdere oplossingen tegen elkaar af.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Vindt creatieve, structurele oplossingen. Herkent oorzaken in plaats van symptomen.' }
    ]
  },
  {
    naam: 'Teamwork & samenwerking',
    beschrijving: 'Effectief samenwerken in team en bijdrage aan groepsdynamiek en werksfeer',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Werkt moeilijk samen. Weinig bijdrage tijdens overleg of standups.' },
      { label: 'Voldoende', punten: 10, beschrijving: 'Draait mee in het team. Voert eigen taken correct uit en respecteert basisafspraken.' },
      { label: 'Goed', punten: 15, beschrijving: 'Werkt actief en betrouwbaar samen. Neemt taken op zich en respecteert deadlines.' },
      { label: 'Uitstekend', punten: 20, beschrijving: 'Versterkt het team door initiatief en mentoring. Verbindt collega\'s.' }
    ]
  }
])

const globaleOpmerking = ref('')
const loading = ref(false)
const error = ref('')
const succes = ref('')

function selecteerNiveau(comp, idx) {
  comp.geselecteerd = idx
}

const totaalScore = computed(() => {
  return competenties.value.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
})

const maxScore = computed(() => {
  return competenties.value.reduce((sum, c) => sum + c.niveaus[c.niveaus.length - 1].punten, 0)
})

function alleIngevuld() {
  return competenties.value.every(c => c.geselecteerd !== null)
}

async function evaluatieAfronden() {
  if (!alleIngevuld()) {
    error.value = 'Vul een score in voor elke competentie.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    // TODO: vervang door echte API call
    // const token = localStorage.getItem('token')
    // const payload = {
    //   student_id: studentId,
    //   opmerking: globaleOpmerking.value,
    //   competenties: competenties.value.map(c => ({
    //     naam: c.naam,
    //     niveau: c.niveaus[c.geselecteerd].label,
    //     punten: c.niveaus[c.geselecteerd].punten,
    //     feedback: c.feedback
    //   })),
    //   totaal_score: totaalScore.value
    // }
    // await fetch('http://localhost:3000/api/eindevaluaties/mentor', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //   body: JSON.stringify(payload)
    // })
    await new Promise(resolve => setTimeout(resolve, 800))
    succes.value = 'Eindevaluatie afgerond!'
    setTimeout(() => router.push(`/mentor/student/${studentId}`), 1500)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
}

function annuleren() {
  router.push(`/mentor/student/${studentId}`)
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
        <a @click="router.push('/mentor/dashboard')">Dashboard</a>
        <a @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a class="active" @click="router.push('/mentor/evaluaties')">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>Sven Janssens</span>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push(`/mentor/student/${studentId}`)">← Terug naar studentdossier</a>

      <div class="titel-rij">
        <div>
          <h1>Eindevaluatie — Mentor</h1>
          <p class="subtitle">Voor {{ student.naam }} • {{ student.bedrijf }} • Stage 2026</p>
        </div>
        <span class="status-pill">⏳ In behandeling</span>
      </div>

      <div class="info-banner">
        <span>ℹ️</span>
        <p>De competenties zijn dynamisch geladen. Wijzigingen in de opleidingsstructuur worden automatisch overgenomen.</p>
      </div>

      <!-- VERGRENDELD: tussentijdse evaluatie nog niet gedaan -->
      <template v-if="!tussentijdsAfgerond">
        <h2 class="sectie-titel">Competenties</h2>
        <div class="locked-card">
          <div class="lock-icon">🔒</div>
          <h3>Eindevaluatie nog niet beschikbaar</h3>
          <p>Een tussentijdse evaluatie is nog niet ingevuld. Doorloop eerst de tussentijdse evaluatie per competentie.</p>
        </div>
        <div class="actions">
          <button class="cancel-btn" @click="annuleren">Annuleren</button>
          <button class="primary-btn" @click="gaNaarTussentijds">Ga naar tussentijdse evaluatie →</button>
        </div>
      </template>

      <!-- OPEN: invul-pagina -->
      <template v-else>
        <div class="totaal-bar">
          <span class="totaal-label">Klik op een niveau per competentie om te beoordelen</span>
          <span class="totaal-punten">Eindscore: {{ totaalScore }} / {{ maxScore }}</span>
        </div>

        <div v-for="comp in competenties" :key="comp.naam" class="competentie-card">
          <div class="comp-top">
            <h3>{{ comp.naam }}</h3>
            <p>{{ comp.beschrijving }}</p>
          </div>

          <div class="niveaus-rij" :class="'kolommen-' + comp.niveaus.length">
            <button
              v-for="(niveau, idx) in comp.niveaus"
              :key="niveau.label"
              class="niveau-blok"
              :class="{ geselecteerd: comp.geselecteerd === idx }"
              @click="selecteerNiveau(comp, idx)"
            >
              <span class="niveau-punten">{{ niveau.punten }} pnt</span>
              <span class="niveau-label">{{ niveau.label }}</span>
              <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
            </button>
          </div>

          <div class="feedback-veld">
            <label>💬 Feedback voor deze competentie</label>
            <textarea v-model="comp.feedback" rows="2" placeholder="Optionele toelichting bij je keuze..."></textarea>
          </div>
        </div>

        <div class="opmerking-card">
          <label>Globale opmerking</label>
          <textarea v-model="globaleOpmerking" rows="3" placeholder="Optionele algemene opmerking bij de eindevaluatie..."></textarea>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="succes" class="succes-msg">{{ succes }}</div>

        <div class="actions">
          <button class="cancel-btn" @click="annuleren">Annuleren</button>
          <button class="submit-btn" :disabled="loading" @click="evaluatieAfronden">
            <span v-if="loading">Afronden...</span>
            <span v-else>✓ Evaluatie afronden</span>
          </button>
        </div>
      </template>
    </section>
  </main>
</template>