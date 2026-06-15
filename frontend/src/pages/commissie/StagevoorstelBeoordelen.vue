<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const voorstelId = route.params.id
const voorstel = ref(null)
const loading = ref(true)
const error = ref('')
const succes = ref('')
const feedbackAanpassen = ref('')
const feedbackPositief = ref('')
const toonFeedbackForm = ref(false)
const toonMentorForm = ref(false)
const mentorNaam = ref('')
const mentorMail = ref('')
const mentorCredentials = ref(null)
const docenten = ref([])
const geselecteerdeDocent = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [voorstelRes, docentenRes] = await Promise.all([
      fetch('http://localhost:3000/api/stagevoorstellen/commissie', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/stagevoorstellen/docenten', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    const data = await voorstelRes.json()
    const docentenData = await docentenRes.json()
    voorstel.value = data.stagevoorstellen?.find(v => v.id == voorstelId) || null
    docenten.value = docentenData.docenten || []
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  } finally {
    loading.value = false
  }
})

function initialen(naam) {
  if (!naam) return '?'
  return naam.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDatum(datum) {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function statusLabel(status) {
  if (status === 'ingediend') return '● Wacht op beoordeling'
  if (status === 'goedgekeurd') return '✓ Goedgekeurd'
  if (status === 'afgekeurd') return '✗ Afgekeurd'
  if (status === 'aanpassen') return '✎ Aanpassingen vereist'
  return status
}

function statusClass(status) {
  if (status === 'ingediend') return 'orange'
  if (status === 'goedgekeurd') return 'green'
  if (status === 'afgekeurd') return 'red'
  if (status === 'aanpassen') return 'purple'
  return ''
}

async function beoordeel(status) {
  if (status === 'aanpassen' && !feedbackAanpassen.value) {
    error.value = 'Vul feedback in voor de student'
    return
  }
  if (status === 'goedgekeurd' && (!mentorNaam.value || !mentorMail.value)) {
    error.value = 'Vul mentor naam en email in'
    return
  }
  if (status === 'goedgekeurd' && !geselecteerdeDocent.value) {
    error.value = 'Selecteer een begeleidende docent'
    return
  }
  error.value = ''
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/stagevoorstellen/${voorstelId}/beoordelen`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status,
        feedback_aanpassen: feedbackAanpassen.value || null,
        feedback_positief: feedbackPositief.value || null,
        mentor_naam: mentorNaam.value || null,
        mentor_mail: mentorMail.value || null,
        docent_id: geselecteerdeDocent.value || null
      })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Kon niet beoordelen'
      return
    }
    if (data.mentorCredentials) {
      mentorCredentials.value = data.mentorCredentials
      succes.value = 'Stagevoorstel goedgekeurd! Mentor account aangemaakt.'
    } else {
      succes.value = status === 'afgekeurd' ? 'Stagevoorstel afgekeurd.' : 'Aanpassingen gevraagd.'
      setTimeout(() => router.push('/commissie/dashboard'), 1500)
    }
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  }
}

function goBack() {
  router.push('/commissie/dashboard')
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
        <a class="active" @click="router.push('/commissie/aanvragen')">Aanvragen</a>
        <a @click="router.push('/commissie/overzicht')">Overzicht Beoordeling</a>
      </nav>
      <div class="profile">
        <div class="avatar">C</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>
    <div v-else-if="!voorstel" class="loading">Voorstel niet gevonden.</div>

    <div v-else>
      <section class="page-header">
        <button class="back-btn" @click="goBack">← Terug naar dashboard</button>
        <h1>Stagevoorstel {{ voorstel.status === 'ingediend' ? 'beoordelen' : 'details' }}</h1>
        <p>Ingediend door {{ voorstel.student_naam }} op {{ formatDatum(voorstel.indieningsdatum) }}</p>
        <span class="badge" :class="statusClass(voorstel.status)">{{ statusLabel(voorstel.status) }}</span>
      </section>

      <section class="grid">
        <article class="card">
          <h2>Studentgegevens</h2>
          <div class="student-box">
            <div class="avatar big">{{ initialen(voorstel.student_naam) }}</div>
            <div>
              <h3>{{ voorstel.student_naam }}</h3>
              <p>Toegepaste Informatica</p>
            </div>
          </div>
        </article>

        <article class="card">
          <h2>Bedrijfsinformatie</h2>
          <div class="info-grid">
            <div>
              <span>Bedrijf</span>
              <strong>{{ voorstel.bedrijfsnaam }}</strong>
            </div>
            <div>
              <span>Adres</span>
              <strong>{{ voorstel.bedrijf_adres || '—' }}</strong>
            </div>
            <div>
              <span>Sector</span>
              <strong>{{ voorstel.sector || '—' }}</strong>
            </div>
          </div>
        </article>
      </section>

      <section class="card wide">
        <h2>Stagedetails</h2>
        <div class="info-grid three">
          <div>
            <span>Startdatum</span>
            <strong>{{ formatDatum(voorstel.startdatum) }}</strong>
          </div>
          <div>
            <span>Einddatum</span>
            <strong>{{ formatDatum(voorstel.einddatum) }}</strong>
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <span>Omschrijving opdracht</span>
          <p>{{ voorstel.opdrachtomschrijving }}</p>
        </div>
      </section>

      <!-- Mentor credentials net na goedkeuring -->
      <section v-if="mentorCredentials" class="card wide credentials-card">
        <h2>✅ Stagevoorstel goedgekeurd!</h2>
        <p>Stuur deze gegevens naar de mentor zodat die kan inloggen:</p>
        <div class="credentials-box">
          <div class="cred-row">
            <span>Email</span>
            <strong>{{ mentorCredentials.email }}</strong>
          </div>
          <div class="cred-row">
            <span>Wachtwoord</span>
            <strong>{{ mentorCredentials.wachtwoord }}</strong>
          </div>
        </div>
        <button class="primary-btn" @click="router.push('/commissie/dashboard')">Terug naar dashboard</button>
      </section>

      <!-- Readonly weergave als al beoordeeld -->
      <section v-else-if="voorstel.status !== 'ingediend'" class="card wide">
        <h2>Beoordeling</h2>
        <div class="info-grid">
          <div v-if="voorstel.mentor_naam">
            <span>Naam mentor</span>
            <strong>{{ voorstel.mentor_naam }}</strong>
          </div>
          <div v-if="voorstel.mentor_mail">
            <span>Email mentor</span>
            <strong>{{ voorstel.mentor_mail }}</strong>
          </div>
        </div>
        <div v-if="voorstel.feedback_aanpassen" style="margin-top: 20px;">
          <span>Feedback - aanpassingen vereist</span>
          <p>{{ voorstel.feedback_aanpassen }}</p>
        </div>
        <div v-if="voorstel.feedback_positief" style="margin-top: 16px;">
          <span>Positieve punten</span>
          <p>{{ voorstel.feedback_positief }}</p>
        </div>
        <p class="readonly-note">Dit voorstel is al beoordeeld en kan niet meer worden aangepast.</p>
      </section>

      <!-- Beslissingsformulier alleen als status = ingediend -->
      <section v-else class="card wide">
        <h2>Beslissing</h2>

        <div v-if="toonMentorForm" class="feedback-form">
          <h3 style="margin: 0 0 16px; font-size: 15px;">Mentor & docent gegevens invullen</h3>
          <label>Naam mentor (verplicht)</label>
          <input v-model="mentorNaam" type="text" placeholder="bv. Jan Janssens" />
          <label>Email mentor (verplicht)</label>
          <input v-model="mentorMail" type="email" placeholder="bv. jan@bedrijf.be" />
          <label>Begeleidende docent (verplicht)</label>
          <select v-model="geselecteerdeDocent">
            <option value="" disabled>Selecteer een docent</option>
            <option v-for="docent in docenten" :key="docent.id" :value="docent.id">
              {{ docent.voornaam }} {{ docent.achternaam }} ({{ docent.email }})
            </option>
          </select>
          <div class="feedback-actions">
            <button class="cancel-btn" @click="toonMentorForm = false">Annuleren</button>
            <button class="approve" style="padding: 10px 20px;" @click="beoordeel('goedgekeurd')">✓ Goedkeuren & account aanmaken</button>
          </div>
        </div>

        <div v-else-if="toonFeedbackForm" class="feedback-form">
          <label>Feedback voor de student (verplicht)</label>
          <textarea v-model="feedbackAanpassen" placeholder="Beschrijf welke aanpassingen nodig zijn..."></textarea>
          <label>Positieve punten (optioneel)</label>
          <textarea v-model="feedbackPositief" placeholder="Wat was al goed..."></textarea>
          <div class="feedback-actions">
            <button class="cancel-btn" @click="toonFeedbackForm = false">Annuleren</button>
            <button class="changes" @click="beoordeel('aanpassen')">✎ Aanpassingen sturen</button>
          </div>
        </div>

        <div v-else class="decision-grid">
          <button class="approve" @click="toonMentorForm = true">✓ Goedkeuren</button>
          <button class="changes" @click="toonFeedbackForm = true">✎ Aanpassingen vereist</button>
          <button class="reject" @click="beoordeel('afgekeurd')">× Afkeuren</button>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="succes && !mentorCredentials" class="succes-msg">{{ succes }}</div>
      </section>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.commissie-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-weight: 800; font-size: 13px; }
.big { width: 58px; height: 58px; background: #dbeafe; color: #2563eb; font-size: 18px; }
.loading { padding: 60px; text-align: center; color: #64748b; }
.page-header { margin: 40px 64px 28px; padding: 42px; border-radius: 24px; background: linear-gradient(135deg, #991b1b, #dc2626); color: white; box-shadow: 0 18px 40px rgba(153,27,27,0.22); }
.back-btn { border: none; background: transparent; color: white; font-weight: 600; cursor: pointer; opacity: 0.9; padding: 0; }
h1 { font-size: 38px; margin: 18px 0 8px; font-weight: 800; }
.page-header p { margin: 0 0 14px; opacity: 0.9; }
.badge { display: inline-block; padding: 7px 13px; border-radius: 999px; font-weight: 700; font-size: 12px; }
.orange { background: #fef3c7; color: #b45309; }
.green { background: #dcfce7; color: #047857; }
.red { background: #fee2e2; color: #dc2626; }
.purple { background: #ede9fe; color: #6d28d9; }
.grid { margin: 24px 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.card { background: white; border-radius: 22px; padding: 28px; border: 1px solid #e5e7eb; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.wide { margin: 0 64px 24px; }
.student-box { display: flex; align-items: center; gap: 20px; }
.student-box h3 { margin: 0 0 4px; }
.student-box p { margin: 0; color: #64748b; font-size: 13px; }
.info-grid { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.three { grid-template-columns: repeat(3, 1fr); }
span { display: block; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: 800; }
strong { display: block; margin-top: 6px; }
.divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
.decision-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.decision-grid button { padding: 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s ease; font-size: 15px; }
.approve { background: #dcfce7; border: 2px solid #10b981; color: #047857; }
.approve:hover { background: #10b981; color: white; }
.changes { background: #fef3c7; border: 2px solid #f59e0b; color: #b45309; }
.changes:hover { background: #f59e0b; color: white; }
.reject { background: #fee2e2; border: 2px solid #ef4444; color: #dc2626; }
.reject:hover { background: #ef4444; color: white; }
.feedback-form { display: flex; flex-direction: column; gap: 12px; }
.feedback-form label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
.feedback-form textarea, .feedback-form input, .feedback-form select { border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; }
.feedback-form textarea { min-height: 80px; resize: vertical; }
.feedback-form textarea:focus, .feedback-form input:focus, .feedback-form select:focus { outline: none; border-color: #991b1b; }
.feedback-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.error-msg { margin-top: 16px; color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; font-weight: 600; }
.succes-msg { margin-top: 16px; color: #15803d; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; font-weight: 700; }
.credentials-card { border: 2px solid #10b981; }
.credentials-card h2 { color: #047857; margin: 0 0 8px; }
.credentials-card p { margin: 0 0 20px; color: #64748b; font-size: 14px; }
.credentials-box { background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 14px; padding: 20px; margin-bottom: 20px; }
.cred-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #d1fae5; }
.cred-row:last-child { border-bottom: none; }
.cred-row span { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.cred-row strong { font-size: 15px; color: #065f46; font-family: monospace; }
.primary-btn { border: none; background: #991b1b; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.primary-btn:hover { background: #7f1d1d; }
.readonly-note { margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; font-style: italic; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .page-header, .grid, .wide { margin-left: 20px; margin-right: 20px; }
  .grid, .decision-grid, .three { grid-template-columns: 1fr; }
}
</style>