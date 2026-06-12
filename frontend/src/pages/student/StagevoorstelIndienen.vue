<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
 
const router = useRouter()
 
const form = ref({
  bedrijfsnaam: '',
  sector: '',
  bedrijf_adres: '',
  docent_naam: '',
  opdrachtomschrijving: '',
  startdatum: '',
  einddatum: ''
})
 
const loading = ref(false)
const error = ref('')
const succes = ref('')
const bestaandVoorstel = ref(null)
const isAanpassen = ref(false)
 
onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/stagevoorstellen/mijn', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const voorstel = data.stagevoorstel
 
    if (voorstel && (voorstel.status === 'aanpassen' || voorstel.status === 'afgekeurd')) {
      bestaandVoorstel.value = voorstel
      isAanpassen.value = voorstel.status === 'aanpassen'
 
      // Pre-fill formulier met bestaande gegevens
      form.value = {
        bedrijfsnaam: voorstel.bedrijfsnaam || '',
        sector: voorstel.sector || '',
        bedrijf_adres: voorstel.bedrijf_adres || '',
        docent_naam: voorstel.docent_naam || '',
        opdrachtomschrijving: voorstel.opdrachtomschrijving || '',
        startdatum: voorstel.startdatum ? voorstel.startdatum.split('T')[0] : '',
        einddatum: voorstel.einddatum ? voorstel.einddatum.split('T')[0] : ''
      }
    }
  } catch (err) {
    console.error(err)
  }
})
 
