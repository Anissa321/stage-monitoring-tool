<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

// Mock data — later vervangen door API
// status: 'geslaagd' | 'niet_geslaagd'
const eindrapport = ref({
  status: 'geslaagd',
  student_naam: 'Anissa Canton',
  bedrijf: 'Acme Corp',
  periode: 'februari — april 2026',
  beoordeeld_door: 'Jan De Vries',
  logboeken_ingevuld: 63,
  logboeken_totaal: 65,
  aanwezigheid_pct: 97,
  eindpresentatie_score: 17,
  eindpresentatie_max: 20,
  totaal_score: 16,
  totaal_max: 20,
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
  ]
})

const docent = ref(null)
const isGeslaagd = computed(() => eindrapport.value.status === 'geslaagd')

function sterren(score, max) {
  const aantal = Math.round((score / max) * 5)
  return Array.from({ length: 5 }, (_, i) => i < aantal)
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    docent.value = data.user
    // TODO: fetch eindrapport van deze student
    // const rapportRes = await fetch(`http://localhost:3000/api/eindrapporten/student/${studentId}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // eindrapport.value = await rapportRes.json()
  } catch (err) {
    console.error(err)
  }
})
</script>