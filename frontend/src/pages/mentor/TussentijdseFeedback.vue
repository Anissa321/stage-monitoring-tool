<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const studentId = route.params.id

// Mock data — later vervangen door API
const student = ref({ naam: 'Anissa Canton', bedrijf: 'Acme Corp' })

const form = ref({
  datum: '',
  tijdVan: '14:00',
  tijdTot: '15:00',
  locatie: '',
  positievePunten: '',
  aandachtspunten: '',
  afspraken: ''
})

const competenties = ref([
  { naam: 'Communicatie', max: 25, score: 0 },
  { naam: 'Probleemoplossing', max: 25, score: 0 },
  { naam: 'Teamwork', max: 20, score: 0 },
  { naam: 'Vaktechnisch handelen', max: 30, score: 0 }
])

const aanwezigen = ref([
  { initialen: 'AC', naam: 'Anissa Canton', kleur: '#dbeafe', tekstkleur: '#1d4ed8' },
  { initialen: 'SJ', naam: 'Sven Janssens', kleur: '#dcfce7', tekstkleur: '#15803d' }
])

const loading = ref(false)
const error = ref('')
const succes = ref('')

const totaalScore = () => competenties.value.reduce((sum, c) => sum + c.score, 0)
const maxScore = () => competenties.value.reduce((sum, c) => sum + c.max, 0)

function scoreKleur(score, max) {
  const pct = score / max
  if (pct >= 0.8) return '#15803d'
  if (pct >= 0.5) return '#b45309'
  return '#991b1b'
}

