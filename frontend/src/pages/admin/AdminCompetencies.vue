<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const competenties = ref([])
const loading = ref(true)
const showForm = ref(false)
const bewerkId = ref(null)

const form = ref({
  naam: '',
  beschrijving: '',
  gewicht: 25
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const dashRes = await fetch('http://localhost:3000/api/dashboards/administratie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const dashData = await dashRes.json()
    user.value = dashData.user
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }

  // Hardcoded competenties voor demo
  competenties.value = [
    { id: 1, naam: 'Vaktechnisch handelen', beschrijving: 'De student past technische kennis correct toe in praktijksituaties en kiest passende oplossingen.', gewicht: 30, actief: true },
    { id: 2, naam: 'Communicatie', beschrijving: 'De student communiceert helder en effectief met team, mentor en stakeholders.', gewicht: 25, actief: true },
    { id: 3, naam: 'Probleemoplossing', beschrijving: 'De student analyseert problemen, denkt kritisch en zoekt creatieve oplossingen.', gewicht: 25, actief: true },
    { id: 4, naam: 'Teamwork & samenwerking', beschrijving: 'De student werkt effectief samen met teamleden en draagt bij aan een positieve werksfeer.', gewicht: 20, actief: true }
  ]
})

function totaalGewicht() {
  return competenties.value.reduce((sum, c) => sum + c.gewicht, 0)
}

function gewichtKleur(index) {
  const kleuren = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
  return kleuren[index % kleuren.length]
}

function openNieuw() {
  bewerkId.value = null
  form.value = { naam: '', beschrijving: '', gewicht: 25 }
  showForm.value = true
}

function openBewerken(comp) {
  bewerkId.value = comp.id
  form.value = { naam: comp.naam, beschrijving: comp.beschrijving, gewicht: comp.gewicht }
  showForm.value = true
}

function annuleer() {
  showForm.value = false
  bewerkId.value = null
}

function opslaan() {
  if (bewerkId.value) {
    const index = competenties.value.findIndex(c => c.id === bewerkId.value)
    if (index !== -1) {
      competenties.value[index] = { ...competenties.value[index], ...form.value }
    }
  } else {
    competenties.value.push({
      id: Date.now(),
      ...form.value,
      actief: true
    })
  }
  showForm.value = false
  bewerkId.value = null
}

