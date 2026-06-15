<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SignaturePad from '../../components/SignaturePad.vue'

const router = useRouter()
const data = ref(null)
const overeenkomst = ref(null)
const loading = ref(true)
const error = ref('')
const succes = ref('')
const opslaan = ref(false)
const handtekening = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [dashRes, overRes] = await Promise.all([
      fetch('http://localhost:3000/api/dashboards/student', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/stageovereenkomsten/mijn', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    data.value = await dashRes.json()
    const overData = await overRes.json()

    if (overData.overeenkomst) {
      overeenkomst.value = overData.overeenkomst
    } else {
      error.value = overData.error || 'Geen stageovereenkomst beschikbaar'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Verbindingsfout met server'
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
      error.value = 'Kon overeenkomst niet openen'
    })
}

function formatDatum(datum) {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

const studentHeeftGetekend = computed(() => !!overeenkomst.value?.student_handtekening)
const mentorHeeftGetekend = computed(() => !!overeenkomst.value?.mentor_handtekening)
const volledigGetekend = computed(() => overeenkomst.value?.status === 'volledig_getekend')

async function ondertekenen() {
  if (!handtekening.value) {
    error.value = 'Plaats eerst je handtekening.'
    return
  }
  error.value = ''
  opslaan.value = true
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/stageovereenkomsten/${overeenkomst.value.id}/tekenen-student`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ handtekening: handtekening.value })
    })
    const result = await res.json()
    if (!res.ok) {
      error.value = result.error || 'Kon handtekening niet opslaan'
      return
    }
    overeenkomst.value = result.overeenkomst
    succes.value = 'Stageovereenkomst ondertekend!'

    if (overeenkomst.value.status === 'volledig_getekend') {
      localStorage.setItem('overeenkomstGetekend', 'true')
    }
  } catch (err) {
    error.value = 'Verbindingsfout met server'
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
  <main class="page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a class="active" @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/student/dashboard')">← Terug naar mijn Dashboard</a>
      <h1>Stageovereenkomst</h1>
      <p class="subtitle">Bekijk en ondertekend je stageovereenkomst digitaal.</p>

      <div v-if="loading" class="loading">Laden...</div>
      <div v-else-if="error && !overeenkomst" class="error-msg">{{ error }}</div>

      <div v-else-if="overeenkomst">
        <button class="preview-btn" @click="bekijkOvereenkomst">📄 Bekijk volledige overeenkomst</button>

        <section class="document-card">
          <h2>Overeenkomstgegevens</h2>
          <div class="info-grid">
            <div>
              <span>Bedrijf</span>
              <strong>{{ overeenkomst.bedrijfsnaam }}</strong>
            </div>
            <div>
              <span>Adres</span>
              <strong>{{ overeenkomst.bedrijf_adres || '—' }}</strong>
            </div>
            <div>
              <span>Periode</span>
              <strong>{{ formatDatum(overeenkomst.startdatum) }} – {{ formatDatum(overeenkomst.einddatum) }}</strong>
            </div>
          </div>
          <div class="divider"></div>
          <div>
            <span>Opdrachtomschrijving</span>
            <p>{{ overeenkomst.opdrachtomschrijving }}</p>
          </div>
        </section>

        <section class="status-card">
          <h2>Ondertekeningsstatus</h2>
          <div class="status-row">
            <span class="status-label">Student</span>
            <span class="status-badge" :class="studentHeeftGetekend ? 'done' : 'pending'">
              {{ studentHeeftGetekend ? '✓ Getekend op ' + formatDatum(overeenkomst.student_getekend_op) : 'Nog niet getekend' }}
            </span>
          </div>
          <div class="status-row">
            <span class="status-label">Mentor</span>
            <span class="status-badge" :class="mentorHeeftGetekend ? 'done' : 'pending'">
              {{ mentorHeeftGetekend ? '✓ Getekend op ' + formatDatum(overeenkomst.mentor_getekend_op) : 'Nog niet getekend' }}
            </span>
          </div>

          <div v-if="volledigGetekend" class="volledig-banner">
            <div>
              ✅ Deze overeenkomst is volledig ondertekend. Je stage kan starten!
            </div>
            <a v-if="overeenkomst.pdf_url" :href="overeenkomst.pdf_url" target="_blank" class="pdf-btn">
              📄 Download PDF
            </a>
          </div>
        </section>

        <section v-if="!studentHeeftGetekend" class="sign-card">
          <h2>Jouw handtekening</h2>
          <p class="sign-hint">Teken hieronder om de stageovereenkomst te bevestigen.</p>
          <SignaturePad v-model="handtekening" />
          <div v-if="error" class="error-msg">{{ error }}</div>
          <div class="actions">
            <button class="submit-btn" :disabled="opslaan" @click="ondertekenen">
              <span v-if="opslaan">Opslaan...</span>
              <span v-else>✓ Ondertekenen</span>
            </button>
          </div>
        </section>

        <section v-else class="sign-card done-card">
          <h2>Jouw handtekening</h2>
          <img :src="overeenkomst.student_handtekening" alt="Handtekening student" class="signature-preview" />
          <div v-if="succes" class="succes-msg">{{ succes }}</div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.page { min-height: 100vh; background: #f8fafc; color: #111827; }

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

.content { max-width: 760px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.loading { text-align: center; padding: 60px; color: #64748b; }

.preview-btn { border: 1px solid #991b1b; background: white; color: #991b1b; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; margin-bottom: 20px; }
.preview-btn:hover { background: #991b1b; color: white; }

.document-card, .status-card, .sign-card { background: white; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(15,23,42,0.04); }
.document-card h2, .status-card h2, .sign-card h2 { margin: 0 0 18px; font-size: 17px; font-weight: 800; }

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.info-grid span, .document-card > div > span { display: block; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: 800; margin-bottom: 6px; }
.info-grid strong { font-size: 14px; }
.divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
.document-card p { margin: 0; color: #334155; line-height: 1.6; font-size: 14px; }

.status-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.status-row:last-of-type { border-bottom: none; }
.status-label { font-weight: 700; font-size: 14px; }
.status-badge { font-size: 13px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }
.status-badge.done { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.volledig-banner { margin-top: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 14px 18px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pdf-btn { background: #047857; color: white; padding: 8px 16px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; white-space: nowrap; }
.pdf-btn:hover { background: #065f46; }

.sign-hint { margin: 0 0 14px; color: #64748b; font-size: 13px; }
.signature-preview { max-width: 300px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; padding: 8px; }

.actions { margin-top: 16px; display: flex; justify-content: flex-end; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin: 16px 0; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-top: 14px; }

@media (max-width: 700px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 16px 40px; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>