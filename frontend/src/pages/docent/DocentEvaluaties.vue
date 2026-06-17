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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
 
.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { font-size: 14px; font-weight: 600; color: #334155; }
 
.content { padding: 40px 64px 52px; }
.content h1 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0 0 28px; color: #64748b; font-size: 14px; }
 
.loading { text-align: center; padding: 60px; color: #64748b; }
 
.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.eval-row { cursor: pointer; transition: background 0.15s; }
.eval-row:hover { background: #fafafa; }
.student-cel { display: flex; align-items: center; gap: 14px; }
.avatar-small { width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }
.cel-arrow { color: #cbd5e1; font-weight: 700; text-align: right; }
 
.badge { padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.badge.oranje { background: #fef3c7; color: #b45309; }
.badge.groen { background: #dcfce7; color: #15803d; }
.badge.blauw { background: #dbeafe; color: #1d4ed8; }
 
.leeg { padding: 28px; color: #64748b; text-align: center; }
 
@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .content { padding: 24px 20px; }
  table { display: block; overflow-x: auto; }
}
</style>