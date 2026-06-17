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
    beschrijving: 'Helder en effectief communiceren met team, mentor en stakeholders, zowel mondeling als schriftelijk',
    geselecteerd: null,
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Communiceert onduidelijk of onvolledig, mondeling en schriftelijk. Uitleg is moeilijk te volgen of mist context. Toont weinig initiatief tot overleg bij onduidelijkheden.' },
      { label: 'Voldoende', punten: 13, beschrijving: 'Communiceert correct na aansporing of vraag. Berichten zijn begrijpelijk maar kunnen scherper en beknopter. Vraagt om hulp wanneer nodig op het juiste moment.' },
      { label: 'Goed', punten: 19, beschrijving: 'Communiceert helder en zelfstandig met team en mentor. Schriftelijke en mondelinge boodschappen zijn gestructureerd en doelgericht. Kiest het juiste kanaal per situatie.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Stuurt overleg proactief en neemt initiatief in moeilijke gesprekken. Rapporteert helder, beknopt en volledig. Past stijl en toon aan op publiek en context.' }
    ]
  },
  {
    naam: 'Probleemoplossing',
    beschrijving: 'Analyseren, redeneren en creatieve oplossingen vinden voor praktijkproblemen',
    geselecteerd: null,
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Lost problemen niet zelfstandig op. Herkent uitdagingen pas wanneer ze escaleren. Vraagt zelden om hulp en stelt geen verhelderende vragen.' },
      { label: 'Voldoende', punten: 13, beschrijving: 'Lost eenvoudige problemen op met begeleiding. Analyseert oppervlakkig en kiest soms voor de eerste oplossing zonder afweging. Documenteert oplossingen achteraf.' },
      { label: 'Goed', punten: 19, beschrijving: 'Analyseert problemen zelfstandig en systematisch. Weegt meerdere oplossingen tegen elkaar af en kiest gemotiveerd. Documenteert keuzes en deelt redenering met het team.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Vindt creatieve, structurele oplossingen. Herkent oorzaken in plaats van symptomen. Helpt anderen bij hun problemen en anticipeert op toekomstige knelpunten.' }
    ]
  },
  {
    naam: 'Teamwork & samenwerking',
    beschrijving: 'Effectief samenwerken in team en bijdrage aan groepsdynamiek en werksfeer',
    geselecteerd: null,
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Werkt moeilijk samen. Weinig bijdrage tijdens overleg of standups. Mist deadlines of dwingt teamleden om bij te springen. Reageert niet constructief op feedback.' },
      { label: 'Voldoende', punten: 10, beschrijving: 'Draait mee in het team. Voert eigen taken correct uit en respecteert basisafspraken. Bijdrage tijdens overleg is beperkt maar respectvol.' },
      { label: 'Goed', punten: 15, beschrijving: 'Werkt actief en betrouwbaar samen. Neemt taken op zich en respecteert deadlines. Communiceert tijdig over voortgang en ondersteunt teamleden bij vragen.' },
      { label: 'Uitstekend', punten: 20, beschrijving: 'Versterkt het team door initiatief en mentoring. Verbindt collega\'s en bevordert kennisdeling. Lost conflicten constructief op en draagt bij aan een veilige werksfeer.' }
    ]
  },
  {
    naam: 'Vaktechnisch handelen',
    beschrijving: 'Technische kennis correct toepassen in praktijksituaties — 5 niveaus voor extra nuance',
    geselecteerd: null,
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

      <h2 class="rubriek-titel">Competenties</h2>

      <!-- Eén grote tabel zoals figma -->
      <div class="rubriek-tabel-wrap">
        <table class="rubriek-tabel">
          <thead>
            <tr>
              <th class="col-criteria">Criteria</th>
              <th class="col-beoordelingen" colspan="5">Beoordelingen — klik op een niveau</th>
              <th class="col-punten">Punten</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in competenties" :key="comp.naam" class="comp-rij">
              <td class="cel-criteria">
                <strong>{{ comp.naam }}</strong>
                <p>{{ comp.beschrijving }}</p>
              </td>
              <td
                v-for="(niveau, idx) in comp.niveaus"
                :key="niveau.label"
                class="cel-niveau"
                :class="{ geselecteerd: comp.geselecteerd === idx }"
                @click="selecteerNiveau(comp, idx)"
              >
                <span class="niveau-punten">{{ niveau.punten }} ptn</span>
                <span class="niveau-label">{{ niveau.label }}</span>
                <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
              </td>
              <td v-for="n in (5 - comp.niveaus.length)" :key="'leeg'+n" class="cel-niveau cel-leeg"></td>
              <td class="cel-punten">
                <span v-if="comp.geselecteerd !== null">{{ comp.niveaus[comp.geselecteerd].punten }} / {{ comp.niveaus[comp.niveaus.length-1].punten }}</span>
                <span v-else class="nog-geen">—</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td :colspan="6" class="totaal-label">Tussentijdse score</td>
              <td class="totaal-waarde">{{ totaalScore() }} / {{ maxScore() }}</td>
            </tr>
          </tfoot>
        </table>
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

.content { max-width: 1400px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 4px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.meta-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.meta-grid { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1fr; gap: 20px; }
.meta-veld label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.input-icon-wrap { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; }
.input-icon-wrap input { border: none; background: transparent; font-size: 13px; color: #334155; font-family: inherit; outline: none; width: 100%; }
.separator { color: #94a3b8; font-weight: 600; }
.aanwezigen-rij { display: flex; gap: 6px; margin-bottom: 4px; }
.avatar-cirkel { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 800; }
.aanwezigen-namen { margin: 0; font-size: 11px; color: #64748b; }

.rubriek-titel { font-size: 18px; font-weight: 800; margin: 0 0 14px; }

.rubriek-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 24px; }
.rubriek-tabel { width: 100%; border-collapse: collapse; table-layout: fixed; }
.rubriek-tabel thead th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
.col-criteria { width: 220px; }
.col-punten { width: 90px; text-align: right; }

.comp-rij { border-top: 1px solid #f1f5f9; vertical-align: top; }
.cel-criteria { padding: 18px 16px; }
.cel-criteria strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.cel-criteria p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }

.cel-niveau { padding: 12px; cursor: pointer; border-left: 1px solid #f1f5f9; transition: 0.15s ease; vertical-align: top; }
.cel-niveau:hover { background: #f8fafc; }
.cel-niveau.geselecteerd { background: #fef2f2; }
.cel-niveau.cel-leeg { cursor: default; background: #fafafa; }
.cel-niveau.cel-leeg:hover { background: #fafafa; }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; color: #991b1b; margin-bottom: 2px; }
.cel-niveau.geselecteerd .niveau-punten { color: #7f1d1d; }
.niveau-label { display: block; font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.niveau-beschrijving { margin: 0; font-size: 10px; color: #64748b; line-height: 1.5; }
.cel-niveau.geselecteerd { box-shadow: inset 0 0 0 2px #991b1b; }

.cel-punten { padding: 18px 16px; text-align: right; font-size: 14px; font-weight: 800; color: #111827; border-left: 1px solid #f1f5f9; }
.nog-geen { color: #cbd5e1; font-weight: 600; }

tfoot td { padding: 16px; border-top: 2px solid #e5e7eb; }
.totaal-label { text-align: right; font-size: 13px; font-weight: 700; color: #64748b; }
.totaal-waarde { text-align: right; font-size: 16px; font-weight: 800; color: #991b1b; border-left: 1px solid #f1f5f9; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 1100px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .meta-grid { grid-template-columns: 1fr 1fr; }
  .rubriek-tabel-wrap { overflow-x: auto; }
  .rubriek-tabel { min-width: 900px; }
  .actions { flex-direction: column; gap: 12px; }
}
</style>