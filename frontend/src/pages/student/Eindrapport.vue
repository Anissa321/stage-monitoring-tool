<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

// Mock data — later vervangen door API
// Wissel status tussen 'geslaagd' en 'niet_geslaagd' om beide versies te testen
const eindrapport = ref({
  status: 'geslaagd',
  bedrijf: 'Acme Corp',
  periode: 'februari — april 2026',
  beoordeeld_door: 'Jan De Vries',
  logboeken: '63 / 65 dagen',
  aanwezigheid_pct: 97,
  eindpresentatie: '17 / 20',
  totaal_score: 16,
  max_score: 20,
  algemene_beoordeling: 'Uitstekend',
  competenties: [
    { naam: 'Vaktechnisch handelen', beschrijving: 'Technische kennis correct toepassen', gewicht: 30, score: 16, max: 20, gewogen: 4.8 },
    { naam: 'Communicatie', beschrijving: 'Helder en effectief communiceren', gewicht: 25, score: 14, max: 20, gewogen: 3.5 },
    { naam: 'Probleemoplossing', beschrijving: 'Analyseren en creatief oplossen', gewicht: 25, score: 17, max: 20, gewogen: 4.25 },
    { naam: 'Teamwork & samenwerking', beschrijving: 'Effectief samenwerken in team', gewicht: 20, score: 15, max: 20, gewogen: 3.0 }
  ],
  sterke_punten: [
    'Sterke technische skills, snelle adoptie van nieuwe tech',
    'Neemt zelfstandig initiatief',
    'Goede communicatie met team en stakeholders',
    'Levert kwalitatief werk binnen deadlines',
    'Positieve feedback van mentor over werktraject'
  ],
  verbeterpunten: [
    'Meer aandacht voor architectuurkeuzes',
    'Code reviews actiever bijwonen',
    'Logboek consistenter dagelijks invullen',
    'Verdere groei in schaalbare code-design',
    'Presentatieskills verfijnen'
  ],
  herkansing: {
    academiejaar: '2026-2027',
    stappen: [
      { titel: 'Maak afspraak met je docent', beschrijving: 'Bespreek de evaluatie en het herkansingstraject met Jan De Vries voor 30 juni 2026.' },
      { titel: 'Schrijf je in voor herkansing', beschrijving: 'Inschrijving via EduMaFlex voor 1 september 2026. Vraag begeleiding aan de stagecommissie.' },
      { titel: 'Bereid je nieuwe stage voor', beschrijving: 'Stagestart in academiejaar 2026-2027. Werk vooraf aan verbeterpunten met je docent.' }
    ]
  }
})

const isGeslaagd = computed(() => eindrapport.value.status === 'geslaagd')

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