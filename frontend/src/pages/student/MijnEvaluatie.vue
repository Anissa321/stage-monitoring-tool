<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

// Mock data — later vervangen door API (komt overeen met wat mentor invult)
// geselecteerd: null = nog niet beoordeeld (blanco), anders index van niveau
const evaluatie = ref({
  datum: '15 mei 2026',
  competenties: [
    {
      naam: 'Communicatie',
      beschrijving: 'Communiceert met team, mentor en stakeholders, zowel mondeling als schriftelijk.',
      geselecteerd: 2,
      feedback: 'Goed werk de klanten, blijf zo! Probeer ook tijdens vergaderingen meer initiatief te nemen.',
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
      geselecteerd: 3,
      feedback: 'Uitstekende analyse-skills! Anissa lost problemen snel en grondig op.',
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
      geselecteerd: 1,
      feedback: 'Goede teamspeler, blijf actief deelnemen aan vergaderingen.',
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
      geselecteerd: 3,
      feedback: 'Anissa heeft sterke technische skills. Snelle adoptie van nieuwe technologieën.',
      niveaus: [
        { label: 'Onvoldoende', punten: 0, beschrijving: 'Past technische kennis onvoldoende toe in praktijksituaties. Maakt herhaalde basisfouten en herkent ze niet zelfstandig. Heeft veel begeleiding nodig.' },
        { label: 'Beperkt', punten: 8, beschrijving: 'Past basiskennis toe met fouten. Herkent eigen fouten niet altijd en corrigeert met begeleiding. Leert traag bij nieuwe technologieën of tools.' },
        { label: 'Voldoende', punten: 15, beschrijving: 'Past basiskennis correct toe met begeleiding. Voert standaardtaken volgens instructie uit. Stelt vragen wanneer nodig en past best practices toe.' },
        { label: 'Goed', punten: 23, beschrijving: 'Past technische kennis zelfstandig en correct toe. Pikt nieuwe tools en frameworks vlot op. Levert kwalitatief werk dat voldoet aan teamstandaarden.' },
        { label: 'Uitstekend', punten: 30, beschrijving: 'Beheerst technieken uitstekend en experimenteert met nieuwe technologie. Deelt kennis via documentatie, demo\'s of code reviews. Werkt als referentie binnen het team.' }
      ]
    }
  ]
})

const isBeoordeeld = computed(() => evaluatie.value.competenties.some(c => c.geselecteerd !== null))

const totaalScore = computed(() => {
  return evaluatie.value.competenties.reduce((sum, c) => {
    if (c.geselecteerd === null) return sum
    return sum + c.niveaus[c.geselecteerd].punten
  }, 0)
})

const maxScore = computed(() => {
  return evaluatie.value.competenties.reduce((sum, c) => sum + c.niveaus[c.niveaus.length - 1].punten, 0)
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
    // TODO: fetch tussentijdse evaluatie data
    // const evalRes = await fetch('http://localhost:3000/api/evaluaties/tussentijds', {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // evaluatie.value = await evalRes.json()
  } catch (err) {
    console.error(err)
  }
})

