<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const voorstellen = ref([])
const loading = ref(true)
const zoekterm = ref('')
const actieveFilter = ref('alle')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/stagevoorstellen/commissie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    voorstellen.value = (data.stagevoorstellen || []).filter(v => v.status !== 'ingediend')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const gefilterd = computed(() => {
  return voorstellen.value.filter(v => {
    const matchFilter = actieveFilter.value === 'alle' || v.status === actieveFilter.value
    const matchZoek = !zoekterm.value ||
      v.student_naam?.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
      v.bedrijfsnaam?.toLowerCase().includes(zoekterm.value.toLowerCase())
    return matchFilter && matchZoek
  })
})

function formatPeriode(start, eind) {
  if (!start || !eind) return '—'
  const s = new Date(start).toLocaleDateString('nl-BE', { month: 'short', year: 'numeric' })
  const e = new Date(eind).toLocaleDateString('nl-BE', { month: 'short', year: 'numeric' })
  return `${s} – ${e}`
}

function formatDatum(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return '✓ Goedgekeurd'
  if (status === 'afgekeurd') return '✗ Afgekeurd'
  if (status === 'aanpassen') return '✎ Aanpassingen'
  return status
}

function statusClass(status) {
  if (status === 'goedgekeurd') return 'badge-groen'
  if (status === 'afgekeurd') return 'badge-rood'
  if (status === 'aanpassen') return 'badge-oranje'
  return ''
}
</script>

<template>
  <main class="commissie-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/commissie/dashboard')">Dashboard</a>
        <a @click="router.push('/commissie/aanvragen')">Aanvragen</a>
        <a class="active">Overzicht Beoordeling</a>
      </nav>
      <div class="profile">
        <div class="avatar">C</div>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="router.push('/commissie/dashboard')">← Terug naar dashboard</button>
      <h1>Beoordeelde stages</h1>
      <p>Alle stages die de commissie heeft beoordeeld dit semester</p>
    </section>

    <section class="content">
      <div class="filter-bar">
        <input v-model="zoekterm" type="text" placeholder="🔍 Zoek op student of bedrijf..." class="zoek-input" />
        <div class="filter-btns">
          <button :class="['filter-btn', actieveFilter === 'alle' ? 'active-alle' : '']" @click="actieveFilter = 'alle'">Alle</button>
          <button :class="['filter-btn', actieveFilter === 'goedgekeurd' ? 'active-groen' : '']" @click="actieveFilter = 'goedgekeurd'">Goedgekeurd</button>
          <button :class="['filter-btn', actieveFilter === 'afgekeurd' ? 'active-rood' : '']" @click="actieveFilter = 'afgekeurd'">Afgekeurd</button>
          <button :class="['filter-btn', actieveFilter === 'aanpassen' ? 'active-oranje' : '']" @click="actieveFilter = 'aanpassen'">Aanpassingen</button>
        </div>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Bedrijf</th>
              <th>Mentor</th>
              <th>Periode</th>
              <th>Beslissing</th>
              <th>Indieningsdatum</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in gefilterd" :key="v.id">
              <td class="naam">{{ v.student_naam }}</td>
              <td>{{ v.bedrijfsnaam }}</td>
              <td>{{ v.mentor_naam || '—' }}</td>
              <td>{{ formatPeriode(v.startdatum, v.einddatum) }}</td>
              <td><span class="badge" :class="statusClass(v.status)">{{ statusLabel(v.status) }}</span></td>
              <td>{{ formatDatum(v.indieningsdatum) }}</td>
              <td><button class="bekijk-btn" @click="router.push(`/commissie/stagevoorstel/${v.id}`)">Bekijk →</button></td>
            </tr>
            <tr v-if="!loading && gefilterd.length === 0">
              <td colspan="7" class="leeg">Geen beoordeelde stages gevonden.</td>
            </tr>
            <tr v-if="loading">
              <td colspan="7" class="leeg">Laden...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.commissie-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-weight: 800; font-size: 13px; }

.page-header { margin: 40px 64px 24px; padding: 42px; border-radius: 24px; background: linear-gradient(135deg, #991b1b, #dc2626); color: white; box-shadow: 0 18px 40px rgba(153,27,27,0.22); }
.back-btn { border: none; background: transparent; color: white; font-weight: 600; cursor: pointer; opacity: 0.9; padding: 0; margin-bottom: 14px; display: block; }
.page-header h1 { font-size: 38px; margin: 0 0 8px; font-weight: 800; }
.page-header p { margin: 0; opacity: 0.9; font-size: 14px; }

.content { margin: 0 64px 40px; }

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.zoek-input { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px; font-size: 14px; width: 280px; outline: none; }
.zoek-input:focus { border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }
.filter-btns { display: flex; gap: 8px; }
.filter-btn { border: 1px solid #e2e8f0; background: white; color: #64748b; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.active-alle { background: #f1f5f9; border-color: #94a3b8; color: #334155; }
.active-groen { background: #dcfce7; border-color: #10b981; color: #047857; }
.active-rood { background: #fee2e2; border-color: #ef4444; color: #dc2626; }
.active-oranje { background: #fef3c7; border-color: #f59e0b; color: #b45309; }

.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 24px; }
td { padding: 18px 24px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.naam { font-weight: 700; color: #0f172a; }
.leeg { text-align: center; color: #94a3b8; padding: 40px; }

.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge-groen { background: #dcfce7; color: #047857; }
.badge-rood { background: #fee2e2; color: #dc2626; }
.badge-oranje { background: #fef3c7; color: #b45309; }

.bekijk-btn { border: 1px solid #e2e8f0; background: white; color: #991b1b; padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; transition: 0.2s; }
.bekijk-btn:hover { background: #991b1b; color: white; border-color: #991b1b; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .page-header, .content { margin-left: 20px; margin-right: 20px; }
  .filter-bar { flex-direction: column; align-items: flex-start; }
  table { display: block; overflow-x: auto; }
}
</style>