async function registreren() {
  if (!form.value.datum || !form.value.positievePunten) {
    error.value = 'Vul datum en positieve punten in.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    // TODO: vervang door echte API call
    // const token = localStorage.getItem('token')
    // const res = await fetch('http://localhost:3000/api/besprekingen/mentor', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //   body: JSON.stringify({ student_id: studentId, ...form.value, scores: competenties.value })
    // })
    await new Promise(resolve => setTimeout(resolve, 800))
    succes.value = 'Feedback geregistreerd!'
    setTimeout(() => router.push(`/mentor/student/${studentId}`), 1500)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
}

function annuleren() {
  router.push(`/mentor/student/${studentId}`)
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
        <a @click="router.push('/mentor/dashboard')">Dashboard</a>
        <a class="active" @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>Sven Janssens</span>
        <div class="avatar-klein">SJ</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push(`/mentor/student/${studentId}`)">← Terug naar studentdossier</a>
      <h1>Tussentijdse feedback</h1>
      <p class="subtitle">Voor {{ student.naam }} • {{ student.bedrijf }}</p>

      <!-- Meta -->
      <div class="meta-card">
        <div class="meta-grid">
          <div class="meta-veld">
            <label>Datum</label>
            <div class="input-icon-wrap">
              <span>📅</span>
              <input v-model="form.datum" type="date" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Tijd</label>
            <div class="input-icon-wrap">
              <span>🕐</span>
              <input v-model="form.tijdVan" type="time" />
              <span class="separator">—</span>
              <input v-model="form.tijdTot" type="time" />
            </div>
          </div>
          <div class="meta-veld">
            <label>Locatie</label>
            <div class="input-icon-wrap">
              <span>📍</span>
              <input v-model="form.locatie" type="text" placeholder="bv. Op kantoor Acme Corp" />
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

      <div class="twee-kolommen">
        <!-- Feedback notities -->
        <div class="kolom-links">
          <h2 class="sectie-titel">Feedback notities</h2>
          <div class="notities-card">
            <div class="notitie-blok">
              <div class="notitie-label groen">
                <span>✅</span>
                <strong>POSITIEVE PUNTEN</strong>
              </div>
              <textarea v-model="form.positievePunten" rows="4" placeholder="Wat gaat goed?"></textarea>
            </div>
            <div class="notitie-blok">
              <div class="notitie-label oranje">
                <span>⚠️</span>
                <strong>AANDACHTSPUNTEN</strong>
              </div>
              <textarea v-model="form.aandachtspunten" rows="4" placeholder="Wat kan beter?"></textarea>
            </div>
            <div class="notitie-blok">
              <div class="notitie-label rood">
                <span>🔴</span>
                <strong>AFSPRAKEN</strong>
              </div>
              <textarea v-model="form.afspraken" rows="3" placeholder="Concrete afspraken (gebruik - per punt)"></textarea>
            </div>
          </div>
        </div>

        <!-- Scoring -->
        <div class="kolom-rechts">
          <h2 class="sectie-titel">Tussentijdse scoring</h2>
          <div class="scoring-card">
            <div v-for="comp in competenties" :key="comp.naam" class="scoring-rij">
              <div class="scoring-info">
                <span class="comp-naam">{{ comp.naam }}</span>
                <span class="comp-score" :style="{ color: scoreKleur(comp.score, comp.max) }">
                  {{ comp.score }} /{{ comp.max }}
                </span>
              </div>
              <div class="score-bar-wrap">
                <div class="score-bar">
                  <div
                    class="score-fill"
                    :style="{
                      width: (comp.score / comp.max * 100) + '%',
                      background: scoreKleur(comp.score, comp.max)
                    }"
                  ></div>
                </div>
                <input
                  v-model.number="comp.score"
                  type="range"
                  :min="0"
                  :max="comp.max"
                  class="score-slider"
                />
              </div>
            </div>

            <div class="totaal-rij">
              <span>Tussentijdse score</span>
              <strong>{{ totaalScore() }} / {{ maxScore() }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="succes" class="succes-msg">{{ succes }}</div>

      <div class="actions">
        <button class="cancel-btn" @click="annuleren">Annuleren</button>
        <button class="submit-btn" :disabled="loading" @click="registreren">
          <span v-if="loading">Registreren...</span>
          <span v-else>✓ Feedback registreren</span>
        </button>
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
.avatar-klein { width: 34px; height: 34px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 11px; font-weight: 700; }

.content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 4px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.meta-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.meta-grid { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1fr; gap: 20px; }
.meta-veld label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.input-icon-wrap { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; }
.input-icon-wrap input { border: none; background: transparent; font-size: 13px; color: #334155; font-family: inherit; outline: none; width: 100%; }
.separator { color: #94a3b8; font-weight: 600; }
.aanwezigen-rij { display: flex; gap: 6px; margin-bottom: 4px; }
.avatar-cirkel { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 800; }
.aanwezigen-namen { margin: 0; font-size: 11px; color: #64748b; }

.twee-kolommen { display: grid; grid-template-columns: 1fr 380px; gap: 24px; margin-bottom: 24px; }
.sectie-titel { font-size: 16px; font-weight: 800; margin: 0 0 14px; }

.notities-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); display: flex; flex-direction: column; gap: 20px; }
.notitie-blok { display: flex; flex-direction: column; gap: 8px; }
.notitie-label { display: flex; align-items: center; gap: 8px; }
.notitie-label strong { font-size: 11px; font-weight: 800; letter-spacing: 0.05em; }
.notitie-label.groen strong { color: #15803d; }
.notitie-label.oranje strong { color: #b45309; }
.notitie-label.rood strong { color: #991b1b; }
.notitie-blok textarea { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #334155; font-family: inherit; resize: vertical; line-height: 1.6; background: #f8fafc; }
.notitie-blok textarea:focus { outline: none; border-color: #991b1b; background: white; }

.scoring-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
.scoring-rij { margin-bottom: 20px; }
.scoring-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.comp-naam { font-size: 13px; font-weight: 700; color: #111827; }
.comp-score { font-size: 13px; font-weight: 800; }
.score-bar-wrap { position: relative; }
.score-bar { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-bottom: 4px; }
.score-fill { height: 100%; border-radius: 999px; transition: width 0.2s ease; }
.score-slider { width: 100%; accent-color: #991b1b; cursor: pointer; }

.totaal-rij { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 4px; }
.totaal-rij span { font-size: 13px; color: #64748b; font-weight: 600; }
.totaal-rij strong { font-size: 16px; font-weight: 800; color: #111827; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .meta-grid { grid-template-columns: 1fr 1fr; }
  .twee-kolommen { grid-template-columns: 1fr; }
  .actions { flex-direction: column; gap: 12px; }
}
</style>