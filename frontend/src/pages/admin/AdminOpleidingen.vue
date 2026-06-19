<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const opleidingen = ref([])
const loading = ref(true)
const showForm = ref(false)
const bewerkId = ref(null)
const succes = ref('')
const error = ref('')
const naamInput = ref('')

async function laadOpleidingen() {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/opleidingen', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    opleidingen.value = data.opleidingen || []
  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/administratie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    user.value = data.user
    await laadOpleidingen()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function openNieuw() {
  bewerkId.value = null
  naamInput.value = ''
  error.value = ''
  showForm.value = true
}

function openBewerken(opleiding) {
  bewerkId.value = opleiding.id
  naamInput.value = opleiding.naam
  error.value = ''
  showForm.value = true
}

function annuleer() {
  showForm.value = false
  bewerkId.value = null
  error.value = ''
}

async function opslaan() {
  if (!naamInput.value.trim()) {
    error.value = 'Naam is verplicht.'
    return
  }
  error.value = ''
  const token = localStorage.getItem('token')
  try {
    if (bewerkId.value) {
      const res = await fetch(`http://localhost:3000/api/opleidingen/${bewerkId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ naam: naamInput.value })
      })
      if (!res.ok) { error.value = 'Kon opleiding niet aanpassen'; return }
      succes.value = 'Opleiding aangepast!'
    } else {
      const res = await fetch('http://localhost:3000/api/opleidingen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ naam: naamInput.value })
      })
      if (!res.ok) { error.value = 'Kon opleiding niet aanmaken'; return }
      succes.value = 'Opleiding toegevoegd!'
    }
    await laadOpleidingen()
    showForm.value = false
    bewerkId.value = null
    setTimeout(() => succes.value = '', 2000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  }
}

async function verwijder(id, naam) {
  if (!confirm(`Opleiding "${naam}" verwijderen?`)) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/opleidingen/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Kon opleiding niet verwijderen'
      return
    }
    await laadOpleidingen()
    showForm.value = false
    succes.value = 'Opleiding verwijderd!'
    setTimeout(() => succes.value = '', 2000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  }
}

function gaNaarCompetenties(opleidingId) {
  router.push(`/admin/competenties?opleiding=${opleidingId}`)
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
        <a @click="router.push('/admin/competenties')">Competenties</a>
        <a @click="router.push('/admin/gebruikers')">Gebruikers</a>
        <a @click="router.push('/admin/koppelingen')">Koppelingen</a>
        <a class="active">Opleidingen</a>
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
          <h1>Opleidingen beheren</h1>
          <p>Elke opleiding heeft zijn eigen evaluatierubriek met competenties op maat</p>
        </div>
        <button class="new-btn" @click="openNieuw">+ Opleiding</button>
      </div>

      <div class="info-banner">
        ℹ️ Klik op een opleiding om de competenties van die opleiding te beheren.
      </div>

      <div v-if="succes" class="succes-msg">{{ succes }}</div>
      <div v-if="error && !showForm" class="error-msg">{{ error }}</div>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else class="opleidingen-lijst">
        <div v-for="o in opleidingen" :key="o.id" class="opleiding-rij">
          <div class="opleiding-info" @click="gaNaarCompetenties(o.id)">
            <div class="opleiding-icoon">🎓</div>
            <div>
              <h3>{{ o.naam }}</h3>
              <p>Klik om de competenties van deze opleiding te bekijken</p>
            </div>
          </div>
          <div class="opleiding-acties">
            <button class="edit-btn" @click="openBewerken(o)">✏️ Bewerken</button>
            <button class="delete-btn" @click="verwijder(o.id, o.naam)">🗑</button>
          </div>
        </div>
        <p v-if="opleidingen.length === 0" class="leeg">Nog geen opleidingen aangemaakt.</p>
      </div>

      <!-- Formulier modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="annuleer">
        <div class="modal">
          <button class="back-btn" @click="annuleer">← Terug</button>
          <h2>{{ bewerkId ? 'Opleiding bewerken' : 'Nieuwe opleiding' }}</h2>

          <div class="form-group">
            <label>Naam opleiding *</label>
            <input v-model="naamInput" type="text" placeholder="bijv. Bedrijfsmanagement" />
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="modal-actions">
            <button class="annuleer-btn" @click="annuleer">Annuleren</button>
            <button class="opslaan-btn" @click="opslaan">✓ Opslaan</button>
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
.loading { text-align: center; padding: 40px; color: #64748b; }
.opleidingen-lijst { display: flex; flex-direction: column; gap: 12px; }
.opleiding-rij { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
.opleiding-info { display: flex; align-items: center; gap: 16px; cursor: pointer; flex: 1; }
.opleiding-icoon { width: 44px; height: 44px; border-radius: 12px; background: #fee2e2; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
.opleiding-info h3 { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
.opleiding-info p { margin: 0; color: #64748b; font-size: 13px; }
.opleiding-acties { display: flex; gap: 8px; align-items: center; }
.edit-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 8px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 13px; }
.edit-btn:hover { background: #fef3c7; }
.delete-btn { border: none; background: transparent; cursor: pointer; font-size: 18px; padding: 6px; border-radius: 8px; }
.delete-btn:hover { background: #fee2e2; }
.leeg { color: #64748b; text-align: center; padding: 40px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { background: white; border-radius: 20px; padding: 36px; width: 480px; max-width: 90vw; box-shadow: 0 24px 60px rgba(0,0,0,0.15); }
.back-btn { border: none; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 16px; }
.back-btn:hover { color: #991b1b; }
.modal h2 { margin: 0 0 24px; font-size: 22px; font-weight: 800; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
.form-group input { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; }
.form-group input:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.annuleer-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn:hover { background: #7f1d1d; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  .page-content { padding: 24px 20px; }
}
</style>