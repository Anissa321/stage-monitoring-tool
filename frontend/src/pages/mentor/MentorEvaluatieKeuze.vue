<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mentor = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://10.2.160.246:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    mentor.value = data.user
  } catch (err) {
    console.error(err)
  }
})

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
        <a class="active">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ mentor?.voornaam }} {{ mentor?.achternaam }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
      </div>
    </header>

    <section class="content">
      <h1>Evaluaties</h1>
      <p class="subtitle">Kies welk type evaluatie je wil bekijken of invullen</p>

      <div class="kaarten">
        <article class="keuze-kaart" @click="router.push('/mentor/evaluaties/tussentijds')">
          <div class="kaart-icoon">📋</div>
          <h2>Tussentijdse evaluatie</h2>
          <p>Bekijk je stagiairs en hun tussentijdse evaluatiestatus, of vul een nieuwe evaluatie in.</p>
          <span class="kaart-link">Bekijken →</span>
        </article>

        <article class="keuze-kaart" @click="router.push('/mentor/evaluaties/eind')">
          <div class="kaart-icoon">🏁</div>
          <h2>Eindevaluatie</h2>
          <p>Eindevaluatie van je stagiairs.</p>
          <span class="kaart-link">Bekijken →</span>
        </article>
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

.content { max-width: 900px; margin: 0 auto; padding: 40px 24px 60px; }
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