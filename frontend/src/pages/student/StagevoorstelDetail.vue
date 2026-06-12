<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function voornaam() { return data.value?.user?.voornaam || 'Student' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'S'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}

function formatDatum(datum, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', opts)
}

function goBack() {
  router.push('/student/dashboard')
}

const statusInfo = {
  in_behandeling: { label: 'Wacht op goedkeuring', sub: 'Nog aan het wachten voor goedkeuring', class: 'warning', icon: '⏳' },
  goedgekeurd: { label: 'Goedgekeurd', sub: 'Je voorstel is goedgekeurd', class: 'success', icon: '✅' },
  afgekeurd: { label: 'Afgekeurd', sub: 'Je voorstel is afgekeurd', class: 'danger', icon: '❌' },
  aanpassingen_vereist: { label: 'Aanpassingen vereist', sub: 'Bekijk de feedback en pas je voorstel aan', class: 'orange', icon: '🔧' }
}

function huidigeStatus() {
  return statusInfo[data.value?.stagevoorstel?.status] || statusInfo.in_behandeling
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
        <a class="active" @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>

    <div v-else>
      <section class="page-header">
        <button class="back-btn" @click="goBack">← Terug naar dashboard</button>
        <h1>Mijn stage</h1>
      </section>

      <section v-if="data?.stagevoorstel" class="status-banner" :class="huidigeStatus().class">
        <span class="banner-icon">{{ huidigeStatus().icon }}</span>
        <div>
          <strong>{{ huidigeStatus().label }}</strong>
          <p>{{ huidigeStatus().sub }}</p>
        </div>
      </section>

      <section v-if="data?.stagevoorstel" class="card">
        <h2>Stage informatie</h2>
        <div class="info-grid">
          <div>
            <span class="label">🏢 Bedrijf</span>
            <strong>{{ data.stagevoorstel.bedrijfsnaam }}</strong>
            <p v-if="data.stagevoorstel.sector" class="sub-text">{{ data.stagevoorstel.sector }}</p>
            <p v-if="data.stagevoorstel.bedrijf_adres" class="sub-text">{{ data.stagevoorstel.bedrijf_adres }}</p>
          </div>
          <div>
            <span class="label">📅 Periode</span>
            <strong>{{ formatDatum(data.stagevoorstel.startdatum) }} - {{ formatDatum(data.stagevoorstel.einddatum) }}</strong>
          </div>
          <div>
            <span class="label">👤 Mentor</span>
            <strong>{{ data.stagevoorstel.mentor_naam }}</strong>
            <p v-if="data.stagevoorstel.mentor_mail" class="sub-text">{{ data.stagevoorstel.mentor_mail }}</p>
          </div>
          <div v-if="data.stagevoorstel.docent_naam">
            <span class="label">🎓 Begeleidende docent</span>
            <strong>{{ data.stagevoorstel.docent_naam }}</strong>
          </div>
          <div class="full-width">
            <span class="label">📝 Opdrachtomschrijving</span>
            <p class="text">{{ data.stagevoorstel.opdrachtomschrijving }}</p>
          </div>
        </div>
      </section>

      <section v-else class="card empty-state">
        <p>Geen stagevoorstel gevonden.</p>
        <button class="primary-btn" @click="router.push('/student/stagevoorstel')">Stagevoorstel indienen</button>
      </section>
    </div>
  </main>
</template>

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
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }

.loading { text-align: center; padding: 60px; color: #64748b; }

.page-header { margin: 40px 64px 24px; }
.back-btn { border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 14px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }
.page-header h1 { margin: 0; font-size: 28px; font-weight: 800; }

.status-banner { margin: 0 64px 24px; border-radius: 18px; padding: 22px 28px; display: flex; gap: 16px; align-items: flex-start; }
.status-banner.warning { background: #fef9e7; border: 1px solid #fde68a; }
.status-banner.success { background: #ecfdf5; border: 1px solid #a7f3d0; }
.status-banner.danger { background: #fef2f2; border: 1px solid #fecaca; }
.status-banner.orange { background: #fff7ed; border: 1px solid #fed7aa; }
.banner-icon { font-size: 26px; }
.status-banner strong { display: block; margin-bottom: 4px; font-size: 15px; }
.status-banner.warning strong { color: #92400e; }
.status-banner.success strong { color: #065f46; }
.status-banner.danger strong { color: #991b1b; }
.status-banner.orange strong { color: #c2410c; }
.status-banner p { margin: 0; font-size: 13px; color: #57534e; }

.card { margin: 0 64px 24px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; padding: 28px; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.card h2 { margin: 0 0 20px; font-size: 17px; font-weight: 800; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.info-grid .label { display: block; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 6px; }
.info-grid strong { font-size: 15px; color: #0f172a; display: block; }
.info-grid .sub-text { margin: 4px 0 0; color: #64748b; font-size: 13px; }
.info-grid .full-width { grid-column: 1 / -1; }
.info-grid .text { margin: 0; color: #334155; line-height: 1.6; font-size: 14px; }

.empty-state { text-align: center; padding: 50px; }
.empty-state p { margin: 0 0 18px; color: #64748b; }
.primary-btn { border: none; background: #991b1b; color: white; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.primary-btn:hover { background: #7f1d1d; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .page-header, .card, .status-banner { margin-left: 20px; margin-right: 20px; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>