function voornaam() { return data.value?.user?.voornaam || 'Student' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'S'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {}
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
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
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a class="active" @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/student/dashboard')">← Terug naar dashboard</a>
      <h1>Mijn evaluatie</h1>
      <p class="subtitle">Bekijk hoe je beoordeeld wordt per competentie.</p>

      <div v-if="!isBeoordeeld" class="status-banner wachten">
        <span>⏳</span>
        <div>
          <strong>Nog niet beoordeeld</strong>
          <p>Je tussentijdse evaluatie is nog niet ingevuld door je mentor. Zodra dit gebeurt, zie je hier de scores en feedback per competentie.</p>
        </div>
      </div>
      <div v-else class="status-banner klaar">
        <span>✅</span>
        <div>
          <strong>Tussentijdse evaluatie beschikbaar</strong>
          <p>Beoordeeld op {{ evaluatie.datum }} • Totaalscore: <strong>{{ totaalScore }} / {{ maxScore }}</strong></p>
        </div>
      </div>

      <div v-for="comp in evaluatie.competenties" :key="comp.naam" class="competentie-card">
        <div class="comp-top">
          <h3>{{ comp.naam }}</h3>
          <p>{{ comp.beschrijving }}</p>
        </div>

        <div class="niveaus-rij" :class="'kolommen-' + comp.niveaus.length">
          <div
            v-for="(niveau, idx) in comp.niveaus"
            :key="niveau.label"
            class="niveau-blok"
            :class="{ geselecteerd: comp.geselecteerd === idx }"
          >
            <span class="niveau-punten">{{ niveau.punten }} pnt</span>
            <span class="niveau-label">{{ niveau.label }}</span>
            <p class="niveau-beschrijving">{{ niveau.beschrijving }}</p>
            <span v-if="comp.geselecteerd === idx" class="behaald-badge">✓ Behaald</span>
          </div>
        </div>

        <div v-if="comp.geselecteerd !== null && comp.feedback" class="feedback-blok">
          <details>
            <summary>💬 Feedback van mentor</summary>
            <p class="feedback-tekst">"{{ comp.feedback }}"</p>
          </details>
        </div>
        <div v-else class="feedback-blok leeg">
          <span>Nog geen feedback ontvangen voor deze competentie.</span>
        </div>
      </div>

      <div class="rubriek-link" @click="router.push('/student/evaluatie/rubriek')">
        <span>📋 Bekijk de volledige beoordelingsrubriek</span>
        <span>→</span>
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
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.status-banner { display: flex; gap: 14px; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; }
.status-banner span { font-size: 22px; flex-shrink: 0; }
.status-banner strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 4px; }
.status-banner p { margin: 0; font-size: 13px; line-height: 1.5; }
.status-banner.wachten { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.status-banner.klaar { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }

.competentie-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.comp-top { margin-bottom: 14px; }
.comp-top h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; }
.comp-top p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }

.niveaus-rij { display: grid; gap: 10px; margin-bottom: 14px; }
.niveaus-rij.kolommen-4 { grid-template-columns: repeat(4, 1fr); }
.niveaus-rij.kolommen-5 { grid-template-columns: repeat(5, 1fr); }

.niveau-blok { position: relative; border: 2px solid #e5e7eb; background: #f8fafc; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; opacity: 0.6; }
.niveau-blok.geselecteerd { border-color: #15803d; background: #ecfdf5; opacity: 1; box-shadow: 0 0 0 3px rgba(21,128,61,0.08); }
.niveau-punten { font-size: 11px; font-weight: 800; color: #991b1b; }
.niveau-blok.geselecteerd .niveau-punten { color: #15803d; }
.niveau-label { font-size: 13px; font-weight: 800; color: #111827; }
.niveau-beschrijving { margin: 2px 0 0; font-size: 11px; color: #64748b; line-height: 1.5; }
.behaald-badge { position: absolute; top: -10px; right: 10px; background: #15803d; color: white; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 999px; }

.feedback-blok { border-top: 1px solid #f1f5f9; padding-top: 14px; }
.feedback-blok details { cursor: pointer; }
.feedback-blok summary { font-size: 12px; font-weight: 700; color: #64748b; list-style: none; display: flex; align-items: center; gap: 6px; }
.feedback-blok summary::before { content: '▶'; font-size: 9px; transition: 0.2s; }
.feedback-blok details[open] summary::before { content: '▼'; }
.feedback-tekst { margin: 8px 0 0; font-size: 13px; color: #475569; font-style: italic; line-height: 1.6; background: #f8fafc; border-left: 3px solid #e2e8f0; padding: 10px 14px; border-radius: 0 8px 8px 0; }
.feedback-blok.leeg span { font-size: 12px; color: #94a3b8; font-style: italic; }

.rubriek-link { display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 20px; margin-top: 24px; cursor: pointer; font-size: 14px; font-weight: 600; color: #334155; transition: 0.2s; }
.rubriek-link:hover { background: #fee2e2; border-color: #fecaca; color: #991b1b; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .niveaus-rij.kolommen-4, .niveaus-rij.kolommen-5 { grid-template-columns: 1fr; }
}
</style>