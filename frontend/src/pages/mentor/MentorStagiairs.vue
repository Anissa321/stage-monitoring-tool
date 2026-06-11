<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mentor = ref(null)
const studenten = ref([])
const loading = ref(true)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/mentor', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    mentor.value = data.user
    studenten.value = data.studenten || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function initialen(voornaam, achternaam) {
  return `${voornaam?.[0] || ''}${achternaam?.[0] || ''}`
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
</script>

<template>
  <main class="mentor-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/mentor/dashboard')">Dashboard</a>
        <a class="active">Stagiairs</a>
        <a @click="router.push('/mentor/logboek')">Logboeken</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen(mentor?.voornaam, mentor?.achternaam) }}</div>
      </div>
    </header>

    <div v-if="loading" class="loading">Laden...</div>

    <div v-else class="content">
      <h1>Mijn stagiairs</h1>
      <p class="subtitle">Studenten die jij begeleidt tijdens hun stage</p>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Stagiair</th>
              <th>Bedrijf</th>
              <th>Week</th>
              <th>Logboeken</th>
              <th>Laatste aftekening</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in studenten"
              :key="student.id"
              @click="router.push(`/mentor/student/${student.id}`)"
              class="student-row"
            >
              <td>
                <div class="student-cel">
                  <div class="avatar-small">{{ initialen(student.voornaam, student.achternaam) }}</div>
                  <strong>{{ student.voornaam }} {{ student.achternaam }}</strong>
                </div>
              </td>
              <td class="grijs">—</td>
              <td class="grijs">—</td>
              <td class="grijs">—</td>
              <td class="grijs">—</td>
              <td><span class="badge green">Op schema</span></td>
              <td class="arrow">→</td>
            </tr>
            <tr v-if="!studenten.length">
              <td colspan="7" class="leeg">Geen stagiairs gekoppeld.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; font-family: 'Inter', sans-serif; }

.mentor-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }

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

.loading { text-align: center; padding: 60px; color: #64748b; }

.content { padding: 40px 64px; }

.content h1 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }

.subtitle { margin: 0 0 28px; color: #64748b; font-size: 14px; }

.card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }

table { width: 100%; border-collapse: collapse; }

th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }

td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }

.student-row { cursor: pointer; transition: background 0.15s; }
.student-row:hover { background: #fafafa; }

.student-cel { display: flex; align-items: center; gap: 14px; }

.avatar-small { width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }

.grijs { color: #94a3b8; }

.arrow { color: #94a3b8; font-size: 18px; text-align: right; }

.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.green { background: #dcfce7; color: #15803d; }

.leeg { padding: 28px; color: #64748b; text-align: center; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 20px; }
  table { display: block; overflow-x: auto; }
}
</style>
