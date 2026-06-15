<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SignaturePad from '../../components/SignaturePad.vue'

const router = useRouter()
const route = useRoute()

const studentId = route.params.id
const loading = ref(true)
const error = ref('')

const student = ref(null)
const stage = ref(null)
const logboeken = ref([])
const mentor = ref(null)
const overeenkomst = ref(null)
const handtekening = ref('')
const opslaan = ref(false)
const overeenkomstError = ref('')
const overeenkomstSucces = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const resMe = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const meData = await resMe.json()
    mentor.value = meData.user

    const res = await fetch(`http://localhost:3000/api/dashboards/mentor/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Kon student niet ophalen'
      return
    }

    student.value = data.student
    stage.value = data.stage
    logboeken.value = data.logboeken

    const overRes = await fetch('http://localhost:3000/api/stageovereenkomsten/mentor', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const overData = await overRes.json()
    overeenkomst.value = overData.overeenkomsten?.find(o => o.student_id === studentId) || null
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  } finally {
    loading.value = false
  }
})

function initialen(voornaam, achternaam) {
  return `${voornaam?.[0] || ''}${achternaam?.[0] || ''}`
}

function formatDatum(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDatumKort(datum) {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function statusKlasse(status) {
  if (status === 'goedgekeurd') return 'badge green'
  if (status === 'ingediend') return 'badge blue'
  if (status === 'niet_ingevuld') return 'badge orange'
  if (status === 'concept') return 'badge orange'
  if (status === 'vrije_dag') return 'badge gray'
  return 'badge orange'
}

function statusLabel(status) {
  if (status === 'goedgekeurd') return 'Goedgekeurd'
  if (status === 'ingediend') return 'Ingediend'
  if (status === 'niet_ingevuld') return 'Niet ingevuld'
  if (status === 'concept') return 'Concept'
  if (status === 'vrije_dag') return 'Vrije dag'
  return status
}

function goToAftekenen(log) {
  router.push(`/mentor/week/${studentId}/${log.week_number}`)
}

const studentHeeftGetekend = computed(() => !!overeenkomst.value?.student_handtekening)
const mentorHeeftGetekend = computed(() => !!overeenkomst.value?.mentor_handtekening)
const volledigGetekend = computed(() => overeenkomst.value?.status === 'volledig_getekend')

function bekijkOvereenkomst() {
  const token = localStorage.getItem('token')
  fetch(`http://localhost:3000/api/stageovereenkomsten/${overeenkomst.value.id}/preview-pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    })
    .catch(() => {
      overeenkomstError.value = 'Kon overeenkomst niet openen'
    })
}

