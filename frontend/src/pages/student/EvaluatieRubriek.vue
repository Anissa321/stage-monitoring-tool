<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

// Mock competenties data — later vervangen door API
const competenties = ref([
  {
    naam: 'Communicatie',
    gewicht: 25,
    beschrijving: 'Communiceert met team, mentor en stakeholders, zowel mondeling als schriftelijk.',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Communiceert nauwelijks met team of mentor. Informeert anderen niet tijdig.' },
      { label: 'Voldoende', punten: 10, beschrijving: 'Communiceert correct maar aansporing nodig. Verslagen zijn begrijpelijk maar beperkt.' },
      { label: 'Goed', punten: 19, beschrijving: 'Communiceert helder en proactief. Verslagen zijn gestructureerd en volledig.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Sterk communicator. Rapporteert helder, luistert actief en past toon aan de situatie aan.' }
    ]
  },
  {
    naam: 'Probleemoplossing',
    gewicht: 25,
    beschrijving: 'Analyseert, reflecteert en lost technische problemen op.',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Lost problemen niet zelfstandig op. Vraagt bij elke kleine uitdaging om hulp.' },
      { label: 'Voldoende', punten: 10, beschrijving: 'Lost eenvoudige problemen op maar vraagt snel hulp bij complexere uitdagingen.' },
      { label: 'Goed', punten: 19, beschrijving: 'Lost de meeste problemen zelfstandig op. Analyseert situaties voor actie.' },
      { label: 'Uitstekend', punten: 25, beschrijving: 'Vindt creatieve, structurele oplossingen. Kent grenzen en vraagt hulp op het juiste moment.' }
    ]
  },
  {
    naam: 'Teamwork & samenwerking',
    gewicht: 20,
    beschrijving: 'Werkt constructief samen in team en draagt bij aan projectresultaten.',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Werkt nauwelijks samen. Weinig betrokkenheid bij teamactiviteiten.' },
      { label: 'Voldoende', punten: 10, beschrijving: 'Neemt taken op zich maar initiatief is beperkt. Communiceert weinig proactief.' },
      { label: 'Goed', punten: 16, beschrijving: 'Goede teamspeler. Neemt initiatief, luistert naar collega\'s en vraagt feedback.' },
      { label: 'Uitstekend', punten: 20, beschrijving: 'Zeer constructief teamlid. Motiveert collega\'s, deelt kennis en past aan op feedback.' }
    ]
  },
  {
    naam: 'Vaktechnisch handelen',
    gewicht: 30,
    beschrijving: 'Technische kennis correct toepassen in echte werksituaties.',
    niveaus: [
      { label: 'Onvoldoende', punten: 0, beschrijving: 'Technische kennis onvoldoende. Maakt te veel fouten en vraagt constant hulp.' },
      { label: 'Beperkt', punten: 10, beschrijving: 'Past basiskennis toe maar maakt fouten. Begeleiding is steeds nodig.' },
      { label: 'Voldoende', punten: 16, beschrijving: 'Past kennis correct toe in standaardsituaties. Lost eenvoudige technische problemen op.' },
      { label: 'Goed', punten: 23, beschrijving: 'Past kennis goed toe in gevarieerde situaties. Leert snel nieuwe technieken.' },
      { label: 'Uitstekend', punten: 30, beschrijving: 'Uitmuntende technische uitvoering. Introduceert verbeteringen en coacht anderen.' }
    ]
  }
])

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/student', {
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
      <h1>Rubriek van Competenties</h1>
      <p class="subtitle">Bekijk de rubriek waarop je wordt geëvalueerd.</p>

      <div class="info-banner">
        <span>ℹ️</span>
        <p>Deze rubriek wordt gebruikt door docent en mentor bij zowel je tussentijdse bespreking als je finale evaluatie. Tussentijdse scores verschijnen na elke bespreking, finale scores na de stage.</p>
      </div>

      <div class="totaal-bar">
        <span class="totaal-label">Beoordelingsrubriek — gebruikt bij tussentijdse en finale evaluatie</span>
        <span class="totaal-punten">100 punten totaal</span>
      </div>

      <div class="competentie-header">
        <span class="col-criteria">Criteria</span>
        <span class="col-niveaus">Beoordelingsniveaus</span>
        <span class="col-punten">Punten</span>
      </div>

      <div v-for="comp in competenties" :key="comp.naam" class="competentie-card">
        <div class="comp-links">
          <h3>{{ comp.naam }}</h3>
          <p>{{ comp.beschrijving }}</p>
        </div>
        <div class="comp-niveaus">
          <div v-for="niveau in comp.niveaus" :key="niveau.label" class="niveau-blok">
            <span class="niveau-label" :class="niveau.label.toLowerCase().replace(' ', '-')">{{ niveau.label }}</span>
            <p>{{ niveau.beschrijving }}</p>
          </div>
        </div>
        <div class="comp-punten">
          <span>{{ comp.gewicht }} punten</span>
        </div>
      </div>

      <div class="totaal-footer">
        <span>Totaal aantal punten: <strong>100</strong></span>
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
.subtitle { margin: 0 0 20px; color: #64748b; font-size: 14px; }

.info-banner { display: flex; gap: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.6; }

.totaal-bar { display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border-radius: 10px; padding: 12px 18px; margin-bottom: 16px; }
.totaal-label { font-size: 13px; font-weight: 600; color: #475569; }
.totaal-punten { font-size: 13px; font-weight: 700; color: #991b1b; }

.competentie-header { display: grid; grid-template-columns: 200px 1fr 100px; gap: 16px; padding: 8px 18px; margin-bottom: 8px; }
.competentie-header span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }

.competentie-card { display: grid; grid-template-columns: 200px 1fr 100px; gap: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px 18px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }

.comp-links h3 { margin: 0 0 8px; font-size: 15px; font-weight: 800; color: #111827; }
.comp-links p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; }

.comp-niveaus { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
.niveau-blok { background: #f8fafc; border-radius: 10px; padding: 10px 12px; }
.niveau-label { display: inline-block; font-size: 11px; font-weight: 700; border-radius: 6px; padding: 2px 8px; margin-bottom: 6px; }
.niveau-label.onvoldoende { background: #fef2f2; color: #991b1b; }
.niveau-label.beperkt { background: #fff7ed; color: #c2410c; }
.niveau-label.voldoende { background: #fefce8; color: #854d0e; }
.niveau-label.goed { background: #ecfdf5; color: #065f46; }
.niveau-label.uitstekend { background: #eff6ff; color: #1d4ed8; }
.niveau-blok p { margin: 0; font-size: 11px; color: #475569; line-height: 1.5; }

.comp-punten { display: flex; align-items: flex-start; justify-content: flex-end; }
.comp-punten span { font-size: 13px; font-weight: 700; color: #991b1b; white-space: nowrap; }

.totaal-footer { text-align: right; padding: 16px 18px 0; font-size: 14px; color: #475569; }
.totaal-footer strong { color: #111827; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .competentie-card, .competentie-header { grid-template-columns: 1fr; }
  .comp-punten { justify-content: flex-start; }
}
</style>