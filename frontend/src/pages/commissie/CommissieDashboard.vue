<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/commissie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
  } catch (err) {
    console.error(err)
  }
})

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    console.log(err)
  }
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
}

function voornaam() { return data.value?.user?.voornaam || 'Commissie' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'C'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}
function openstaand() {
  return (data.value?.voorstellen || []).filter(v => v.status === 'ingediend')
}
function statusBadge(status) {
  if (status === 'ingediend') return 'orange'
  if (status === 'aanpassingen_vereist') return 'purple'
  return 'orange'
}
function statusLabel(status) {
  if (status === 'ingediend') return 'Wacht op beoordeling'
  if (status === 'aanpassingen_vereist') return 'Aanpassingen vereist'
  return status
}
function formatDatum(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <main class="docent-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a class="active">Dashboard</a>
        <a @click="$router.push('/commissie/stagevoorstel')">
        Aanvragen
        </a>
        <a>Overzicht Beoordeling</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="hero">
      <p class="label">Stagecommissie</p>
      <h1>Welkom terug, {{ voornaam() }}</h1>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Openstaande aanvragen</h2>
          <p>{{ openstaand().length }} aanvragen wachten op jouw beoordeling</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Bedrijf</th>
            <th>Adres</th>
            <th>Mentor</th>
            <th>Ingediend</th>
            <th>Status</th>
            <th>Actie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="voorstel in openstaand()" :key="voorstel.id">
            <td class="name">{{ voorstel.bedrijfsnaam }}</td>
            <td>{{ voorstel.bedrijf_adres }}</td>
            <td>{{ voorstel.mentor_naam }}</td>
            <td>{{ formatDatum(voorstel.indieningsdatum) }}</td>
            <td><span class="badge" :class="statusBadge(voorstel.status)">{{ statusLabel(voorstel.status) }}</span></td>
            <td><button class="icon-btn">Beoordeel</button></td>
          </tr>
          <tr v-if="!openstaand().length">
            <td colspan="6" style="padding: 28px; color: #64748b;">Geen openstaande aanvragen.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.docent-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.logout-btn:hover { background: #7f1d1d; }
.hero { margin: 40px 64px 28px; padding: 42px; border-radius: 24px; background: linear-gradient(135deg, #991b1b, #dc2626); color: white; box-shadow: 0 18px 40px rgba(153,27,27,0.22); }
.label { font-size: 13px; font-weight: 700; opacity: 0.9; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px; }
.hero h1 { font-size: 38px; margin: 0; font-weight: 800; }
.card { margin: 24px 64px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.card-header { padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
.card-header h2 { margin: 0; font-size: 18px; }
.card-header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
tbody tr { cursor: pointer; transition: 0.25s ease; }
tbody tr:hover { background: #fafafa; box-shadow: inset 5px 0 0 #991b1b; }
.name { font-weight: 700; color: #0f172a; }
.badge { padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.orange { background: #fef3c7; color: #b45309; }
.purple { background: #ede9fe; color: #6d28d9; }
.icon-btn { border: 1px solid #e2e8f0; background: white; color: #334155; padding: 9px 15px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.icon-btn:hover { background: #991b1b; color: white; border-color: #991b1b; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  .hero, .card { margin-left: 20px; margin-right: 20px; }
  table { display: block; overflow-x: auto; }
}
</style>