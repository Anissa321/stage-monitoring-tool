<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const gebruikers = ref([])
const loading = ref(true)
const showForm = ref(false)
const succes = ref('')
const error = ref('')
const geselecteerd = ref([])

const form = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  wachtwoord: '',
  rol: 'mentor'
})

async function laadGebruikers() {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/gebruikers', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    gebruikers.value = data.gebruikers || []
    geselecteerd.value = []
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
    await laadGebruikers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const alleGeselecteerd = computed(() =>
  gebruikers.value.length > 0 && geselecteerd.value.length === gebruikers.value.length
)

function toggleAlles() {
  if (alleGeselecteerd.value) {
    geselecteerd.value = []
  } else {
    geselecteerd.value = gebruikers.value.map(g => g.id)
  }
}

function toggleSelectie(id) {
  if (geselecteerd.value.includes(id)) {
    geselecteerd.value = geselecteerd.value.filter(i => i !== id)
  } else {
    geselecteerd.value.push(id)
  }
}

function formatDatum(datum) {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function rolKleur(rol) {
  if (rol === 'mentor') return 'badge blue'
  if (rol === 'docent') return 'badge green'
  if (rol === 'student') return 'badge orange'
  if (rol === 'stagecommissie') return 'badge purple'
  if (rol === 'administratie') return 'badge red'
  return 'badge gray'
}

function rolLabel(rol) {
  if (rol === 'mentor') return 'Mentor'
  if (rol === 'docent') return 'Docent'
  if (rol === 'student') return 'Student'
  if (rol === 'stagecommissie') return 'Commissie'
  if (rol === 'administratie') return 'Admin'
  return rol
}

function openNieuw() {
  form.value = { voornaam: '', achternaam: '', email: '', wachtwoord: '', rol: 'mentor' }
  error.value = ''
  showForm.value = true
}

function annuleer() {
  showForm.value = false
  error.value = ''
}

async function opslaan() {
  if (!form.value.voornaam || !form.value.achternaam || !form.value.email || !form.value.wachtwoord) {
    error.value = 'Alle velden zijn verplicht.'
    return
  }
  error.value = ''
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/gebruikers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (!res.ok) { error.value = data.error || 'Kon account niet aanmaken'; return }
    succes.value = `Account aangemaakt voor ${form.value.voornaam} ${form.value.achternaam}!`
    await laadGebruikers()
    showForm.value = false
    setTimeout(() => succes.value = '', 3000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  }
}

async function verwijder(id, naam) {
  if (!confirm(`Account van ${naam} verwijderen?`)) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/gebruikers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) { error.value = 'Kon account niet verwijderen'; return }
    await laadGebruikers()
    succes.value = 'Account verwijderd!'
    setTimeout(() => succes.value = '', 2000)
  } catch (err) {
    error.value = 'Verbindingsfout met server.'
  }
}

