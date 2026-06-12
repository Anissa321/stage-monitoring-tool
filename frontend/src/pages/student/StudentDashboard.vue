<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/student', {
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

function voornaam() { return data.value?.user?.voornaam || 'Student' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'S'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}
</script>

<template>
  <main class="student-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a class="active" @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="welcome">
      <h1>Welkom, {{ voornaam() }}!</h1>
      <div class="underline"></div>
    </section>

    <section v-if="data?.stage" class="start-card">
      <div class="rocket">🎓</div>
      <h2>Je stage is bezig!</h2>
      <p>{{ data.stage.company_name }} • {{ data.stage.start_date }} — {{ data.stage.end_date }}</p>
      <button class="primary-btn" @click="router.push('/student/logboek')">Ga naar logboek</button>
    </section>

    <section v-else class="start-card">
      <div class="rocket">🚀</div>
      <h2>Klaar om je stage te starten?</h2>
      <p>Dien je stagevoorstel in en de stagecommissie zal het beoordelen binnen 5 werkdagen.</p>
      <button class="primary-btn" @click="router.push('/student/stagevoorstel')">Stagevoorstel indienen</button>
    </section>

    <section class="steps-section">
      <h2>Zo verloopt je stage</h2>
      <div class="steps">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>Indienen</h3>
          <p>Vul je stagevoorstel in en bezorg het ter goedkeuring.</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3>Beoordeling</h3>
          <p>De stagecommissie beoordeelt binnen 5 werkdagen.</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3>Overeenkomst</h3>
          <p>Upload de ondertekende stageovereenkomst.</p>
        </div>
        <div class="step-card">
          <div class="step-number">4</div>
          <h3>Stage loopt</h3>
          <p>Hou wekelijks je logboek bij tijdens je stage.</p>
        </div>
        <div class="step-card">
          <div class="step-number">5</div>
          <h3>Evaluatie</h3>
          <p>Ontvang feedback en scores per competentie.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.student-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #111827; }
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
.welcome { margin: 40px 64px 24px; }
.welcome h1 { margin: 0; font-size: 28px; font-weight: 800; }
.underline { width: 110px; height: 5px; background: #991b1b; border-radius: 999px; margin-top: 10px; }
.start-card { margin: 0 64px 34px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; box-shadow: 0 14px 30px rgba(15,23,42,0.05); min-height: 210px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 34px; }
.rocket { width: 54px; height: 54px; background: #fee2e2; border-radius: 50%; display: grid; place-items: center; font-size: 24px; margin-bottom: 16px; }
.start-card h2 { margin: 0 0 8px; font-size: 20px; font-weight: 800; }
.start-card p { margin: 0 0 20px; color: #64748b; font-size: 14px; }
.primary-btn { border: none; background: #991b1b; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s ease; }
.primary-btn:hover { background: #7f1d1d; }
.steps-section { margin: 0 64px 40px; }
.steps-section h2 { font-size: 18px; margin-bottom: 18px; }
.steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
.step-card { background: white; border-radius: 18px; border: 1px solid #e5e7eb; padding: 22px; box-shadow: 0 14px 30px rgba(15,23,42,0.05); transition: 0.25s ease; }
.step-card:hover { transform: translateY(-4px); box-shadow: 0 18px 35px rgba(15,23,42,0.08); }
.step-number { width: 32px; height: 32px; background: #991b1b; color: white; border-radius: 50%; display: grid; place-items: center; font-weight: 800; margin-bottom: 14px; }
.step-card h3 { margin: 0 0 8px; font-size: 15px; }
.step-card p { margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; }
@media (max-width: 1000px) {
  .steps { grid-template-columns: repeat(2, 1fr); }
  .topbar { padding: 0 20px; }
  .welcome, .start-card, .steps-section { margin-left: 20px; margin-right: 20px; }
}
</style>