<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/administratie', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
  } catch (err) {
    console.error(err)
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

function voornaam() { return data.value?.user?.voornaam || 'Admin' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'A'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
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
        <a class="active" @click="router.push('/admin/dashboard')">Dashboard</a>
        <a @click="router.push('/admin/competenties')">Competenties</a>
        <a @click="router.push('/admin/gebruikers')">Gebruikers</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="hero">
      <p class="label">Administratieportaal</p>
      <h1>Welkom terug, {{ voornaam() }}</h1>
      <p class="subtitle">Beheer het stagesysteem en houd het overzicht</p>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Rol van de administratie</h2>
          <p>De administratie beheert enkel het competentieprofiel waarop stages worden geëvalueerd.</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Snelle acties</h2>
          <p>Beheer de belangrijkste onderdelen van het stagesysteem</p>
        </div>
      </div>
      <div class="actions">
        <div class="action-card" @click="router.push('/admin/competenties')">
          <div class="action-icon">🎯</div>
          <div>
            <h3>Competenties beheren</h3>
            <p>Bewerk profielen en gewichten</p>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Status</h2>
          <p>Overzicht van de huidige competentie-instellingen</p>
        </div>
      </div>
      <div class="status-row">
        <span>{{ data?.aantal_competenties || 0 }} actieve competenties</span>
        <span>Totaal gewicht 100%</span>
      </div>
    </section>
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
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.logout-btn:hover { background: #7f1d1d; }
.hero { margin: 40px 64px 28px; padding: 42px; border-radius: 24px; background: linear-gradient(135deg, #991b1b, #dc2626); color: white; box-shadow: 0 18px 40px rgba(153,27,27,0.22); }
.label { font-size: 13px; font-weight: 700; opacity: 0.9; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px; }
.hero h1 { font-size: 38px; margin: 0; font-weight: 800; }
.subtitle { margin-top: 10px; opacity: 0.9; }
.card { margin: 24px 64px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.card-header { padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
.card-header h2 { margin: 0; font-size: 18px; }
.card-header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
.actions { padding: 24px 28px; }
.action-card { width: 280px; border: 2px solid #991b1b; border-radius: 18px; padding: 22px; cursor: pointer; transition: 0.25s ease; display: flex; align-items: center; gap: 16px; }
.action-card:hover { background: #fff7f7; }
.action-icon { width: 44px; height: 44px; background: #fee2e2; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; }
.action-card h3 { margin: 0 0 6px; font-size: 16px; }
.action-card p { margin: 0; color: #64748b; font-size: 13px; }
.status-row { padding: 24px 28px; display: flex; gap: 30px; flex-wrap: wrap; }
.status-row span { font-weight: 600; color: #334155; }
.status-row span::before { content: "✓ "; color: #16a34a; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  .hero, .card { margin-left: 20px; margin-right: 20px; }
  .action-card { width: 100%; }
}
</style>