<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const docent = ref(null)
const loading = ref(true)
const actievTab = ref('tussentijds')
const studenten = ref([])

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const [meRes, studentenRes] = await Promise.all([
      fetch('http://10.2.160.246:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://10.2.160.246:3000/api/dashboards/docent', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    const meData = await meRes.json()
    docent.value = meData.user

    const studentenData = await studentenRes.json()
    const studentenLijst = studentenData.studenten || []

    // Haal voor elke student de tussentijdse evaluatie + rapport op
    const verrijkt = await Promise.all(studentenLijst.map(async s => {
      const [mentorEvalRes, rapportRes] = await Promise.all([
        fetch(`http://10.2.160.246:3000/api/tussentijdse-evaluaties/student/${s.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://10.2.160.246:3000/api/tussentijdse-rapporten/student/${s.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      const mentorEval = await mentorEvalRes.json()
      const rapport = await rapportRes.json()

      return {
        ...s,
        mentor_score: mentorEval.evaluatie?.totaal_score ?? null,
        rapport_score: rapport.rapport?.totaal_score ?? null,
        rapport_status: rapport.rapport?.status ?? null
      }
    }))

    studenten.value = verrijkt
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function initialen(s) {
  return (s.voornaam?.[0] || '') + (s.achternaam?.[0] || '')
}

function tussentijdsStatus(s) {
  if (s.rapport_status === 'ingediend') return { label: '✓ Rapport klaar', klasse: 'badge groen' }
  if (s.mentor_score !== null) return { label: '⏳ Wacht op rapport', klasse: 'badge oranje' }
  return { label: '— Nog niet gestart', klasse: 'badge grijs' }
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
        <a @click="router.push('/docent/dashboard')">Dashboard</a>
        <a @click="router.push('/docent/studenten')">Studenten</a>
        <a class="active">Evaluaties</a>
      </nav>
      <div class="profile">
        <span>{{ docent?.voornaam || 'Docent' }}</span>
      </div>
    </header>

    <section class="content">
      <h1>Evaluaties</h1>
      <p class="subtitle">Beheer tussentijdse en eindevaluaties van je studenten</p>

      <!-- Tabbladen -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ actief: actievTab === 'tussentijds' }"
          @click="actievTab = 'tussentijds'"
        >
          📋 Tussentijdse evaluatie
        </button>
        <button
          class="tab"
          :class="{ actief: actievTab === 'eind' }"
          @click="actievTab = 'eind'"
        >
          🎓 Eindevaluatie
        </button>
      </div>

      <div v-if="loading" class="loading">Laden...</div>

      <!-- TUSSENTIJDSE TAB -->
      <div v-else-if="actievTab === 'tussentijds'">
        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score mentor</th>
                <th>Rapport score</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in studenten" :key="s.id" class="eval-row">
                <td>
                  <div class="student-cel">
                    <div class="avatar-small">{{ initialen(s) }}</div>
                    <strong>{{ s.voornaam }} {{ s.achternaam }}</strong>
                  </div>
                </td>
                <td>
                  <span v-if="s.mentor_score !== null" class="score-badge">{{ s.mentor_score }} ptn</span>
                  <span v-else class="nog-geen">—</span>
                </td>
                <td>
                  <span v-if="s.rapport_score !== null" class="score-badge groen">{{ s.rapport_score }} ptn</span>
                  <span v-else class="nog-geen">—</span>
                </td>
                <td>
                  <span :class="tussentijdsStatus(s).klasse">{{ tussentijdsStatus(s).label }}</span>
                </td>
                <td class="cel-acties">
                  <button
                    class="actie-btn"
                    @click="router.push(`/docent/studenten/${s.id}/bespreking`)"
                  >
                    Bekijk evaluatie →
                  </button>
                  <button
                    class="actie-btn groen"
                    @click="router.push(`/docent/studenten/${s.id}/tussentijds-rapport`)"
                  >
                    {{ s.rapport_status === 'ingediend' ? 'Rapport bekijken' : 'Rapport opstellen' }} →
                  </button>
                </td>
              </tr>
              <tr v-if="!studenten.length">
                <td colspan="5" class="leeg">Geen studenten gekoppeld.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EINDEVALUATIE TAB -->
      <div v-else-if="actievTab === 'eind'">
        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in studenten" :key="s.id" class="eval-row">
                <td>
                  <div class="student-cel">
                    <div class="avatar-small">{{ initialen(s) }}</div>
                    <strong>{{ s.voornaam }} {{ s.achternaam }}</strong>
                  </div>
                </td>
                <td>
                  <span class="badge oranje">⏳ Nog niet beschikbaar</span>
                </td>
                <td class="cel-acties">
                  <button
                    class="actie-btn"
                    @click="router.push(`/docent/studenten/${s.id}/eindrapport`)"
                  >
                    Bekijk eindrapport →
                  </button>
                </td>
              </tr>
              <tr v-if="!studenten.length">
                <td colspan="3" class="leeg">Geen studenten gekoppeld.</td>
              </tr>
            </tbody>
          </table>
        </div>
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
.profile { font-size: 14px; font-weight: 600; color: #334155; }

.content { padding: 40px 64px 52px; }
.content h1 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tab { padding: 10px 20px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.tab:hover { background: #f8fafc; }
.tab.actief { background: #991b1b; color: white; border-color: #991b1b; }

.loading { text-align: center; padding: 60px; color: #64748b; }

.table-card { background: white; border-radius: 22px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 14px 30px rgba(15,23,42,0.05); }
table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.7px; padding: 16px 28px; }
td { padding: 18px 28px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.eval-row { transition: background 0.15s; }
.eval-row:hover { background: #fafafa; }
.student-cel { display: flex; align-items: center; gap: 14px; }
.avatar-small { width: 38px; height: 38px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; display: grid; place-items: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }
.cel-acties { display: flex; gap: 8px; justify-content: flex-end; }

.badge { padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.badge.oranje { background: #fef3c7; color: #b45309; }
.badge.groen { background: #dcfce7; color: #15803d; }
.badge.grijs { background: #f1f5f9; color: #64748b; }

.score-badge { background: #fef2f2; color: #991b1b; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.score-badge.groen { background: #dcfce7; color: #15803d; }
.nog-geen { color: #cbd5e1; font-weight: 600; }

.actie-btn { border: 1px solid #e5e7eb; background: white; color: #334155; padding: 7px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 13px; white-space: nowrap; }
.actie-btn:hover { background: #f8fafc; }
.actie-btn.groen { border-color: #15803d; color: #15803d; }
.actie-btn.groen:hover { background: #f0fdf4; }

.leeg { padding: 28px; color: #64748b; text-align: center; }

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 20px; }
  table { display: block; overflow-x: auto; }
  .cel-acties { flex-direction: column; }
}
</style>