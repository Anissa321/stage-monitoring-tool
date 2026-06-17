<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
 
const router = useRouter()
const docent = ref(null)
const loading = ref(true)
 
// Mock data — later vervangen door API
// status: 'tussentijds' | 'eindrapport_klaar' | 'in_behandeling'
const evaluaties = ref([
  {
    student_id: 'a572e332-a1f4-4811-810a-11684b2d0f41',
    student_naam: 'Anissa Canton',
    bedrijf: 'Acme Corp',
    tussentijds_score: '14 / 20',
    eindscore: '16 / 20',
    status: 'eindrapport_klaar'
  },
  {
    student_id: 'b1234567-aaaa-bbbb-cccc-d1234567ef89',
    student_naam: 'Tom Janssens',
    bedrijf: 'TechSol',
    tussentijds_score: '11 / 20',
    eindscore: '—',
    status: 'in_behandeling'
  }
])
 
onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    docent.value = data.user
    // TODO: fetch evaluaties van eigen studenten
    // const evalRes = await fetch('http://localhost:3000/api/evaluaties/docent', {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // evaluaties.value = await evalRes.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function initialen(naam) {
  const delen = naam.split(' ')
  return (delen[0]?.[0] || '') + (delen[1]?.[0] || '')
}
 
function statusLabel(status) {
  if (status === 'in_behandeling') return '⏳ In behandeling'
  if (status === 'eindrapport_klaar') return '✓ Eindrapport klaar'
  if (status === 'tussentijds') return '🔵 Tussentijds bezig'
  return status
}
 
function statusKlasse(status) {
  if (status === 'in_behandeling') return 'badge oranje'
  if (status === 'eindrapport_klaar') return 'badge groen'
  if (status === 'tussentijds') return 'badge blauw'
  return 'badge'
}
 
function gaNaarEindrapport(item) {
  router.push(`/docent/studenten/${item.student_id}/eindrapport`)
}
</script>