async function ondertekenen() {
  if (!handtekening.value) {
    overeenkomstError.value = 'Plaats eerst je handtekening.'
    return
  }
  overeenkomstError.value = ''
  opslaan.value = true
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/stageovereenkomsten/${overeenkomst.value.id}/tekenen-mentor`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ handtekening: handtekening.value })
    })
    const result = await res.json()
    if (!res.ok) {
      overeenkomstError.value = result.error || 'Kon handtekening niet opslaan'
      return
    }
    overeenkomst.value = result.overeenkomst
    overeenkomstSucces.value = 'Stageovereenkomst ondertekend!'

    if (overeenkomst.value.status === 'volledig_getekend') {
      const statusMap = JSON.parse(localStorage.getItem('overeenkomstenMentor') || '{}')
      statusMap[studentId] = true
      localStorage.setItem('overeenkomstenMentor', JSON.stringify(statusMap))
    }
  } catch (err) {
    overeenkomstError.value = 'Verbindingsfout met server'
  } finally {
    opslaan.value = false
  }
}

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
</script>

<template>
  <main class="mentor-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/mentor/dashboard')">Dashboard</a>
        <a class="active" @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen(mentor?.voornaam, mentor?.achternaam) }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else>
      <section class="page-header">
        <button class="back-btn" @click="router.push('/mentor/dashboard')">← Terug naar dashboard</button>
        <div class="title-row">
          <div class="student-info">
            <div class="student-avatar-large">{{ initialen(student?.voornaam, student?.achternaam) }}</div>
            <div>
              <h1>{{ student?.voornaam }} {{ student?.achternaam }}</h1>
              <p>{{ student?.email }}</p>
              <span class="badge green">Op schema</span>
            </div>
          </div>
          <button class="feedback-btn" @click="router.push(`/mentor/student/${studentId}/feedback`)">
            + Tussentijdse feedback
          </button>
        </div>
      </section>

      <section class="card" v-if="stage">
        <div class="card-header"><h2>Stage informatie</h2></div>
        <div class="stage-grid">
          <div class="stage-item">
            <span>Bedrijf</span>
            <strong>{{ stage.company_name || 'Onbekend' }}</strong>
          </div>
          <div class="stage-item">
            <span>Mentor</span>
            <strong>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</strong>
          </div>
          <div class="stage-item">
            <span>Periode</span>
            <strong>{{ stage.startdatum }} – {{ stage.einddatum }}</strong>
          </div>
          <div class="stage-item">
            <span>Status</span>
            <strong>{{ stage.status || 'Actief' }}</strong>
          </div>
        </div>
      </section>

      <section class="card" v-else>
        <div class="card-header">
          <h2>Stage informatie</h2>
          <p>Geen stage gevonden voor deze student.</p>
        </div>
      </section>

      <section class="card" v-if="overeenkomst">
        <div class="card-header">
          <h2>Stageovereenkomst</h2>
          <p>Ondertekening van de stageovereenkomst</p>
        </div>
        <div class="overeenkomst-body">
          <button class="preview-btn" @click="bekijkOvereenkomst">📄 Bekijk volledige overeenkomst</button>

          <div class="status-row">
            <span class="status-label">Student</span>
            <span class="badge" :class="studentHeeftGetekend ? 'green' : 'orange'">
              {{ studentHeeftGetekend ? '✓ Getekend op ' + formatDatumKort(overeenkomst.student_getekend_op) : 'Nog niet getekend' }}
            </span>
          </div>
          <div class="status-row">
            <span class="status-label">Mentor (jij)</span>
            <span class="badge" :class="mentorHeeftGetekend ? 'green' : 'orange'">
              {{ mentorHeeftGetekend ? '✓ Getekend op ' + formatDatumKort(overeenkomst.mentor_getekend_op) : 'Nog niet getekend' }}
            </span>
          </div>

          <div v-if="volledigGetekend" class="volledig-banner">
            <div>✅ Volledig ondertekend. Stage kan starten!</div>
            <a v-if="overeenkomst.pdf_url" :href="overeenkomst.pdf_url" target="_blank" class="pdf-btn">📄 Download PDF</a>
          </div>

          <div v-if="!mentorHeeftGetekend" class="sign-section">
            <h3>Jouw handtekening</h3>
            <p class="sign-hint">Teken hieronder om de stageovereenkomst te bevestigen.</p>
            <SignaturePad v-model="handtekening" />
            <div v-if="overeenkomstError" class="error-msg">{{ overeenkomstError }}</div>
            <div class="actions">
              <button class="primary-btn" :disabled="opslaan" @click="ondertekenen">
                <span v-if="opslaan">Opslaan...</span>
                <span v-else>✓ Ondertekenen</span>
              </button>
            </div>
          </div>

          <div v-else class="sign-section">
            <h3>Jouw handtekening</h3>
            <img :src="overeenkomst.mentor_handtekening" alt="Handtekening mentor" class="signature-preview" />
            <div v-if="overeenkomstSucces" class="succes-msg">{{ overeenkomstSucces }}</div>
          </div>
        </div>
      </section>

      <section class="card" v-else>
        <div class="card-header">
          <h2>Stageovereenkomst</h2>
          <p>Nog geen stageovereenkomst beschikbaar voor deze student.</p>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <div>
            <h2>Recente logboeken</h2>
            <p>Laatste activiteit van {{ student?.voornaam }}</p>
          </div>
        </div>
        <div v-if="logboeken.length === 0" class="leeg">Geen logboeken gevonden.</div>
        <table v-else>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Week</th>
              <th>Taken</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logboeken" :key="log.id">
              <td>{{ formatDatum(log.datum) }}</td>
              <td>Week {{ log.week_number }}</td>
              <td class="taken">{{ log.tasks || 'Niet ingevuld' }}</td>
              <td><span :class="statusKlasse(log.status)">{{ statusLabel(log.status) }}</span></td>
              <td>
                <button v-if="log.status === 'ingediend'" class="icon-btn" @click="goToAftekenen(log)">Aftekenen</button>
                <span v-else class="geen-actie">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.mentor-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
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
.loading { text-align: center; padding: 60px; color: #64748b; }
.error-msg { text-align: center; padding: 60px; color: #991b1b; }
.leeg { padding: 28px; color: #64748b; font-size: 14px; }
.page-header { padding: 30px 64px 20px; }
.back-btn { border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 20px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }
.title-row { display: flex; justify-content: space-between; align-items: center; }
.student-info { display: flex; align-items: center; gap: 20px; }
.student-avatar-large { width: 72px; height: 72px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 22px; }
.student-info h1 { margin: 0; font-size: 28px; font-weight: 800; }
.student-info p { margin: 4px 0 8px; color: #64748b; font-size: 14px; }
.feedback-btn { border: none; background: #15803d; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.feedback-btn:hover { background: #166534; }
.card { margin: 24px 64px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.card-header { padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
.card-header h2 { margin: 0; font-size: 18px; }
.card-header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
.stage-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; padding: 24px 28px; }
.stage-item span { display: block; color: #64748b; font-size: 13px; margin-bottom: 6px; }
.stage-item strong { font-size: 15px; color: #0f172a; }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.taken { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.badge { padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.green { background: #dcfce7; color: #15803d; }
.blue { background: #dbeafe; color: #1d4ed8; }
.orange { background: #fef3c7; color: #b45309; }
.gray { background: #f1f5f9; color: #64748b; }
.icon-btn { border: 1px solid #991b1b; background: white; color: #991b1b; padding: 7px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 13px; }
.icon-btn:hover { background: #991b1b; color: white; }
.geen-actie { color: #94a3b8; }
.overeenkomst-body { padding: 24px 28px; }
.preview-btn { border: 1px solid #991b1b; background: white; color: #991b1b; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; margin-bottom: 16px; }
.preview-btn:hover { background: #991b1b; color: white; }
.status-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.status-row:last-of-type { border-bottom: none; }
.status-label { font-weight: 700; font-size: 14px; }
.volledig-banner { margin-top: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 14px 18px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pdf-btn { background: #047857; color: white; padding: 8px 16px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; white-space: nowrap; }
.pdf-btn:hover { background: #065f46; }
.sign-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
.sign-section h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; }
.sign-hint { margin: 0 0 14px; color: #64748b; font-size: 13px; }
.signature-preview { max-width: 300px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; padding: 8px; }
.actions { margin-top: 16px; display: flex; justify-content: flex-end; }
.primary-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.primary-btn:hover:not(:disabled) { background: #166534; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-top: 14px; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .page-header, .card { margin-left: 20px; margin-right: 20px; }
  .stage-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .title-row { flex-direction: column; align-items: flex-start; gap: 14px; }
  table { display: block; overflow-x: auto; }
}
</style>