function verwijder(id) {
  if (!confirm('Competentie verwijderen?')) return
  competenties.value = competenties.value.filter(c => c.id !== id)
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

function voornaam() { return user.value?.voornaam || 'Admin' }
function initialen() {
  if (!user.value) return 'A'
  return (user.value.voornaam?.[0] || '') + (user.value.achternaam?.[0] || '')
}
</script>

<template>
  <main class="admin-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/admin/dashboard')">Dashboard</a>
        <a class="active">Competenties</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <div class="page-content">
      <div class="page-header">
        <div>
          <h1>Competenties beheren</h1>
          <p>Beheer evaluatiecriteria voor stages — flexibel aan te passen wanneer beleid wijzigt</p>
        </div>
        <button class="new-btn" @click="openNieuw">+ Competentie</button>
      </div>

      <div class="info-banner">
        ℹ️ Wijzigingen worden automatisch doorgevoerd naar alle lopende evaluaties. Het totale gewicht moet 100% zijn.
      </div>

      <div class="profiel-bar">
        <div class="profiel-select">
          <span>Actief competentieprofiel</span>
          <select>
            <option>Toegepaste Informatica — 3e jaar</option>
          </select>
        </div>
        <div :class="['gewicht-badge', totaalGewicht() === 100 ? 'green' : 'red']">
          {{ totaalGewicht() === 100 ? '✓' : '⚠' }} Totaal gewicht: {{ totaalGewicht() }}%
        </div>
      </div>

      <div class="competenties-header">
        <h2>Competenties ({{ competenties.length }})</h2>
        <span class="sleep-hint">Sleep om volgorde te wijzigen</span>
      </div>

      <div class="competenties-lijst">
        <div v-for="(comp, index) in competenties" :key="comp.id" class="competentie-rij">
          <div class="drag-handle">⋮⋮</div>
          <div class="comp-nummer" :style="{ background: gewichtKleur(index) }">{{ index + 1 }}</div>
          <div class="comp-info">
            <h3>{{ comp.naam }}</h3>
            <p>{{ comp.beschrijving }}</p>
            <div class="comp-badges">
              <span class="badge-actief">● Actief</span>
              <span class="badge-bewerkbaar">Editeerbaar</span>
            </div>
          </div>
          <div class="comp-gewicht">
            <span class="gewicht-label">Gewicht</span>
            <div class="gewicht-input-row">
              <input v-model.number="comp.gewicht" type="number" min="0" max="100" class="gewicht-input" />
              <span>%</span>
            </div>
            <div class="gewicht-bar">
              <div class="gewicht-fill" :style="{ width: comp.gewicht + '%', background: gewichtKleur(index) }"></div>
            </div>
          </div>
          <div class="comp-acties">
            <button class="edit-btn" @click="openBewerken(comp)">✏️</button>
            <button class="delete-btn" @click="verwijder(comp.id)">🗑</button>
          </div>
        </div>
      </div>

      <!-- Formulier modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="annuleer">
        <div class="modal">
          <button class="back-btn" @click="annuleer">← Terug naar competenties</button>
          <h2>{{ bewerkId ? 'Competentie bewerken' : 'Nieuwe competentie' }}</h2>
          <p>{{ bewerkId ? 'Pas naam, beschrijving en gewicht aan. Wijzigingen worden direct doorgevoerd.' : 'Voeg een nieuwe competentie toe aan het profiel.' }}</p>

          <div class="form-group">
            <label>Naam competentie *</label>
            <input v-model="form.naam" type="text" placeholder="bijv. Communicatie" />
          </div>

          <div class="form-group">
            <label>Beschrijving *</label>
            <textarea v-model="form.beschrijving" placeholder="Beschrijf wat deze competentie inhoudt..."></textarea>
          </div>

          <div class="form-group">
            <label>Gewicht (% van eindscore) *</label>
            <input v-model.number="form.gewicht" type="range" min="0" max="100" class="range-input" />
            <div class="range-value">{{ form.gewicht }} %</div>
            <p class="range-hint">Totaal gewicht van alle competenties moet 100% zijn.</p>
          </div>

          <div class="form-group">
            <label>Status</label>
            <div class="toggle-row">
              <div class="toggle active"></div>
              <span>Competentie is actief</span>
            </div>
          </div>

          <div v-if="bewerkId" class="warning-banner">
            ⚠ Impact van deze wijziging — Deze wijziging wordt toegepast op alle lopende evaluaties. Reeds afgesloten evaluaties blijven ongewijzigd.
          </div>

          <div class="modal-actions">
            <button class="annuleer-btn" @click="annuleer">Annuleren</button>
            <div class="modal-right-btns">
              <button v-if="bewerkId" class="verwijder-btn" @click="verwijder(bewerkId); annuleer()">🗑 Verwijderen</button>
              <button class="opslaan-btn" @click="opslaan">✓ Wijzigingen opslaan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.admin-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
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
.page-content { padding: 40px 64px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { margin: 0; font-size: 28px; font-weight: 800; }
.page-header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
.new-btn { border: none; background: #991b1b; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.new-btn:hover { background: #7f1d1d; }
.info-banner { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 14px 18px; border-radius: 12px; font-size: 14px; margin-bottom: 24px; }
.profiel-bar { display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; }
.profiel-select { display: flex; flex-direction: column; gap: 6px; }
.profiel-select span { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
.profiel-select select { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; font-size: 14px; font-weight: 600; }
.gewicht-badge { padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.gewicht-badge.green { background: #dcfce7; color: #15803d; }
.gewicht-badge.red { background: #fee2e2; color: #991b1b; }
.competenties-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.competenties-header h2 { margin: 0; font-size: 18px; }
.sleep-hint { color: #94a3b8; font-size: 13px; }
.competenties-lijst { display: flex; flex-direction: column; gap: 12px; }
.competentie-rij { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; display: grid; grid-template-columns: 32px 44px 1fr 160px 80px; gap: 16px; align-items: center; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
.drag-handle { color: #cbd5e1; font-size: 18px; cursor: grab; }
.comp-nummer { width: 44px; height: 44px; border-radius: 50%; color: white; display: grid; place-items: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.comp-info h3 { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
.comp-info p { margin: 0 0 8px; color: #64748b; font-size: 13px; line-height: 1.5; }
.comp-badges { display: flex; gap: 8px; }
.badge-actief { background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.badge-bewerkbaar { background: #f1f5f9; color: #64748b; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.comp-gewicht { display: flex; flex-direction: column; gap: 6px; }
.gewicht-label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.gewicht-input-row { display: flex; align-items: center; gap: 6px; }
.gewicht-input { width: 60px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 8px; font-size: 14px; font-weight: 700; text-align: center; }
.gewicht-bar { height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.gewicht-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
.comp-acties { display: flex; gap: 8px; justify-content: flex-end; }
.edit-btn, .delete-btn { border: none; background: transparent; cursor: pointer; font-size: 16px; padding: 6px; border-radius: 8px; transition: background 0.2s; }
.edit-btn:hover { background: #fef3c7; }
.delete-btn:hover { background: #fee2e2; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { background: white; border-radius: 20px; padding: 36px; width: 600px; max-width: 90vw; box-shadow: 0 24px 60px rgba(0,0,0,0.15); }
.back-btn { border: none; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 16px; }
.back-btn:hover { color: #991b1b; }
.modal h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.modal > p { margin: 0 0 24px; color: #64748b; font-size: 14px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
.form-group input[type="text"], .form-group textarea { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 14px; }
.form-group textarea { min-height: 80px; resize: vertical; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }
.range-input { width: 100%; accent-color: #991b1b; margin: 8px 0; }
.range-value { font-size: 20px; font-weight: 800; color: #111827; }
.range-hint { margin: 4px 0 0; color: #94a3b8; font-size: 12px; }
.toggle-row { display: flex; align-items: center; gap: 10px; }
.toggle { width: 44px; height: 24px; border-radius: 999px; background: #e5e7eb; cursor: pointer; }
.toggle.active { background: #10b981; }
.warning-banner { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; padding: 14px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
.modal-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
.modal-right-btns { display: flex; gap: 12px; }
.annuleer-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.verwijder-btn { border: 1px solid #ef4444; background: white; color: #dc2626; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn:hover { background: #7f1d1d; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  .page-content { padding: 24px 20px; }
  .competentie-rij { grid-template-columns: 1fr; }
}
</style>