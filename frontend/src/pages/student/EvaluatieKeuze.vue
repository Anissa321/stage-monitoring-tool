<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://10.2.160.246:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    user.value = data.user
  } catch (err) {
    console.error(err)
  }
})

function voornaam() { return user.value?.voornaam || 'Student' }
function initialen() {
  if (!user.value) return 'S'
  return (user.value.voornaam?.[0] || '') + (user.value.achternaam?.[0] || '')
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
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a class="active">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/student/dashboard')">← Terug naar dashboard</a>
      <h1>Evaluatie</h1>
      <p class="subtitle">Kies welk type evaluatie je wil bekijken</p>

      <div class="kaarten">
        <article class="keuze-kaart" @click="router.push('/student/evaluatie/tussentijds')">
          <div class="kaart-icoon">📋</div>
          <h2>Tussentijdse evaluatie</h2>
          <p>Bekijk de beoordeling van je mentor, vul je zelfevaluatie in en bekijk het finale rapport van je docent.</p>
          <span class="kaart-link">Bekijken →</span>
        </article>

        <article class="keuze-kaart" @click="router.push('/student/eindrapport')">
          <div class="kaart-icoon">🏁</div>
          <h2>Eindevaluatie</h2>
          <p>Bekijk je finale stagebeoordeling met totaalscore, competentiescores en eindresultaat.</p>
          <span class="kaart-link">Bekijken →</span>
        </article>
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
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.content { max-width: 900px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0 0 32px; color: #64748b; font-size: 14px; }

.kaarten { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.keuze-kaart { background: white; border: 1px solid #e5e7eb; border-radius: 20px; padding: 28px; cursor: pointer; box-shadow: 0 8px 20px rgba(15,23,42,0.04); transition: 0.2s; }
.keuze-kaart:hover { box-shadow: 0 14px 30px rgba(15,23,42,0.1); transform: translateY(-2px); border-color: #991b1b; }

.kaart-icoon { width: 52px; height: 52px; border-radius: 16px; background: #fee2e2; display: grid; place-items: center; font-size: 24px; margin-bottom: 16px; }
.keuze-kaart h2 { margin: 0 0 10px; font-size: 19px; font-weight: 800; }
.keuze-kaart p { margin: 0 0 18px; color: #64748b; font-size: 13px; line-height: 1.6; }
.kaart-link { color: #991b1b; font-weight: 700; font-size: 14px; }

@media (max-width: 700px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 16px 40px; }
  .kaarten { grid-template-columns: 1fr; }
}
</style>