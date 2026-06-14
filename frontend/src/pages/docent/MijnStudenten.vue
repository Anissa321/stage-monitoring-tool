<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/docent', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

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

function voornaam() { return data.value?.user?.voornaam || 'Docent' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'D'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}
function initiaalStudent(s) {
  return (s.voornaam?.[0] || '') + (s.achternaam?.[0] || '')
}

function gaNaarLogboek() {
  router.push('/docent/logboek')
}
</script>

<template>
  <main class="docent-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/docent/dashboard')">Dashboard</a>
        <a class="active" @click="router.push('/docent/studenten')">Stagiairs</a>
        <a @click="router.push('/docent/evaluaties')">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/docent/dashboard')">← Terug naar dashboard</a>
      <h1>Mijn stagiairs</h1>
      <p class="subtitle">Studenten die jij opvolgt tijdens hun stage</p>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else class="table-card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in data?.studenten || []" :key="student.id" class="student-row" @click="gaNaarLogboek">
              <td>
                <div class="student-cel">
                  <div class="avatar-small">{{ initiaalStudent(student) }}</div>
                  <strong>{{ student.voornaam }} {{ student.achternaam }}</strong>
                </div>
              </td>
              <td>{{ student.email }}</td>
              <td><button class="icon-btn" @click.stop="gaNaarLogboek">Bekijk logboeken →</button></td>
            </tr>
            <tr v-if="!data?.studenten?.length">
              <td colspan="3" class="leeg">Geen stagiairs gekoppeld.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.docent-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.logout-btn:hover { background: #7f1d1d; }

.content { padding: 40px 64px 52px; }
.back-link { color: #991b1b; text-decoration: none; font-size: 14px; font-weight: 600; cursor: pointer; }
.content h1 { margin: 14px 0 6px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0 0 28px; color: #64748b; font-size: 14px; }

.loading { text-align: center; padding: 60px; color: #64748b; }

.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.student-row { cursor: pointer; transition: background 0.15s; }
.student-row:hover { background: #fafafa; }
.student-cel { display: flex; align-items: center; gap: 14px; }
.avatar-small { width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }
.icon-btn { border: 1px solid #e2e8f0; background: white; color: #991b1b; padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 13px; transition: 0.2s; }
.icon-btn:hover { background: #991b1b; color: white; border-color: #991b1b; }
.leeg { padding: 28px; color: #64748b; text-align: center; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .content { padding: 24px 20px; }
  table { display: block; overflow-x: auto; }
}
</style>