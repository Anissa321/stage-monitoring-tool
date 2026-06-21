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
    // await fetch('http://10.2.160.246:3000/api/eindevaluaties/mentor', {
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.page { min-height: 100vh; background: #f8fafc; color: #111827; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { font-size: 14px; font-weight: 600; color: #334155; }

.content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }

.titel-rij { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.titel-rij h1 { margin: 0 0 6px; font-size: 24px; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

.status-pill { background: #fef3c7; color: #b45309; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; }

.info-banner { display: flex; gap: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.6; }

.sectie-titel { font-size: 17px; font-weight: 800; margin: 0 0 14px; }

.locked-card { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 60px 40px; text-align: center; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.lock-icon { font-size: 36px; margin-bottom: 18px; }
.locked-card h3 { margin: 0 0 8px; font-size: 16px; font-weight: 800; color: #111827; }
.locked-card p { margin: 0; font-size: 13px; color: #64748b; max-width: 380px; margin-left: auto; margin-right: auto; line-height: 1.6; }

.totaal-bar { display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border-radius: 10px; padding: 12px 18px; margin-bottom: 16px; }
.totaal-label { font-size: 13px; font-weight: 600; color: #475569; }
.totaal-punten { font-size: 13px; font-weight: 800; color: #991b1b; }

.competentie-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.comp-top { margin-bottom: 14px; }
.comp-top h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; }
.comp-top p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }

.niveaus-rij { display: grid; gap: 10px; margin-bottom: 14px; }
.niveaus-rij.kolommen-4 { grid-template-columns: repeat(4, 1fr); }
.niveaus-rij.kolommen-5 { grid-template-columns: repeat(5, 1fr); }

.niveau-blok { text-align: left; border: 2px solid #e5e7eb; background: #f8fafc; border-radius: 12px; padding: 12px 14px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; font-family: inherit; transition: 0.15s ease; }
.niveau-blok:hover { border-color: #cbd5e1; background: white; }
.niveau-blok.geselecteerd { border-color: #991b1b; background: #fef2f2; box-shadow: 0 0 0 3px rgba(153,27,27,0.08); }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; color: #991b1b; margin-bottom: 2px; }
.niveau-blok.geselecteerd .niveau-punten { color: #7f1d1d; }
.niveau-label { display: block; font-size: 13px; font-weight: 800; color: #111827; }
.niveau-beschrijving { margin: 2px 0 0; font-size: 11px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

.feedback-veld { border-top: 1px solid #f1f5f9; padding-top: 14px; }
.feedback-veld label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
.feedback-veld textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #334155; font-family: inherit; resize: vertical; background: #f8fafc; }
.feedback-veld textarea:focus { outline: none; border-color: #991b1b; background: white; }

.opmerking-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.opmerking-card label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; }
.opmerking-card textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #334155; font-family: inherit; resize: vertical; background: #f8fafc; }
.opmerking-card textarea:focus { outline: none; border-color: #991b1b; background: white; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.primary-btn { border: none; background: #ea580c; color: white; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.primary-btn:hover { background: #c2410c; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .titel-rij { flex-direction: column; gap: 12px; }
  .niveaus-rij.kolommen-4, .niveaus-rij.kolommen-5 { grid-template-columns: 1fr; }
  .actions { flex-direction: column; gap: 12px; }
}
</style>