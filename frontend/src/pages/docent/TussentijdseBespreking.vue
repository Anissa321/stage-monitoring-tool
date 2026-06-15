<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

// Mock student data — later vervangen door API
const student = ref({
  naam: 'Anissa Canton',
  bedrijf: 'Acme Corp'
})

const form = ref({
  datum: '',
  tijdVan: '14:00',
  tijdTot: '15:00',
  locatie: '',
  positievePunten: '',
  aandachtspunten: '',
  afspraken: ''
})

const loading = ref(false)
const error = ref('')
const succes = ref('')

const aanwezigen = ref([
  { initialen: 'AC', naam: 'Anissa Canton', kleur: '#dbeafe', tekstkleur: '#1d4ed8' },
  { initialen: 'JD', naam: 'Jan De Vries', kleur: '#fef3c7', tekstkleur: '#b45309' },
  { initialen: 'SJ', naam: 'Sven Janssens', kleur: '#dcfce7', tekstkleur: '#15803d' }
])

async function opslaanAlsConcept() {
  // TODO: API call
  succes.value = 'Concept opgeslagen!'
  setTimeout(() => succes.value = '', 2000)
}

async function registreren() {
  if (!form.value.datum || !form.value.locatie || !form.value.positievePunten) {
    error.value = 'Vul datum, locatie en positieve punten in.'
    return
  }
  error.value = ''
  loading.value = true

  try {
    // TODO: vervang door echte API call
    // const token = localStorage.getItem('token')
    // const res = await fetch('http://localhost:3000/api/besprekingen', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //   body: JSON.stringify({ student_id: studentId, ...form.value })
    // })

    await new Promise(resolve => setTimeout(resolve, 800))
    succes.value = 'Bespreking geregistreerd!'
    setTimeout(() => router.push(`/docent/studenten/${studentId}`), 1500)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
}

function annuleren() {
  router.push(`/docent/studenten/${studentId}`)
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
        <a @click="router.push('/docent/dashboard')">Dashboard</a>
        <a class="active" @click="router.push('/docent/studenten')">Studenten</a>
        <a @click="router.push('/docent/evaluaties')">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>Jan</span>
        <div class="avatar-klein">J</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push(`/docent/studenten/${studentId}`)">← Terug naar studentdossier</a>
      <h1>Tussentijdse bespreking</h1>
      <p class="subtitle">Voor {{ student.naam }} • {{ student.bedrijf }}</p>

      <!-- Datum, Tijd, Locatie, Aanwezigen -->
      <div class="meta-card">
        <div class="meta-grid">
          <div class="meta-veld">
            <label>Datum</label>
            <div class="input-icon-wrap">
              <span class="input-icon">📅</span>
              <input v-model="form.datum" type="date" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Tijd</label>
            <div class="input-icon-wrap">
              <span class="input-icon">🕐</span>
              <input v-model="form.tijdVan" type="time" />
              <span class="tijd-separator">—</span>
              <input v-model="form.tijdTot" type="time" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Locatie</label>
            <div class="input-icon-wrap">
              <span class="input-icon">📍</span>
              <input v-model="form.locatie" type="text" placeholder="bv. Online via Teams" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Aanwezigen</label>
            <div class="aanwezigen-rij">
              <div
                v-for="a in aanwezigen"
                :key="a.initialen"
                class="avatar-cirkel"
                :style="{ background: a.kleur, color: a.tekstkleur }"
                :title="a.naam"
              >{{ a.initialen }}</div>
            </div>
            <p class="aanwezigen-namen">{{ aanwezigen.map(a => a.naam.split(' ')[0]).join(', ') }}</p>
          </div>
        </div>
      </div>

      <!-- Bespreking notities -->
      <h2 class="sectie-titel">Bespreking notities</h2>

      <div class="notities-card">
        <div class="notitie-blok">
          <div class="notitie-label groen">
            <span>✅</span>
            <strong>POSITIEVE PUNTEN</strong>
          </div>
          <textarea
            v-model="form.positievePunten"
            rows="3"
            placeholder="Wat gaat goed? Welke sterktes vallen op?"
          ></textarea>
        </div>

        <div class="notitie-blok">
          <div class="notitie-label oranje">
            <span>⚠️</span>
            <strong>AANDACHTSPUNTEN</strong>
          </div>
          <textarea
            v-model="form.aandachtspunten"
            rows="3"
            placeholder="Wat kan beter? Welke punten verdienen aandacht?"
          ></textarea>
        </div>

        <div class="notitie-blok">
          <div class="notitie-label rood">
            <span>🔴</span>
            <strong>AFSPRAKEN</strong>
          </div>
          <textarea
            v-model="form.afspraken"
            rows="3"
            placeholder="Welke concrete afspraken zijn gemaakt? (gebruik - per punt)"
          ></textarea>
        </div>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="succes" class="succes-msg">{{ succes }}</div>

      <!-- Acties -->
      <div class="actions">
        <button class="cancel-btn" @click="annuleren">Annuleren</button>
        <div class="actions-rechts">
          <button class="concept-btn" @click="opslaanAlsConcept">Opslaan als concept</button>
          <button class="submit-btn" :disabled="loading" @click="registreren">
            <span v-if="loading">Registreren...</span>
            <span v-else>✓ Bespreking registreren</span>
          </button>
        </div>
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
.profile { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar-klein { width: 34px; height: 34px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; font-weight: 700; }

.content { max-width: 860px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 4px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.meta-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.meta-grid { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1fr; gap: 20px; }
.meta-veld label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.input-icon-wrap { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; }
.input-icon { font-size: 14px; flex-shrink: 0; }
.input-icon-wrap input { border: none; background: transparent; font-size: 13px; color: #334155; font-family: inherit; outline: none; width: 100%; }
.tijd-separator { color: #94a3b8; font-weight: 600; }

.aanwezigen-rij { display: flex; gap: 6px; margin-bottom: 4px; }
.avatar-cirkel { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 800; cursor: default; }
.aanwezigen-namen { margin: 0; font-size: 11px; color: #64748b; }

.sectie-titel { font-size: 18px; font-weight: 800; margin: 0 0 16px; }

.notities-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); display: flex; flex-direction: column; gap: 24px; }
.notitie-blok { display: flex; flex-direction: column; gap: 10px; }
.notitie-label { display: flex; align-items: center; gap: 8px; }
.notitie-label strong { font-size: 12px; font-weight: 800; letter-spacing: 0.05em; }
.notitie-label.groen strong { color: #15803d; }
.notitie-label.oranje strong { color: #b45309; }
.notitie-label.rood strong { color: #991b1b; }
.notitie-blok textarea { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #334155; font-family: inherit; resize: vertical; line-height: 1.6; background: #f8fafc; }
.notitie-blok textarea:focus { outline: none; border-color: #991b1b; background: white; box-shadow: 0 0 0 3px rgba(153,27,27,0.08); }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; }
.actions-rechts { display: flex; gap: 12px; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.concept-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.concept-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #1e40af; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 800px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .meta-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
  .actions { flex-direction: column; gap: 12px; align-items: stretch; }
  .actions-rechts { flex-direction: column; }
}
</style>