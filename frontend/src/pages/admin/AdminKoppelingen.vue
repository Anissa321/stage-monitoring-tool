<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const studenten = ref([])
const mentors = ref([])
const docenten = ref([])
const loading = ref(true)
const succes = ref('')
const error = ref('')
const bewerkStudent = ref(null)
const bewerkForm = ref({ mentor_id: '', docent_id: '' })

async function laadData() {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/gebruikers/studenten-overzicht', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    studenten.value = data.studenten || []
    mentors.value = data.mentors || []
    docenten.value = data.docenten || []
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
    await laadData()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function openBewerken(student) {
  bewerkStudent.value = student
  bewerkForm.value = {
    mentor_id: student.mentor_id || '',
    docent_id: student.docent_id || ''
  }
}

function annuleer() {
  bewerkStudent.value = null
  error.value = ''
}

async function opslaan() {
  error.value = ''
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://localhost:3000/api/gebruikers/koppeling/${bewerkStudent.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        mentor_id: bewerkForm.value.mentor_id || null,
        docent_id: bewerkForm.value.docent_id || null
      })
    })
    if (!res.ok) { error.value = 'Kon koppeling niet opslaan'; return }
    succes.value = `Koppeling bijgewerkt voor ${bewerkStudent.value.voornaam} ${bewerkStudent.value.achternaam}!`
    await laadData()
    bewerkStudent.value = null
    setTimeout(() => succes.value = '', 3000)
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
        <a @click="router.push('/admin/gebruikers')">Gebruikers</a>
        <a class="active">Koppelingen</a>
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
          <h1>Koppelingen beheren</h1>
          <p>Wijzig de mentor of docent van een student — ook tijdens een lopende stage</p>
        </div>
      </div>

      <div v-if="succes" class="succes-msg">{{ succes }}</div>
      <div v-if="error && !bewerkStudent" class="error-msg">{{ error }}</div>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else class="table-card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Mentor</th>
              <th>Docent</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in studenten" :key="s.id">
              <td><strong>{{ s.voornaam }} {{ s.achternaam }}</strong></td>
              <td>{{ s.email }}</td>
              <td>
                <span v-if="s.mentor_naam" class="badge blue">{{ s.mentor_naam }}</span>
                <span v-else class="badge gray">Geen mentor</span>
              </td>
              <td>
                <span v-if="s.docent_naam" class="badge green">{{ s.docent_naam }}</span>
                <span v-else class="badge gray">Geen docent</span>
              </td>
              <td>
                <button class="edit-btn" @click="openBewerken(s)">✏️ Wijzigen</button>
              </td>
            </tr>
            <tr v-if="studenten.length === 0">
              <td colspan="5" class="leeg">Geen studenten gevonden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="bewerkStudent" class="modal-overlay" @click.self="annuleer">
        <div class="modal">
          <button class="back-btn" @click="annuleer">← Terug</button>
          <h2>Koppeling wijzigen</h2>
          <p>Wijzig de mentor of docent van <strong>{{ bewerkStudent.voornaam }} {{ bewerkStudent.achternaam }}</strong>.</p>

          <div class="warning-banner">
            ⚠️ Let op — bij een wisseling midden in de stage worden de logboeken en evaluaties van de vorige mentor/docent bewaard. De nieuwe mentor/docent start vanaf nu.
          </div>

          <div class="form-group">
            <label>Mentor</label>
            <select v-model="bewerkForm.mentor_id">
              <option value="">— Geen mentor —</option>
              <option v-for="m in mentors" :key="m.id" :value="m.id">
                {{ m.voornaam }} {{ m.achternaam }} ({{ m.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Docent</label>
            <select v-model="bewerkForm.docent_id">
              <option value="">— Geen docent —</option>
              <option v-for="d in docenten" :key="d.id" :value="d.id">
                {{ d.voornaam }} {{ d.achternaam }} ({{ d.email }})
              </option>
            </select>
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
.page-header { margin-bottom: 24px; }
.page-header h1 { margin: 0; font-size: 28px; font-weight: 800; }
.page-header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
.loading { text-align: center; padding: 40px; color: #64748b; }
.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 18px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.badge { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge.blue { background: #dbeafe; color: #1d4ed8; }
.badge.green { background: #dcfce7; color: #15803d; }
.badge.gray { background: #f1f5f9; color: #64748b; }
.edit-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 6px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; }
.edit-btn:hover { background: #fef3c7; }
.leeg { text-align: center; color: #64748b; padding: 40px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal { background: white; border-radius: 20px; padding: 36px; width: 560px; max-width: 90vw; box-shadow: 0 24px 60px rgba(0,0,0,0.15); }
.back-btn { border: none; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 16px; }
.back-btn:hover { color: #991b1b; }
.modal h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
.modal > p { margin: 0 0 20px; color: #64748b; font-size: 14px; }
.warning-banner { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; padding: 14px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
.form-group select { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; }
.form-group select:focus { outline: none; border-color: #991b1b; box-shadow: 0 0 0 3px rgba(153,27,27,0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.annuleer-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn { border: none; background: #991b1b; color: white; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.opslaan-btn:hover { background: #7f1d1d; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-content { padding: 24px 20px; }
  table { display: block; overflow-x: auto; }
}
</style>