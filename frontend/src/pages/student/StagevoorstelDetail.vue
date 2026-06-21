<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)
const voorstel = ref(null)
const loading = ref(true)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [dashRes, voorstelRes] = await Promise.all([
      fetch('http://10.2.160.246:3000/api/dashboards/student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://10.2.160.246:3000/api/stagevoorstellen/mijn', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    data.value = await dashRes.json()
    const voorstelData = await voorstelRes.json()
    voorstel.value = voorstelData.stagevoorstel
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function voornaam() { return data.value?.user?.voornaam || 'Student' }

function formatDatum(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <main class="student-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/student/dashboard')">← Terug naar dashboard</a>
      <h1>Mijn stage</h1>

      <div v-if="!loading && voorstel" class="status-banner" :class="'status-' + voorstel.status">
        <span v-if="voorstel.status === 'ingediend'">⏳ Wacht op goedkeuring</span>
        <span v-else-if="voorstel.status === 'goedgekeurd'">✅ Goedgekeurd</span>
        <span v-else-if="voorstel.status === 'afgekeurd'">❌ Afgekeurd</span>
        <span v-else-if="voorstel.status === 'aanpassen'">✏️ Aanpassingen vereist</span>
        <p v-if="voorstel.status === 'ingediend'">Nog aan het wachten voor goedkeuring</p>
      </div>

      <div v-if="!loading && voorstel" class="info-card">
        <h2>Stage informatie</h2>
        <div class="info-grid">
          <div class="info-block">
            <label>🏢 Bedrijf</label>
            <p class="main">{{ voorstel.bedrijfsnaam }}</p>
            <p class="sub">{{ voorstel.sector }}</p>
            <p class="sub">{{ voorstel.bedrijf_adres }}</p>
          </div>
          <div class="info-block">
            <label>📅 Periode</label>
            <p class="main">{{ formatDatum(voorstel.startdatum) }} - {{ formatDatum(voorstel.einddatum) }}</p>
          </div>
          <div class="info-block">
            <label>👤 Mentor</label>
            <p class="main">{{ voorstel.mentor_naam || '-' }}</p>
            <p class="sub">{{ voorstel.mentor_mail }}</p>
          </div>
          <div class="info-block">
            <label>🎓 Begeleidende docent</label>
            <p class="main">{{ voorstel.docent_naam || '-' }}</p>
          </div>
        </div>
        <div class="info-block full">
          <label>📝 Opdrachtomschrijving</label>
          <p class="main">{{ voorstel.opdrachtomschrijving }}</p>
        </div>
      </div>

      <div v-if="!loading && !voorstel" class="info-card">
        <p>Er is nog geen stagevoorstel ingediend.</p>
        <button class="submit-btn" @click="router.push('/student/stagevoorstel')">+ Stagevoorstel indienen</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.student-page { min-height: 100vh; background: #f8fafc; color: #111827; }
.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; }
nav a:hover { background: #fee2e2; color: #991b1b; }
.profile { font-size: 14px; font-weight: 600; color: #334155; }

.content { max-width: 900px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #991b1b; text-decoration: none; font-size: 14px; font-weight: 600; cursor: pointer; }
h1 { margin: 14px 0 22px; font-size: 26px; font-weight: 800; }

.status-banner { padding: 14px 20px; border-radius: 14px; font-weight: 700; margin-bottom: 22px; font-size: 14px; }
.status-banner p { margin: 4px 0 0; font-weight: 400; font-size: 13px; color: #57534e; }
.status-banner.status-ingediend { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.status-banner.status-goedgekeurd { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
.status-banner.status-afgekeurd { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.status-banner.status-aanpassen { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }

.info-card { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 28px; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.info-card h2 { margin: 0 0 20px; font-size: 16px; font-weight: 800; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-bottom: 22px; }
.info-block label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.info-block .main { margin: 0; font-size: 14px; font-weight: 700; color: #111827; }
.info-block .sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.info-block.full { border-top: 1px solid #f1f5f9; padding-top: 18px; }
.info-block.full .main { font-weight: 400; line-height: 1.6; color: #334155; }

.submit-btn { margin-top: 16px; border: none; background: #991b1b; color: white; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover { background: #7f1d1d; }

@media (max-width: 700px) {
  .topbar { padding: 0 20px; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>