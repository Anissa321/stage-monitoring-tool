<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const competenties = ref([])
const opleidingen = ref([])
const geselecteerdeOpleiding = ref(null)
const loading = ref(true)
const showForm = ref(false)
const bewerkId = ref(null)
const succes = ref('')
const error = ref('')

const form = ref({
  naam: '',
  beschrijving: '',
  volgorde: 0
})

// Niveaus die in het formulier bewerkt/toegevoegd worden
const formNiveaus = ref([])

async function laadOpleidingen() {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/opleidingen', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    opleidingen.value = data.opleidingen || []

    const queryOpleiding = route.query.opleiding
    if (queryOpleiding && opleidingen.value.some(o => o.id === Number(queryOpleiding))) {
      geselecteerdeOpleiding.value = Number(queryOpleiding)
    } else if (opleidingen.value.length > 0) {
      geselecteerdeOpleiding.value = opleidingen.value[0].id
    }
  } catch (err) {
    console.error(err)
  }
}

async function laadCompetencies() {
  if (!geselecteerdeOpleiding.value) {
    competenties.value = []
    return
  }
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/evaluatie-competenties?opleiding_id=${geselecteerdeOpleiding.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    competenties.value = data.competenties || []
  } catch (err) {
    console.error(err)
    competenties.value = []
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const dashRes = await fetch('http://localhost:3000/api/dashboards/administratie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const dashData = await dashRes.json()
    user.value = dashData.user

    await laadOpleidingen()
    await laadCompetencies()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

watch(geselecteerdeOpleiding, () => {
  laadCompetencies()
})

const huidigeOpleidingNaam = computed(() => {
  const o = opleidingen.value.find(o => o.id === geselecteerdeOpleiding.value)
  return o ? o.naam : ''
})

function wisselOpleiding(id) {
  geselecteerdeOpleiding.value = Number(id)
  router.replace({ path: '/admin/competenties', query: { opleiding: id } })
}

function gewichtKleur(index) {
  const kleuren = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
  return kleuren[index % kleuren.length]
}

function maxPunten(comp) {
  if (!comp.evaluatie_niveaus || comp.evaluatie_niveaus.length === 0) return 0
  return Math.max(...comp.evaluatie_niveaus.map(n => n.punten))
}

// Totaal gewicht over alle competenties van de huidige opleiding (op basis van het MAX-niveau per competentie)
const totaalGewicht = computed(() => {
  return competenties.value.reduce((sum, c) => sum + maxPunten(c), 0)
})

const gewichtStatusKlasse = computed(() => {
  if (totaalGewicht.value === 100) return 'gewicht-ok'
  return 'gewicht-fout'
})

// Totaal gewicht NA opslaan van het huidige formulier (live preview in de modal)
const formMaxPunten = computed(() => {
  if (formNiveaus.value.length === 0) return 0
  return Math.max(...formNiveaus.value.map(n => Number(n.punten) || 0))
})

const totaalGewichtPreview = computed(() => {
  const anderen = competenties.value
    .filter(c => c.id !== bewerkId.value)
    .reduce((sum, c) => sum + maxPunten(c), 0)
  return anderen + formMaxPunten.value
})

function openNieuw() {
  bewerkId.value = null
  form.value = { naam: '', beschrijving: '', volgorde: competenties.value.length + 1 }
  formNiveaus.value = [
    { id: null, label: 'Onvoldoende', punten: 0, beschrijving: '', volgorde: 1 },
    { id: null, label: 'Voldoende', punten: 13, beschrijving: '', volgorde: 2 },
    { id: null, label: 'Goed', punten: 19, beschrijving: '', volgorde: 3 },
    { id: null, label: 'Uitstekend', punten: 25, beschrijving: '', volgorde: 4 }
  ]
  error.value = ''
  showForm.value = true
}

function openBewerken(comp) {
  bewerkId.value = comp.id
  form.value = { naam: comp.naam, beschrijving: comp.beschrijving, volgorde: comp.volgorde }
  formNiveaus.value = (comp.evaluatie_niveaus || [])
    .slice()
    .sort((a, b) => a.volgorde - b.volgorde)
    .map(n => ({ ...n }))
  error.value = ''
  showForm.value = true
}

function annuleer() {
  showForm.value = false
  bewerkId.value = null
  formNiveaus.value = []
  error.value = ''
}

function voegNiveauToe() {
  formNiveaus.value.push({
    id: null,
    label: '',
    punten: 0,
    beschrijving: '',
    volgorde: formNiveaus.value.length + 1
  })
}

async function verwijderNiveau(index) {
  const niveau = formNiveaus.value[index]
  if (niveau.id) {
    if (!confirm('Dit niveau verwijderen?')) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:3000/api/evaluatie-competenties/niveau/${niveau.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        error.value = 'Kon niveau niet verwijderen'
        return
      }
    } catch (err) {
      error.value = 'Verbindingsfout met server.'
      return
    }
  }
  formNiveaus.value.splice(index, 1)
}

async function opslaan() {
  if (!form.value.naam) {
    error.value = 'Naam is verplicht.'
    return
  }
  if (!geselecteerdeOpleiding.value) {
    error.value = 'Selecteer eerst een opleiding.'
    return
  }
  if (formNiveaus.value.length === 0) {
    error.value = 'Voeg minstens één niveau toe.'
    return
  }
  if (formNiveaus.value.some(n => !n.label.trim())) {
    error.value = 'Elk niveau moet een label hebben.'
    return
  }

  error.value = ''
  const token = localStorage.getItem('token')

  try {
    let competentieId = bewerkId.value

    if (bewerkId.value) {
      const res = await fetch(`http://localhost:3000/api/evaluatie-competenties/${bewerkId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form.value, opleiding_id: geselecteerdeOpleiding.value })
      })
      if (!res.ok) { error.value = 'Kon competentie niet aanpassen'; return }
    } else {
      const res = await fetch('http://localhost:3000/api/evaluatie-competenties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form.value, opleiding_id: geselecteerdeOpleiding.value })
      })
      if (!res.ok) { error.value = 'Kon competentie niet aanmaken'; return }
      const data = await res.json()
      competentieId = data.competentie.id
    }

    // Sla elk niveau apart op: update bestaande, voeg nieuwe toe
    for (const niveau of formNiveaus.value) {
      if (niveau.id) {
        await fetch(`http://localhost:3000/api/evaluatie-competenties/niveau/${niveau.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            label: niveau.label,
            punten: Number(niveau.punten),
            beschrijving: niveau.beschrijving,
            volgorde: niveau.volgorde
          })
        })
      } else {
        await fetch(`http://localhost:3000/api/evaluatie-competenties/${competentieId}/niveau`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            label: niveau.label,
            punten: Number(niveau.punten),
            beschrijving: niveau.beschrijving,
            volgorde: niveau.volgorde
          })
        })
      }
    }

    succes.value = bewerkId.value ? 'Competentie aangepast!' : 'Competentie toegevoegd!'
    await laadCompetencies()
    showForm.value = false
    bewerkId.value = null
    formNiveaus.value = []
    setTimeout(() => succes.value = '', 2000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  }
}

