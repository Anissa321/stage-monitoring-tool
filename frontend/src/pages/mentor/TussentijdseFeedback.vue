<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

const student = ref({ naam: 'Anissa Canton', bedrijf: 'Acme Corp' })

const form = ref({
  datum: '',
  tijdVan: '14:00',
  tijdTot: '15:00',
  locatie: ''
})

const aanwezigen = ref([
  { initialen: 'AC', naam: 'Anissa Canton', kleur: '#dbeafe', tekstkleur: '#1d4ed8' },
  { initialen: 'SJ', naam: 'Sven Janssens', kleur: '#dcfce7', tekstkleur: '#15803d' }
])

const competenties = ref([
  {
    naam: 'Communicatie',
    beschrijving: 'Communiceert met team, mentor en stakeholders, zowel mondeling als schriftelijk.',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Communiceert nauwelijks met team of mentor. Informeert anderen niet tijdig.' },
      { label: 'Voldoende', punten: 13, beschrijving: 'Communiceert correct maar aansporing nodig. Verslagen zijn begrijpelijk maar beperkt.' },
      { label: 'Goed', punten: 19, beschrijving: 'Communiceert helder en proactief. Verslagen zijn gestructureerd en volledig.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Sterk communicator. Rapporteert helder, luistert actief en past toon aan de situatie aan.' }
    ]
  },
  {
    naam: 'Probleemoplossing',
    beschrijving: 'Analyseert, redeneert en creatieve oplossingen vinden voor praktijkproblemen.',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Lost problemen niet zelfstandig op. Herkent uitdagingen pas wanneer ze escaleren. Vraagt zelden om hulp en stelt geen verhelderende vragen.' },
      { label: 'Voldoende', punten: 13, beschrijving: 'Lost eenvoudige problemen op met begeleiding. Analyseert oppervlakkig en kiest soms voor de eerste oplossing zonder afweging.' },
      { label: 'Goed', punten: 19, beschrijving: 'Analyseert problemen zelfstandig en systematisch. Weegt meerdere oplossingen tegen elkaar af en kiest gemotiveerd.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Vindt creatieve, structurele oplossingen. Herkent oorzaken in plaats van symptomen. Helpt anderen bij hun problemen en anticipeert op toekomstige knelpunten.' }
    ]
  },
  {
    naam: 'Teamwork & samenwerking',
    beschrijving: 'Effectief samenwerken in team en bijdrage aan groepsdynamiek en werksfeer.',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Werkt moeilijk samen. Weinig bijdrage tijdens overleg of standups. Mist deadlines of dwingt teamleden om bij te springen. Reageert niet constructief op feedback.' },
      { label: 'Voldoende', punten: 10, beschrijving: 'Draait mee in het team. Voert eigen taken correct uit en respecteert basisafspraken. Bijdrage tijdens overleg is beperkt maar respectvol.' },
      { label: 'Goed', punten: 15, beschrijving: 'Werkt actief en betrouwbaar samen. Neemt taken op zich op het respectvolle deadlines. Communiceert tijdig over voortgang en ondersteunt teamleden bij vragen.' },
      { label: 'Uitstekend', punten: 20, beschrijving: 'Versterkt het team door initiatief en mentoring. Verbindt collega\'s en bevordert kennisdeling. Lost conflicten constructief op en draagt bij aan een veilige werksfeer.' }
    ]
  },
  {
    naam: 'Vaktechnisch handelen',
    beschrijving: 'Technische kennis correct toepassen in praktijksituaties — 5 niveaus voor extra nuance.',
    geselecteerd: null,
    feedback: '',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Past technische kennis onvoldoende toe in praktijksituaties. Maakt herhaalde basisfouten en herkent ze niet zelfstandig. Heeft veel begeleiding nodig.' },
      { label: 'Beperkt', punten: 8, beschrijving: 'Past basiskennis toe met fouten. Herkent eigen fouten niet altijd en corrigeert met begeleiding. Leert traag bij nieuwe technologieën of tools.' },
      { label: 'Voldoende', punten: 15, beschrijving: 'Past basiskennis correct toe met begeleiding. Voert standaardtaken volgens instructie uit. Stelt vragen wanneer nodig en past best practices toe.' },
      { label: 'Goed', punten: 23, beschrijving: 'Past technische kennis zelfstandig en correct toe. Pikt nieuwe tools en frameworks vlot op. Levert kwalitatief werk dat voldoet aan teamstandaarden.' },
      { label: 'Uitstekend', punten: 30, beschrijving: 'Beheerst technieken uitstekend en experimenteert met nieuwe technologie. Deelt kennis via documentatie, demo\'s of code reviews. Werkt als referentie binnen het team.' }
    ]
  }
])