async function verwijderGeselecteerd() {
  if (geselecteerd.value.length === 0) return
  if (!confirm(`${geselecteerd.value.length} account(s) verwijderen?`)) return
  const token = localStorage.getItem('token')
  try {
    for (const id of geselecteerd.value) {
      await fetch(`http://localhost:3000/api/gebruikers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    await laadGebruikers()
    succes.value = `${geselecteerd.value.length} account(s) verwijderd!`
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
        <a @click="router.push('/admin/competenties')">Competenties</a>
        <a class="active">Gebruikers</a>
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
          <h1>Gebruikers beheren</h1>
          <p>Maak accounts aan voor mentors, docenten en andere gebruikers</p>
        </div>
        <div class="header-acties">
          <button
            v-if="geselecteerd.length > 0"
            class="delete-selected-btn"
            @click="verwijderGeselecteerd"
          >
            🗑 Verwijder {{ geselecteerd.length }} geselecteerde
          </button>
          <button class="new-btn" @click="openNieuw">+ Nieuw account</button>
        </div>
      </div>

      <div v-if="succes" class="succes-msg">{{ succes }}</div>
      <div v-if="error && !showForm" class="error-msg">{{ error }}</div>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else class="table-card">
        <table>
          <thead>
            <tr>
              <th class="th-check">
                <input type="checkbox" :checked="alleGeselecteerd" @change="toggleAlles" />
              </th>
              <th>Naam</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Aangemaakt op</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="g in gebruikers"
              :key="g.id"
              :class="{ 'rij-geselecteerd': geselecteerd.includes(g.id) }"
            >
              <td class="td-check">
                <input
                  type="checkbox"
                  :checked="geselecteerd.includes(g.id)"
                  @change="toggleSelectie(g.id)"
                />
              </td>
              <td><strong>{{ g.voornaam }} {{ g.achternaam }}</strong></td>
              <td>{{ g.email }}</td>
              <td><span :class="rolKleur(g.rol)">{{ rolLabel(g.rol) }}</span></td>
              <td class="datum-cel">{{ formatDatum(g.created_at) }}</td>
              <td>
                <button class="delete-btn" @click="verwijder(g.id, g.voornaam + ' ' + g.achternaam)">🗑</button>
              </td>
            </tr>
            <tr v-if="gebruikers.length === 0">
              <td colspan="6" class="leeg">Geen gebruikers gevonden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulier modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="annuleer">
        <div class="modal">
          <button class="back-btn" @click="annuleer">← Terug</button>
          <h2>Nieuw account aanmaken</h2>
          <p>Maak een account aan voor een mentor, docent of andere gebruiker.</p>

          <div class="form-grid">
            <div class="form-group">
              <label>Voornaam *</label>
              <input v-model="form.voornaam" type="text" placeholder="Jan" />
            </div>
            <div class="form-group">
              <label>Achternaam *</label>
              <input v-model="form.achternaam" type="text" placeholder="Peeters" />
            </div>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="form.email" type="email" placeholder="jan.peeters@bedrijf.be" />
          </div>

          <div class="form-group">
            <label>Wachtwoord *</label>
            <input v-model="form.wachtwoord" type="password" placeholder="Minimaal 6 tekens" />
          </div>

          <div class="form-group">
            <label>Rol *</label>
            <select v-model="form.rol">
              <option value="mentor">Mentor</option>
              <option value="docent">Docent</option>
              <option value="student">Student</option>
              <option value="stagecommissie">Stagecommissie</option>
              <option value="administratie">Administratie</option>
            </select>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="modal-actions">
            <button class="annuleer-btn" @click="annuleer">Annuleren</button>
            <button class="opslaan-btn" @click="opslaan">✓ Account aanmaken</button>
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
.header-acties { display: flex; gap: 12px; align-items: center; }
.new-btn { border: none; background: #991b1b; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.new-btn:hover { background: #7f1d1d; }
.delete-selected-btn { border: 1px solid #ef4444; background: #fef2f2; color: #dc2626; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.delete-selected-btn:hover { background: #fee2e2; }
.loading { text-align: center; padding: 40px; color: #64748b; }
.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
.th-check { width: 48px; padding: 16px 16px 16px 24px; }
td { padding: 18px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.td-check { padding: 18px 16px 18px 24px; }
.rij-geselecteerd { background: #fef2f2; }
.datum-cel { color: #64748b; font-size: 13px; }
.badge { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge.blue { background: #dbeafe; color: #1d4ed8; }
.badge.green { background: #dcfce7; color: #15803d; }
.badge.orange { background: #fef3c7; color: #b45309; }
.badge.purple { background: #ede9fe; color: #7c3aed; }
.badge.red { background: #fee2e2; color: #991b1b; }
.badge.gray { background: #f1f5f9; color: #64748b; }
.delete-btn { border: 1px solid #ef4444; background: white; color: #dc2626; padding: 6px 10px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
.delete-btn:hover { background: #fef2f2; }
.leeg { text-align: center; color: #64748b; padding: 40px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { background: white; border-radius: 20px; padding: 36px; width: 560px; max-width: 90vw; box-shadow: 0 24px 60px rgba(0,0,0,0.15); }
.back-btn { border: none; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 16px; }
.back-btn:hover { color: #991b1b; }
.modal h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.modal > p { margin: 0 0 24px; color: #64748b; font-size: 14px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
.form-group input, .form-group select { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.annuleer-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn:hover { background: #7f1d1d; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  .page-content { padding: 24px 20px; }
  .form-grid { grid-template-columns: 1fr; }
  table { display: block; overflow-x: auto; }
  .header-acties { flex-direction: column; }
}
</style>