<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/mentor', {
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

function voornaam() { return data.value?.user?.voornaam || 'Mentor' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'M'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}
function initiaalStudent(s) {
  return (s.voornaam?.[0] || '') + (s.achternaam?.[0] || '')
}
function formatDatum(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function goToStudentDetail(studentId) {
  router.push(`/mentor/student/${studentId}`)
}

function goToAftekenen(logboek) {
  router.push(`/mentor/week/${logboek.student_id}/${logboek.week_number}`)
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
        <a class="active">Dashboard</a>
        <a @click="router.push('/mentor/stagiairs')">Stagiairs</a>
        <a @click="router.push('/mentor/dashboard')">Logboeken</a>
        <a>Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="hero">
      <p class="label">Mentor Dashboard</p>
      <h1>Welkom terug, {{ voornaam() }}</h1>
      <p>Je begeleidt {{ data?.studenten?.length || 0 }} stagiairs</p>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Mijn stagiairs</h2>
          <p>Overzicht van studenten die jij begeleidt tijdens hun stage</p>
        </div>
      </div>
      <div class="student-grid">
        <article
          v-for="student in data?.studenten || []"
          :key="student.id"
          class="student-card"
          @click="goToStudentDetail(student.id)"
        >
          <div class="student-top">
            <div class="student-avatar blue">{{ initiaalStudent(student) }}</div>
            <div>
              <h3>{{ student.voornaam }} {{ student.achternaam }}</h3>
              <p>{{ student.email }}</p>
            </div>
          </div>
          <div class="card-actions" @click.stop>
            <button class="primary-btn" @click="goToAftekenen({ student_id: student.id, week_number: data?.logboeken_te_aftekenen?.find(l => l.student_id === student.id)?.week_number || 13 })">
              Bekijk logboeken
            </button>
            <button class="secondary-btn">Evaluatie</button>
          </div>
        </article>
        <p v-if="!data?.studenten?.length" style="padding: 28px; color: #64748b;">Geen stagiairs gekoppeld.</p>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Logboeken te tekenen</h2>
          <p>{{ data?.logboeken_te_aftekenen?.length || 0 }} logboeken wachten op jouw aftekening</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Datum</th>
            <th>Week</th>
            <th>Status</th>
            <th>Actie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="logboek in data?.logboeken_te_aftekenen || []" :key="logboek.id">
            <td class="name">{{ logboek.student_naam }}</td>
            <td>{{ formatDatum(logboek.datum) }}</td>
            <td>Week {{ logboek.week_number }}</td>
            <td><span class="badge orange">Wacht op aftekening</span></td>
            <td><button class="icon-btn" @click="goToAftekenen(logboek)">Aftekenen</button></td>
          </tr>
          <tr v-if="!data?.logboeken_te_aftekenen?.length">
            <td colspan="5" style="padding: 28px; color: #64748b;">Geen logboeken te aftekenen.</td>
          </tr>
        </tbody>
      </table>
    </section>
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
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.logout-btn:hover { background: #7f1d1d; }
.hero { margin: 40px 64px 28px; padding: 42px; border-radius: 24px; background: linear-gradient(135deg, #991b1b, #dc2626); color: white; box-shadow: 0 18px 40px rgba(153,27,27,0.22); }
.label { font-size: 13px; font-weight: 700; opacity: 0.9; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px; }
.hero h1 { font-size: 38px; margin: 0 0 8px; font-weight: 800; }
.hero p { margin: 0; opacity: 0.9; }
.card { margin: 24px 64px; background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
.card-header { padding: 24px 28px; border-bottom: 1px solid #f1f5f9; }
.card-header h2 { margin: 0; font-size: 18px; }
.card-header p { margin: 6px 0 0; color: #64748b; font-size: 14px; }
.student-grid { padding: 28px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
.student-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 24px;
  background: #ffffff;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
}
.student-card:hover {
  box-shadow: 0 12px 32px rgba(153, 27, 27, 0.12);
  border-color: #991b1b;
  transform: translateY(-2px);
}
.student-top { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
.student-avatar { width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; }
.blue { background: #dbeafe; color: #1d4ed8; }
.student-card h3 { margin: 0; font-size: 16px; }
.student-card p { margin: 4px 0; color: #64748b; font-size: 13px; }
.card-actions { display: flex; justify-content: flex-end; gap: 12px; }
.primary-btn, .secondary-btn, .icon-btn { border: 1px solid #e2e8f0; padding: 9px 15px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.primary-btn { background: #991b1b; color: white; border-color: #991b1b; }
.secondary-btn, .icon-btn { background: white; color: #334155; }
.primary-btn:hover, .secondary-btn:hover, .icon-btn:hover { background: #7f1d1d; color: white; border-color: #7f1d1d; }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.name { font-weight: 700; color: #0f172a; }
.badge { padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.orange { background: #fef3c7; color: #b45309; }
@media (max-width: 900px) {
  .topbar { padding: 0 20px; } nav { display: none; }
  .hero, .card { margin-left: 20px; margin-right: 20px; }
  .student-grid { grid-template-columns: 1fr; }
  table { display: block; overflow-x: auto; }
}
</style>