const loading = ref(false)
const error = ref('')
const succes = ref('')

function selecteerNiveau(comp, idx) {
  comp.geselecteerd = idx
}

function totaalScore() {
  return competenties.value.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
}

function maxScore() {
  return competenties.value.reduce((sum, c) => sum + c.niveaus[c.niveaus.length - 1].punten, 0)
}

function alleIngevuld() {
  return competenties.value.every(c => c.geselecteerd !== null)
}

async function registreren() {
  if (!form.value.datum) {
    error.value = 'Vul de datum in.'
    return
  }
  if (!alleIngevuld()) {
    error.value = 'Selecteer een niveau voor elke competentie.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    // TODO: vervang door echte API call
    await new Promise(resolve => setTimeout(resolve, 800))
    succes.value = 'Tussentijdse evaluatie geregistreerd!'
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
        <a class="active" @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>Sven Janssens</span>
        <div class="avatar-klein">SJ</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push(`/mentor/student/${studentId}`)">← Terug naar studentdossier</a>
      <h1>Tussentijdse evaluatie</h1>
      <p class="subtitle">Voor {{ student.naam }} • {{ student.bedrijf }}</p>

      <div class="meta-card">
        <div class="meta-grid">
          <div class="meta-veld">
            <label>Datum</label>
            <div class="input-icon-wrap">
              <span>📅</span>
              <input v-model="form.datum" type="date" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Tijd</label>
            <div class="input-icon-wrap">
              <span>🕐</span>
              <input v-model="form.tijdVan" type="time" />
              <span class="separator">—</span>
              <input v-model="form.tijdTot" type="time" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Locatie</label>
            <div class="input-icon-wrap">
              <span>📍</span>
              <input v-model="form.locatie" type="text" placeholder="bv. Op kantoor Acme Corp" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Aanwezigen</label>
            <div class="aanwezigen-rij">
              <div
                v-for="a in aanwezigen"
                :key="a.initialen"
                class="avatar-cirkel"
                :style="{ background: a.kleur, color: a.tekstkleur }"
                :title="a.naam"
              >{{ a.initialen }}</div>
            </div>
            <p class="aanwezigen-namen">{{ aanwezigen.map(a => a.naam.split(' ')[0]).join(', ') }}</p>
          </div>
        </div>
      </div>

      <div class="totaal-bar">
        <span class="totaal-label">Klik op een niveau per competentie om te beoordelen</span>
        <span class="totaal-punten">Tussentijdse score: {{ totaalScore() }} / {{ maxScore() }}</span>
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

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="succes" class="succes-msg">{{ succes }}</div>

      <div class="actions">
        <button class="cancel-btn" @click="annuleren">Annuleren</button>
        <button class="submit-btn" :disabled="loading" @click="registreren">
          <span v-if="loading">Registreren...</span>
          <span v-else>✓ Evaluatie registreren</span>
        </button>
      </div>
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
.profile { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar-klein { width: 34px; height: 34px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 11px; font-weight: 700; }

.content { max-width: 1200px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 4px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.meta-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.meta-grid { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1fr; gap: 20px; }
.meta-veld label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.input-icon-wrap { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; }
.input-icon-wrap input { border: none; background: transparent; font-size: 13px; color: #334155; font-family: inherit; outline: none; width: 100%; }
.separator { color: #94a3b8; font-weight: 600; }
.aanwezigen-rij { display: flex; gap: 6px; margin-bottom: 4px; }
.avatar-cirkel { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 800; }
.aanwezigen-namen { margin: 0; font-size: 11px; color: #64748b; }

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
.niveau-punten { font-size: 11px; font-weight: 800; color: #991b1b; }
.niveau-blok.geselecteerd .niveau-punten { color: #7f1d1d; }
.niveau-label { font-size: 13px; font-weight: 800; color: #111827; }
.niveau-beschrijving { margin: 2px 0 0; font-size: 11px; color: #64748b; line-height: 1.5; }

.feedback-veld { border-top: 1px solid #f1f5f9; padding-top: 14px; }
.feedback-veld label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
.feedback-veld textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #334155; font-family: inherit; resize: vertical; background: #f8fafc; }
.feedback-veld textarea:focus { outline: none; border-color: #991b1b; background: white; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .meta-grid { grid-template-columns: 1fr 1fr; }
  .niveaus-rij.kolommen-4, .niveaus-rij.kolommen-5 { grid-template-columns: 1fr; }
  .actions { flex-direction: column; gap: 12px; }
}
</style>