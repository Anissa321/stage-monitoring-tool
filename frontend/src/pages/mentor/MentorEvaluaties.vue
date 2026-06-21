<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mentor = ref(null)
const loading = ref(true)
const error = ref('')
const evaluaties = ref([])

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [meRes, evalRes] = await Promise.all([
      fetch('http://10.2.160.246:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://10.2.160.246:3000/api/tussentijdse-evaluaties/mentor', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    const meData = await meRes.json()
    mentor.value = meData.user

    const evalData = await evalRes.json()
    if (!evalRes.ok) {
      error.value = evalData.error || 'Kon evaluaties niet ophalen'
      return
    }
    evaluaties.value = evalData.studenten || []
  } catch (err) {
    console.error(err)
    error.value = 'Verbindingsfout met server.'
  } finally {
    loading.value = false
  }
})

function initialen(naam) {
  const delen = naam.split(' ')
  return (delen[0]?.[0] || '') + (delen[1]?.[0] || '')
}

function statusLabel(status) {
  if (status === 'nog_niet_gestart') return '⏳ Nog niet gestart'
  if (status === 'ingediend') return '✓ Ingediend'
  return status
}

function statusKlasse(status) {
  if (status === 'nog_niet_gestart') return 'badge oranje'
  if (status === 'ingediend') return 'badge groen'
  return 'badge'
}

function gaNaarEvaluatie(item) {
  router.push(`/mentor/student/${item.student_id}/feedback`)
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://10.2.160.246:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {}
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
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
        <a @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a class="active" @click="router.push('/mentor/evaluaties')">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/mentor/evaluaties')">← Terug naar evaluatie-overzicht</a>
      <h1>Tussentijdse evaluaties</h1>
      <p class="subtitle">Status van tussentijdse evaluaties per stagiair</p>

      <div v-if="loading" class="loading">Laden...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <div v-else class="table-card">
        <table>
          <thead>
            <tr>
              <th>Stagiair</th>
              <th>Bedrijf</th>
              <th>Tussentijds</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in evaluaties" :key="item.student_id" class="eval-row" @click="gaNaarEvaluatie(item)">
              <td>
                <div class="student-cel">
                  <div class="avatar-small">{{ initialen(item.student_naam) }}</div>
                  <strong>{{ item.student_naam }}</strong>
                </div>
              </td>
              <td>{{ item.bedrijf }}</td>
              <td>{{ item.tussentijds_score }}</td>
              <td><span :class="statusKlasse(item.status)">{{ statusLabel(item.status) }}</span></td>
              <td class="cel-arrow">→</td>
            </tr>
            <tr v-if="!evaluaties.length">
              <td colspan="5" class="leeg">Geen stagiairs gekoppeld.</td>
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
.page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.content { padding: 40px 64px 52px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0 0 28px; color: #64748b; font-size: 14px; }

.loading { text-align: center; padding: 60px; color: #64748b; }
.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; }

.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.eval-row { cursor: pointer; transition: background 0.15s; }
.eval-row:hover { background: #fafafa; }
.student-cel { display: flex; align-items: center; gap: 14px; }
.avatar-small { width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }
.cel-arrow { color: #cbd5e1; font-weight: 700; text-align: right; }

.badge { padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.badge.oranje { background: #fef3c7; color: #b45309; }
.badge.groen { background: #dcfce7; color: #15803d; }

.leeg { padding: 28px; color: #64748b; text-align: center; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .content { padding: 24px 20px; }
  table { display: block; overflow-x: auto; }
}
</style>