async function indienen() {
  error.value = ''
  succes.value = ''
 
  if (!form.value.bedrijfsnaam || !form.value.opdrachtomschrijving || !form.value.startdatum || !form.value.einddatum) {
    error.value = 'Vul alle verplichte velden in'
    return
  }
 
  loading.value = true
  const token = localStorage.getItem('token')
 
  try {
    let res
    if (bestaandVoorstel.value) {
      // Aanpassen of opnieuw indienen na afkeuring -> PUT
      res = await fetch(`http://localhost:3000/api/stagevoorstellen/${bestaandVoorstel.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form.value)
      })
    } else {
      // Nieuw voorstel -> POST
      res = await fetch('http://localhost:3000/api/stagevoorstellen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form.value)
      })
    }
 
    const data = await res.json()
 
    if (!res.ok) {
      error.value = data.error || 'Kon stagevoorstel niet indienen'
      return
    }
 
    succes.value = 'Stagevoorstel ingediend!'
    setTimeout(() => router.push('/student/dashboard'), 1200)
  } catch (err) {
    error.value = 'Verbindingsfout met server'
  } finally {
    loading.value = false
  }
}
 
function goBack() {
  router.push('/student/dashboard')
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
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="spacer"></div>
    </header>
 
    <section class="page-header">
      <button class="back-btn" @click="goBack">← Terug naar dashboard</button>
      <h1>{{ bestaandVoorstel ? 'Stagevoorstel aanpassen' : 'Stagevoorstel indienen' }}</h1>
      <p class="subtitle">
        <template v-if="isAanpassen">
          Pas je voorstel aan op basis van de feedback van de stagecommissie en dien het opnieuw in.
        </template>
        <template v-else-if="bestaandVoorstel">
          Vul de gegevens van je nieuwe stagebedrijf en opdracht in. De stagecommissie beoordeelt je voorstel binnen 5 werkdagen.
        </template>
        <template v-else>
          Vul de gegevens van je stagebedrijf en opdracht in. De stagecommissie beoordeelt je voorstel binnen 5 werkdagen.
        </template>
      </p>
    </section>
 
    <div v-if="isAanpassen && bestaandVoorstel?.feedback_aanpassen" class="feedback-notice">
      <h3>✏️ Feedback van de stagecommissie</h3>
      <p>{{ bestaandVoorstel.feedback_aanpassen }}</p>
    </div>
 
    <section class="card">
      <h2>🏢 Bedrijfsinformatie</h2>
      <div class="form-grid">
        <div class="field">
          <label>Bedrijfsnaam *</label>
          <input v-model="form.bedrijfsnaam" type="text" placeholder="bv. Acme Corp" />
        </div>
        <div class="field">
          <label>Sector</label>
          <input v-model="form.sector" type="text" placeholder="bv. IT sector" />
        </div>
        <div class="field full-width">
          <label>Adres</label>
          <input v-model="form.bedrijf_adres" type="text" placeholder="bv. Hoofdstraat 12, 1000 Brussel" />
        </div>
      </div>
    </section>
 
    <section class="card">
      <h2>🎓 Begeleiding EHB</h2>
      <div class="form-grid">
        <div class="field full-width">
          <label>Docent EHB</label>
          <input v-model="form.docent_naam" type="text" placeholder="bv. Mevr. Janssens" />
        </div>
      </div>
    </section>
 
    <section class="card">
      <h2>📅 Stageperiode</h2>
      <div class="form-grid">
        <div class="field">
          <label>Startdatum *</label>
          <input v-model="form.startdatum" type="date" />
        </div>
        <div class="field">
          <label>Einddatum *</label>
          <input v-model="form.einddatum" type="date" />
        </div>
      </div>
    </section>
 
    <section class="card">
      <h2>📝 Opdrachtomschrijving</h2>
      <div class="field full-width">
        <label>Beschrijf de opdracht *</label>
        <textarea v-model="form.opdrachtomschrijving" rows="5" placeholder="Beschrijf hier de opdracht/taken die je tijdens je stage zal uitvoeren..."></textarea>
      </div>
    </section>
 
    <div v-if="error" class="error-msg">{{ error }}</div>
    <div v-if="succes" class="succes-msg">{{ succes }}</div>
 
    <section class="actions">
      <button class="cancel-btn" @click="goBack">Annuleren</button>
      <button class="submit-btn" :disabled="loading" @click="indienen">
        {{ loading ? 'Indienen...' : (bestaandVoorstel ? 'Aangepast voorstel indienen' : 'Stagevoorstel indienen') }}
      </button>
    </section>
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
.spacer { width: 1px; }
 
.page-header { margin: 40px 64px 24px; }
.back-btn { border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 14px; font-size: 14px; padding: 0; }
.back-btn:hover { color: #991b1b; }
.page-header h1 { margin: 0 0 8px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; max-width: 640px; line-height: 1.6; }
 
.feedback-notice { margin: 0 64px 24px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 18px 22px; }
.feedback-notice h3 { margin: 0 0 8px; font-size: 14px; font-weight: 800; color: #9a3412; }
.feedback-notice p { margin: 0; font-size: 13px; color: #78350f; line-height: 1.6; white-space: pre-wrap; }
 
.card { margin: 0 64px 24px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; padding: 28px; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.card h2 { margin: 0 0 20px; font-size: 16px; font-weight: 800; }
 
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { display: flex; flex-direction: column; }
.field.full-width { grid-column: 1 / -1; }
.field label { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .4px; }
.field input, .field textarea {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  color: #334155;
  font-family: inherit;
  background: white;
}
.field input:focus, .field textarea:focus {
  outline: none;
  border-color: #991b1b;
  box-shadow: 0 0 0 3px rgba(153,27,27,0.12);
}
.field textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
 
.error-msg { margin: 0 64px 16px; color: #991b1b; font-size: 14px; font-weight: 600; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; }
.succes-msg { margin: 0 64px 16px; color: #15803d; font-size: 14px; font-weight: 700; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; }
 
.actions { margin: 0 64px; padding-bottom: 60px; display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn, .submit-btn { border-radius: 12px; padding: 12px 22px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; }
.cancel-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #991b1b; color: white; }
.submit-btn:hover { background: #7f1d1d; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
 
@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .page-header, .card, .actions, .error-msg, .succes-msg, .feedback-notice { margin-left: 20px; margin-right: 20px; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>