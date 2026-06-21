<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const voorstellen = ref([])
const loading = ref(true)
const zoekterm = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://10.2.160.246:3000/api/stagevoorstellen/commissie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    voorstellen.value = data.stagevoorstellen || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const gefilterd = computed(() => {
  return voorstellen.value.filter(v => {
    const matchZoek = !zoekterm.value ||
      v.student_naam?.toLowerCase().includes(zoekterm.value.toLowerCase()) ||
      v.bedrijfsnaam?.toLowerCase().includes(zoekterm.value.toLowerCase())
    return matchZoek
  })
})

const wachtend = computed(() => gefilterd.value.filter(v => v.status === 'ingediend' || v.status === 'aanpassen'))

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
  if (status === 'ingediend') return 'Wacht op beoordeling'
  if (status === 'aanpassen') return 'Aanpassingen vereist'
  return status
}

function statusClass(status) {
  if (status === 'ingediend') return 'badge-oranje'
  if (status === 'aanpassen') return 'badge-paars'
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
        <a class="active">Aanvragen</a>
        <a @click="router.push('/commissie/overzicht')">Overzicht Beoordeling</a>
      </nav>
      <div class="profile">
        <div class="avatar">C</div>
      </div>
    </header>

    <section class="content">
      <h1>Aanvragen</h1>
      <p class="sub">Alle stagevoorstellen die wachten op beoordeling</p>

      <div class="filter-bar">
        <input v-model="zoekterm" type="text" placeholder="🔍 Zoek op naam of bedrijf..." class="zoek-input" />
      </div>

      <div class="table-card">
        <div class="table-header">
          <h2>Wachten op beoordeling ({{ wachtend.length }})</h2>
          <p>{{ wachtend.length }} aanvragen wachten op jouw beoordeling</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Bedrijf</th>
              <th>Periode</th>
              <th>Ingediend</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in wachtend" :key="v.id">
              <td class="naam">{{ v.student_naam }}</td>
              <td>{{ v.bedrijfsnaam }}</td>
              <td>{{ formatPeriode(v.startdatum, v.einddatum) }}</td>
              <td>{{ formatDatum(v.indieningsdatum) }}</td>
              <td><span class="badge" :class="statusClass(v.status)">{{ statusLabel(v.status) }}</span></td>
              <td><button class="beoordeel-btn" @click="router.push(`/commissie/stagevoorstel/${v.id}`)">Beoordeel →</button></td>
            </tr>
            <tr v-if="!loading && wachtend.length === 0">
              <td colspan="6" class="leeg">Geen aanvragen gevonden.</td>
            </tr>
            <tr v-if="loading">
              <td colspan="6" class="leeg">Laden...</td>
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

.content { max-width: 1100px; margin: 0 auto; padding: 40px 24px 60px; }
.content h1 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }
.sub { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.filter-bar { margin-bottom: 20px; }
.zoek-input { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px; font-size: 14px; width: 300px; outline: none; }
.zoek-input:focus { border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }

.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.table-header { padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
.table-header h2 { margin: 0 0 4px; font-size: 16px; font-weight: 800; }
.table-header p { margin: 0; color: #64748b; font-size: 13px; }

table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 18px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
tbody tr:hover { background: #fafafa; box-shadow: inset 5px 0 0 #991b1b; }
.naam { font-weight: 700; color: #0f172a; }
.leeg { text-align: center; color: #94a3b8; padding: 40px; }

.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge-oranje { background: #fef3c7; color: #b45309; }
.badge-paars { background: #ede9fe; color: #6d28d9; }

.beoordeel-btn { border: none; background: transparent; color: #991b1b; font-weight: 700; cursor: pointer; font-size: 13px; }
.beoordeel-btn:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .content { padding: 24px 16px; }
  table { display: block; overflow-x: auto; }
}
</style>