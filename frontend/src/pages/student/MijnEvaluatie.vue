<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

// Mock data — later vervangen door API. geselecteerd: null = nog niet beoordeeld
const evaluatie = ref({
  datum: '15 mei 2026',
  competenties: [
    {
      naam: 'Communicatie',
      beschrijving: 'Helder en effectief communiceren met team, mentor en stakeholders, zowel mondeling als schriftelijk',
      geselecteerd: 2,
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
      geselecteerd: 3,
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
      geselecteerd: 1,
      niveaus: [
        { label: 'Onvoldoende', punten: 0, beschrijving: 'Werkt moeilijk samen. Weinig bijdrage tijdens overleg of standups.' },
        { label: 'Voldoende', punten: 10, beschrijving: 'Draait mee in het team. Voert eigen taken correct uit en respecteert basisafspraken.' },
        { label: 'Goed', punten: 15, beschrijving: 'Werkt actief en betrouwbaar samen. Neemt taken op zich en respecteert deadlines.' },
        { label: 'Uitstekend', punten: 20, beschrijving: 'Versterkt het team door initiatief en mentoring. Verbindt collega\'s.' }
      ]
    },
    {
      naam: 'Vaktechnisch handelen',
      beschrijving: 'Technische kennis correct toepassen in praktijksituaties — 5 niveaus voor extra nuance',
      geselecteerd: 3,
      niveaus: [
        { label: 'Onvoldoende', punten: 0, beschrijving: 'Past technische kennis onvoldoende toe. Maakt herhaalde basisfouten.' },
        { label: 'Beperkt', punten: 8, beschrijving: 'Past basiskennis toe met fouten. Leert traag bij nieuwe technologieën.' },
        { label: 'Voldoende', punten: 15, beschrijving: 'Past basiskennis correct toe met begeleiding. Voert standaardtaken uit.' },
        { label: 'Goed', punten: 23, beschrijving: 'Past technische kennis zelfstandig en correct toe. Pikt nieuwe tools vlot op.' },
        { label: 'Uitstekend', punten: 30, beschrijving: 'Beheerst technieken uitstekend en experimenteert met nieuwe technologie.' }
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
    const res = await fetch('http://10.2.160.246:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
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
    await fetch('http://10.2.160.246:3000/api/auth/logout', {
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
          <p>Je tussentijdse evaluatie is nog niet ingevuld door je mentor.</p>
        </div>
      </div>
      <div v-else class="status-banner klaar">
        <span>✅</span>
        <div>
          <strong>Tussentijdse evaluatie beschikbaar</strong>
          <p>Beoordeeld op {{ evaluatie.datum }} • Totaalscore: <strong>{{ totaalScore }} / {{ maxScore }}</strong></p>
        </div>
      </div>

      <h2 class="rubriek-titel">Competenties</h2>

      <div class="rubriek-tabel-wrap">
        <table class="rubriek-tabel">
          <colgroup>
            <col class="col-criteria" />
            <col class="col-niveau-vast" />
            <col class="col-niveau-vast" />
            <col class="col-niveau-vast" />
            <col class="col-niveau-vast" />
            <col class="col-niveau-vast" />
            <col class="col-punten" />
          </colgroup>
          <thead>
            <tr>
              <th class="col-criteria">Criteria</th>
              <th class="col-beoordelingen" colspan="5">Beoordelingen</th>
              <th class="col-punten">Punten</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in evaluatie.competenties" :key="comp.naam" class="comp-rij">
              <td class="cel-criteria">
                <strong>{{ comp.naam }}</strong>
                <p>{{ comp.beschrijving }}</p>
              </td>
              <td
                v-for="(niveau, idx) in comp.niveaus"
                :key="niveau.label"
                class="cel-niveau"
                :class="{ geselecteerd: comp.geselecteerd === idx, vervaagd: comp.geselecteerd !== null && comp.geselecteerd !== idx }"
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
              <td :colspan="6" class="totaal-label">Totaal aantal punten</td>
              <td class="totaal-waarde">{{ totaalScore }} / {{ maxScore }}</td>
            </tr>
          </tfoot>
        </table>
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

.content { max-width: 1400px; margin: 0 auto; padding: 32px 24px 60px; }
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

.rubriek-titel { font-size: 18px; font-weight: 800; margin: 0 0 14px; }

.rubriek-tabel-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.rubriek-tabel { width: 100%; border-collapse: collapse; table-layout: fixed; }
.rubriek-tabel thead th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
.col-criteria { width: 220px; }
.col-niveau-vast { width: 19%; }
.col-punten { width: 90px; text-align: right; }

.comp-rij { border-top: 1px solid #f1f5f9; vertical-align: top; height: 1px; }
.cel-criteria { padding: 18px 16px; height: inherit; }
.cel-criteria strong { display: block; font-size: 14px; font-weight: 800; margin-bottom: 6px; }
.cel-criteria p { margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; }

.cel-niveau { padding: 12px; border-left: 1px solid #f1f5f9; vertical-align: top; transition: 0.15s ease; height: inherit; }
.cel-niveau.vervaagd { opacity: 0.45; }
.cel-niveau.geselecteerd { background: #ecfdf5; box-shadow: inset 0 0 0 2px #15803d; }
.cel-niveau.cel-leeg { background: transparent; }
.niveau-punten { display: block; font-size: 11px; font-weight: 800; color: #991b1b; margin-bottom: 2px; }
.cel-niveau.geselecteerd .niveau-punten { color: #15803d; }
.niveau-label { display: block; font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.niveau-beschrijving { margin: 0; font-size: 10px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

.cel-punten { padding: 18px 16px; text-align: right; font-size: 14px; font-weight: 800; color: #111827; border-left: 1px solid #f1f5f9; }
.nog-geen { color: #cbd5e1; font-weight: 600; }

tfoot td { padding: 16px; border-top: 2px solid #e5e7eb; }
.totaal-label { text-align: right; font-size: 13px; font-weight: 700; color: #64748b; }
.totaal-waarde { text-align: right; font-size: 16px; font-weight: 800; color: #991b1b; border-left: 1px solid #f1f5f9; }

@media (max-width: 1100px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .rubriek-tabel-wrap { overflow-x: auto; }
  .rubriek-tabel { min-width: 900px; }
}
</style>