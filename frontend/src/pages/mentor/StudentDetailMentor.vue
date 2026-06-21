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
    const resMe = await fetch('http://10.2.160.246:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const meData = await resMe.json()
    mentor.value = meData.user

    const res = await fetch(`http://10.2.160.246:3000/api/dashboards/mentor/student/${studentId}`, {
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

    const overRes = await fetch('http://10.2.160.246:3000/api/stageovereenkomsten/mentor', {
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

function formatDatumKort(datum) {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function goToAftekenen(weekNummer) {
  router.push(`/mentor/week/${studentId}/${weekNummer}`)
}

const studentHeeftGetekend = computed(() => !!overeenkomst.value?.student_handtekening)
const mentorHeeftGetekend = computed(() => !!overeenkomst.value?.mentor_handtekening)
const volledigGetekend = computed(() => overeenkomst.value?.status === 'volledig_getekend')

// Bepaal status per week — INCLUSIEF afgekeurd, anders verdwijnt die status in de mist
const logboekenPerWeek = computed(() => {
  const weken = {}
  logboeken.value.forEach(log => {
    const week = log.week_number
    if (!weken[week]) {
      weken[week] = { week, logs: [], status: 'niet_ingevuld' }
    }
    weken[week].logs.push(log)
  })

  Object.values(weken).forEach(w => {
    const statussen = w.logs.map(l => l.status)
    if (statussen.some(s => s === 'afgekeurd')) {
      w.status = 'afgekeurd'
    } else if (statussen.every(s => s === 'goedgekeurd')) {
      w.status = 'goedgekeurd'
    } else if (statussen.some(s => s === 'ingediend')) {
      w.status = 'ingediend'
    } else if (statussen.some(s => s === 'concept')) {
      w.status = 'concept'
    } else {
      w.status = 'niet_ingevuld'
    }
  })

  return Object.values(weken).sort((a, b) => b.week - a.week)
})

// Weken-tellers ipv dagen-tellers
const wekenTotaal = computed(() => logboekenPerWeek.value.length)
const wekenIngevuld = computed(() =>
  logboekenPerWeek.value.filter(w => w.status !== 'niet_ingevuld').length
)
const wekenAfgetekend = computed(() =>
  logboekenPerWeek.value.filter(w => w.status === 'goedgekeurd' || w.status === 'afgekeurd').length
)

function weekStatusLabel(status) {
  if (status === 'goedgekeurd') return 'Goedgekeurd'
  if (status === 'afgekeurd') return 'Afgekeurd'
  if (status === 'ingediend') return 'Ingediend'
  if (status === 'concept') return 'Concept'
  return 'Niet ingevuld'
}

function weekStatusKlasse(status) {
  if (status === 'goedgekeurd') return 'badge green'
  if (status === 'afgekeurd') return 'badge red'
  if (status === 'ingediend') return 'badge blue'
  if (status === 'concept') return 'badge orange'
  return 'badge gray'
}

function bekijkOvereenkomst() {
  const token = localStorage.getItem('token')
  fetch(`http://10.2.160.246:3000/api/stageovereenkomsten/${overeenkomst.value.id}/preview-pdf`, {
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
    const res = await fetch(`http://10.2.160.246:3000/api/stageovereenkomsten/${overeenkomst.value.id}/tekenen-mentor`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    await fetch('http://10.2.160.246:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) { console.log(err) }
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
    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <div v-else class="page-body">
      <div class="page-header">
        <a class="back-link" @click="router.push('/mentor/dashboard')">← Terug naar dashboard</a>
        <h1>Studentdossier</h1>
        <p class="subtitle">{{ student?.voornaam }} {{ student?.achternaam }} • {{ stage?.company_name || 'Onbekend' }}</p>
      </div>

      <!-- Student info card -->
      <div class="student-card">
        <div class="student-left">
          <div class="student-avatar">{{ initialen(student?.voornaam, student?.achternaam) }}</div>
          <div class="student-details">
            <h2>{{ student?.voornaam }} {{ student?.achternaam }}</h2>
            <p>{{ student?.email }} • Toegepaste Informatica • 3e jaar</p>
            <span class="badge green">● Op schema</span>
          </div>
        </div>
      </div>

      <!-- Stage info + Voortgang -->
      <div class="info-voortgang-grid">
        <div class="stage-card">
          <h3>Stage informatie</h3>
          <div class="stage-grid">
            <div class="stage-item">
              <span>Bedrijf</span>
              <strong>{{ stage?.company_name || 'Onbekend' }}</strong>
            </div>
            <div class="stage-item">
              <span>Mentor</span>
              <strong>{{ mentor?.voornaam }} {{ mentor?.achternaam }} (jij)</strong>
            </div>
            <div class="stage-item">
              <span>Periode</span>
              <strong>{{ stage?.startdatum }} – {{ stage?.einddatum }}</strong>
            </div>
            <div class="stage-item">
              <span>Locatie</span>
              <strong>{{ stage?.locatie || 'Onbekend' }}</strong>
            </div>
          </div>
        </div>

        <div class="voortgang-card">
          <h3>Voortgang</h3>
          <div class="voortgang-rij">
            <span>Logboeken ingevuld</span>
            <strong>{{ wekenIngevuld }} / {{ wekenTotaal }} weken</strong>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: wekenTotaal ? (wekenIngevuld / wekenTotaal * 100) + '%' : '0%' }"></div>
          </div>
          <div class="voortgang-rij">
            <span>Afgetekend door mentor</span>
            <strong>{{ wekenAfgetekend }} / {{ wekenIngevuld }} weken</strong>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: wekenIngevuld ? (wekenAfgetekend / wekenIngevuld * 100) + '%' : '0%' }"></div>
          </div>
          <div class="voortgang-status-rij">
            <span>Stageovereenkomst</span>
            <strong :class="volledigGetekend ? 'text-green' : 'text-orange'">
              {{ volledigGetekend ? '✓ Ondertekend' : 'In afwachting' }}
            </strong>
          </div>
          <div class="voortgang-status-rij">
            <span>Evaluatie mentor</span>
            <strong class="text-orange">In afwachting</strong>
          </div>
        </div>
      </div>

      <!-- Actieknoppen -->
      <div class="actie-knoppen">
        <button class="actie-btn blauw" @click="goToAftekenen(logboekenPerWeek.find(w => w.status === 'ingediend')?.week || logboekenPerWeek[0]?.week)">
          📋 Logboeken aftekenen
        </button>
        <button class="actie-btn grijs" @click="router.push(`/mentor/student/${studentId}/feedback`)">
          💬 Tussentijdse feedback
        </button>
        <button class="actie-btn grijs" @click="router.push(`/mentor/student/${studentId}/feedback`)">
          📝 Evaluatie invullen
        </button>
      </div>

      <!-- Stageovereenkomst -->
      <div class="card" v-if="overeenkomst">
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
            <div class="sign-actions">
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
      </div>

      <div class="card" v-else>
        <div class="card-header">
          <h2>Stageovereenkomst</h2>
          <p>Nog geen stageovereenkomst beschikbaar voor deze student.</p>
        </div>
      </div>

      <!-- Recente logboeken per week -->
      <div class="card">
        <div class="card-header">
          <h2>Recente logboeken</h2>
          <p>Overzicht per week van {{ student?.voornaam }}</p>
        </div>
        <div v-if="logboekenPerWeek.length === 0" class="leeg">Geen logboeken gevonden.</div>
        <table v-else>
          <thead>
            <tr>
              <th>Week</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="weekGroep in logboekenPerWeek" :key="weekGroep.week">
              <td><strong>Week {{ weekGroep.week }}</strong></td>
              <td><span :class="weekStatusKlasse(weekGroep.status)">{{ weekStatusLabel(weekGroep.status) }}</span></td>
              <td>
                <button
                  v-if="weekGroep.status === 'ingediend'"
                  class="icon-btn"
                  @click="goToAftekenen(weekGroep.week)"
                >Aftekenen</button>
                <button
                  v-else
                  class="bekijk-btn"
                  @click="goToAftekenen(weekGroep.week)"
                >Bekijk →</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.mentor-page { min-height: 100vh; background: #f1f5f9; color: #111827; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.error-banner { text-align: center; padding: 40px; color: #991b1b; background: #fef2f2; margin: 24px 64px; border-radius: 12px; }

.page-body { padding: 32px 64px 60px; max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 12px; }
.back-link:hover { color: #991b1b; }
.page-header h1 { margin: 0 0 4px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

.student-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.student-left { display: flex; align-items: center; gap: 18px; }
.student-avatar { width: 56px; height: 56px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 18px; flex-shrink: 0; }
.student-details h2 { margin: 0 0 4px; font-size: 20px; font-weight: 800; }
.student-details p { margin: 0 0 8px; color: #64748b; font-size: 14px; }

.info-voortgang-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 20px; }
.stage-card, .voortgang-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.stage-card h3, .voortgang-card h3 { margin: 0 0 18px; font-size: 16px; font-weight: 800; }
.stage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.stage-item span { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.stage-item strong { font-size: 14px; color: #0f172a; }

.voortgang-rij { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #475569; }
.voortgang-rij strong { font-weight: 700; color: #0f172a; }
.progress-bar { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 16px; }
.progress-fill { height: 100%; background: #15803d; border-radius: 999px; transition: width 0.3s; }
.voortgang-status-rij { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
.text-green { color: #15803d; font-weight: 700; }
.text-orange { color: #b45309; font-weight: 700; }

.actie-knoppen { display: flex; gap: 12px; margin-bottom: 20px; }
.actie-btn { padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; border: none; }
.actie-btn.blauw { background: #1d4ed8; color: white; }
.actie-btn.blauw:hover { background: #1e40af; }
.actie-btn.grijs { background: white; color: #334155; border: 1px solid #e5e7eb; }
.actie-btn.grijs:hover { background: #f8fafc; }

.card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 8px rgba(15,23,42,0.04); margin-bottom: 20px; }
.card-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.card-header h2 { margin: 0; font-size: 16px; font-weight: 800; }
.card-header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }

.overeenkomst-body { padding: 20px 24px; }
.preview-btn { border: 1px solid #991b1b; background: white; color: #991b1b; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; margin-bottom: 16px; }
.preview-btn:hover { background: #991b1b; color: white; }
.status-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.status-label { font-weight: 700; font-size: 14px; }
.badge { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.green { background: #dcfce7; color: #15803d; }
.blue { background: #dbeafe; color: #1d4ed8; }
.orange { background: #fef3c7; color: #b45309; }
.red { background: #fee2e2; color: #991b1b; }
.gray { background: #f1f5f9; color: #64748b; }
.volledig-banner { margin-top: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 14px 18px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pdf-btn { background: #047857; color: white; padding: 8px 16px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; }
.pdf-btn:hover { background: #065f46; }
.sign-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
.sign-section h3 { margin: 0 0 6px; font-size: 15px; font-weight: 800; }
.sign-hint { margin: 0 0 14px; color: #64748b; font-size: 13px; }
.signature-preview { max-width: 300px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; padding: 8px; }
.sign-actions { margin-top: 16px; display: flex; justify-content: flex-end; }
.primary-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.primary-btn:hover:not(:disabled) { background: #166534; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-top: 14px; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-top: 14px; }

table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 14px 24px; }
td { padding: 16px 24px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.icon-btn { border: 1px solid #991b1b; background: white; color: #991b1b; padding: 7px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 13px; }
.icon-btn:hover { background: #991b1b; color: white; }
.bekijk-btn { border: none; background: transparent; color: #1d4ed8; font-weight: 700; cursor: pointer; font-size: 14px; padding: 0; }
.bekijk-btn:hover { text-decoration: underline; }
.leeg { padding: 28px 24px; color: #64748b; font-size: 14px; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-body { padding: 24px 20px; }
  .info-voortgang-grid { grid-template-columns: 1fr; }
  .actie-knoppen { flex-direction: column; }
  table { display: block; overflow-x: auto; }
}
</style>