async function verwijder(id) {
  if (!confirm('Competentie verwijderen? De bijhorende niveaus worden ook verwijderd.')) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/evaluatie-competenties/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) { error.value = 'Kon competentie niet verwijderen'; return }
    await laadCompetencies()
    showForm.value = false
    succes.value = 'Competentie verwijderd!'
    setTimeout(() => succes.value = '', 2000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  }
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) { console.log(err) }
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
        <a @click="router.push('/admin/opleidingen')">Opleidingen</a>
        <a class="active">Competenties</a>
        <a @click="router.push('/admin/gebruikers')">Gebruikers</a>
        <a @click="router.push('/admin/koppelingen')">Koppelingen</a>
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
          <p>Beheer evaluatiecriteria per opleiding — het totaalgewicht moet exact 100 punten zijn</p>
        </div>
        <button class="new-btn" @click="openNieuw" :disabled="!geselecteerdeOpleiding">+ Competentie</button>
      </div>

      <div v-if="opleidingen.length > 0" class="opleiding-selector">
        <label>Opleiding</label>
        <select :value="geselecteerdeOpleiding" @change="wisselOpleiding($event.target.value)">
          <option v-for="o in opleidingen" :key="o.id" :value="o.id">{{ o.naam }}</option>
        </select>
      </div>

      <div v-else-if="!loading" class="info-banner">
        ⚠️ Er zijn nog geen opleidingen aangemaakt. Ga eerst naar
        <a @click="router.push('/admin/opleidingen')" style="cursor:pointer; text-decoration: underline;">Opleidingen</a>
        om er een toe te voegen.
      </div>

      <!-- Totaalgewicht indicator -->
      <div v-if="geselecteerdeOpleiding && !loading" class="gewicht-banner" :class="gewichtStatusKlasse">
        <div class="gewicht-tekst">
          <strong>Totaalgewicht {{ huidigeOpleidingNaam }}: {{ totaalGewicht }} / 100 punten</strong>
          <span v-if="totaalGewicht === 100">✓ Correct — de rubriek telt op tot 100 punten.</span>
          <span v-else-if="totaalGewicht < 100">⚠ Te laag — voeg {{ 100 - totaalGewicht }} punten toe via een competentie of niveau.</span>
          <span v-else>⚠ Te hoog — verwijder {{ totaalGewicht - 100 }} punten van een competentie of niveau.</span>
        </div>
        <div class="gewicht-bar">
          <div class="gewicht-bar-fill" :style="{ width: Math.min(totaalGewicht, 100) + '%' }"></div>
        </div>
      </div>

      <div v-if="succes" class="succes-msg">{{ succes }}</div>
      <div v-if="error && !showForm" class="error-msg">{{ error }}</div>

      <div class="competenties-header">
        <h2>Competenties ({{ competenties.length }})</h2>
      </div>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else class="competenties-lijst">
        <div v-for="(comp, index) in competenties" :key="comp.id" class="competentie-rij">
          <div class="comp-nummer" :style="{ background: gewichtKleur(index) }">{{ index + 1 }}</div>
          <div class="comp-info">
            <h3>{{ comp.naam }}</h3>
            <p>{{ comp.beschrijving }}</p>
            <div class="comp-badges">
              <span class="badge-actief">● Actief</span>
              <span class="badge-niveaus">{{ comp.evaluatie_niveaus?.length || 0 }} niveaus</span>
              <span class="badge-punten">Max {{ maxPunten(comp) }} punten</span>
            </div>
          </div>
          <div class="comp-acties">
            <button class="edit-btn" @click="openBewerken(comp)">✏️ Bewerken</button>
            <button class="delete-btn" @click="verwijder(comp.id)">🗑</button>
          </div>
        </div>
        <p v-if="competenties.length === 0 && geselecteerdeOpleiding" class="leeg">
          Nog geen competenties voor {{ huidigeOpleidingNaam }}.
        </p>
      </div>

      <!-- Formulier modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="annuleer">
        <div class="modal">
          <button class="back-btn" @click="annuleer">← Terug naar competenties</button>
          <h2>{{ bewerkId ? 'Competentie bewerken' : 'Nieuwe competentie' }}</h2>
          <p>{{ bewerkId ? `Pas naam, beschrijving en niveaus aan voor ${huidigeOpleidingNaam}.` : `Voeg een nieuwe competentie toe aan ${huidigeOpleidingNaam}.` }}</p>

          <div class="form-group">
            <label>Naam competentie *</label>
            <input v-model="form.naam" type="text" placeholder="bijv. Communicatie" />
          </div>

          <div class="form-group">
            <label>Beschrijving *</label>
            <textarea v-model="form.beschrijving" placeholder="Beschrijf wat deze competentie inhoudt..."></textarea>
          </div>

          <div class="form-group">
            <label>Volgorde</label>
            <input v-model.number="form.volgorde" type="number" min="1" style="width:80px; border:1px solid #e5e7eb; border-radius:8px; padding:8px;" />
          </div>

          <!-- Niveaus beheren -->
          <div class="form-group">
            <label>Niveaus (max punten van deze competentie = hoogste niveau)</label>
            <div class="niveaus-lijst">
              <div v-for="(niveau, idx) in formNiveaus" :key="idx" class="niveau-rij">
                <div class="niveau-header">
                  <input v-model="niveau.label" type="text" class="niveau-label-input" placeholder="Label (bv. Goed)" />
                  <div class="punten-wrap">
                    <input v-model.number="niveau.punten" type="number" min="0" max="100" class="punten-input" />
                    <span class="punten-suffix">ptn</span>
                  </div>
                  <button type="button" class="verwijder-niveau-btn" @click="verwijderNiveau(idx)">🗑</button>
                </div>
                <textarea v-model="niveau.beschrijving" class="niveau-beschrijving-input" placeholder="Beschrijving van dit niveau..." rows="2"></textarea>
              </div>
            </div>
            <button type="button" class="voeg-niveau-btn" @click="voegNiveauToe">+ Niveau toevoegen</button>
          </div>

          <!-- Live preview totaalgewicht -->
          <div class="preview-banner" :class="totaalGewichtPreview === 100 ? 'gewicht-ok' : 'gewicht-fout'">
            Totaalgewicht na opslaan: <strong>{{ totaalGewichtPreview }} / 100 punten</strong>
            <span v-if="totaalGewichtPreview === 100">✓</span>
            <span v-else>⚠ Niet gelijk aan 100</span>
          </div>

          <div v-if="bewerkId" class="warning-banner">
            ⚠ Deze wijziging wordt toegepast op alle lopende evaluaties van {{ huidigeOpleidingNaam }}.
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="modal-actions">
            <button class="annuleer-btn" @click="annuleer">Annuleren</button>
            <div class="modal-right-btns">
              <button v-if="bewerkId" class="verwijder-btn" @click="verwijder(bewerkId)">🗑 Verwijderen</button>
              <button class="opslaan-btn" @click="opslaan">✓ Opslaan</button>
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
.new-btn:hover:not(:disabled) { background: #7f1d1d; }
.new-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.opleiding-selector { background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 20px; margin-bottom: 16px; display: flex; align-items: center; gap: 14px; }
.opleiding-selector label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.opleiding-selector select { flex: 1; max-width: 320px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 14px; font-weight: 600; color: #334155; background: white; cursor: pointer; }

.gewicht-banner { border-radius: 14px; padding: 16px 20px; margin-bottom: 16px; }
.gewicht-banner.gewicht-ok { background: #ecfdf5; border: 1px solid #a7f3d0; }
.gewicht-banner.gewicht-fout { background: #fef2f2; border: 1px solid #fecaca; }
.gewicht-tekst { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; }
.gewicht-tekst strong { font-size: 14px; }
.gewicht-banner.gewicht-ok .gewicht-tekst strong { color: #15803d; }
.gewicht-banner.gewicht-fout .gewicht-tekst strong { color: #991b1b; }
.gewicht-tekst span { font-size: 12px; color: #64748b; }
.gewicht-bar { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.gewicht-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; background: #991b1b; }
.gewicht-banner.gewicht-ok .gewicht-bar-fill { background: #15803d; }

.info-banner { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 14px 18px; border-radius: 12px; font-size: 14px; margin-bottom: 24px; }
.competenties-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.competenties-header h2 { margin: 0; font-size: 18px; font-weight: 800; }
.loading { text-align: center; padding: 40px; color: #64748b; }
.leeg { color: #64748b; text-align: center; padding: 40px; }
.competenties-lijst { display: flex; flex-direction: column; gap: 12px; }
.competentie-rij { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; display: grid; grid-template-columns: 44px 1fr auto; gap: 16px; align-items: center; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
.comp-nummer { width: 44px; height: 44px; border-radius: 50%; color: white; display: grid; place-items: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
.comp-info h3 { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
.comp-info p { margin: 0 0 8px; color: #64748b; font-size: 13px; line-height: 1.5; }
.comp-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.badge-actief { background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.badge-niveaus { background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.badge-punten { background: #fef3c7; color: #b45309; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.comp-acties { display: flex; gap: 8px; align-items: center; }
.edit-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 8px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 13px; }
.edit-btn:hover { background: #fef3c7; }
.delete-btn { border: none; background: transparent; cursor: pointer; font-size: 18px; padding: 6px; border-radius: 8px; }
.delete-btn:hover { background: #fee2e2; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px; }
.modal { background: white; border-radius: 20px; padding: 36px; width: 680px; max-width: 90vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.15); }
.back-btn { border: none; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 16px; }
.back-btn:hover { color: #991b1b; }
.modal h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.modal > p { margin: 0 0 24px; color: #64748b; font-size: 14px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
.form-group input[type="text"], .form-group textarea { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; }
.form-group textarea { min-height: 80px; resize: vertical; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }

.niveaus-lijst { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.niveau-rij { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.niveau-header { display: flex; gap: 10px; align-items: center; }
.niveau-label-input { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 13px; font-weight: 700; font-family: inherit; }
.niveau-label-input:focus { outline: none; border-color: #991b1b; }
.punten-wrap { display: flex; align-items: center; gap: 6px; }
.punten-input { width: 64px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 13px; font-weight: 700; text-align: center; font-family: inherit; }
.punten-input:focus { outline: none; border-color: #991b1b; }
.punten-suffix { font-size: 12px; font-weight: 700; color: #991b1b; }
.verwijder-niveau-btn { border: none; background: transparent; cursor: pointer; font-size: 15px; padding: 6px; border-radius: 8px; flex-shrink: 0; }
.verwijder-niveau-btn:hover { background: #fee2e2; }
.niveau-beschrijving-input { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #334155; font-family: inherit; resize: vertical; width: 100%; }
.niveau-beschrijving-input:focus { outline: none; border-color: #991b1b; }
.voeg-niveau-btn { border: 1px dashed #cbd5e1; background: white; color: #334155; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; width: 100%; }
.voeg-niveau-btn:hover { background: #f8fafc; border-color: #991b1b; color: #991b1b; }

.preview-banner { border-radius: 10px; padding: 12px 16px; font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.preview-banner.gewicht-ok { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; }
.preview-banner.gewicht-fout { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

.warning-banner { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; padding: 14px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
.modal-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
.modal-right-btns { display: flex; gap: 12px; }
.annuleer-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.verwijder-btn { border: 1px solid #ef4444; background: white; color: #dc2626; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn:hover { background: #7f1d1d; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  .page-content { padding: 24px 20px; }
  .competentie-rij { grid-template-columns: 1fr; }
}
</style>