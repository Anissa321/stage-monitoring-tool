<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mentor = ref(null)
const loading = ref(true)

// Mock data — later vervangen door API
// status: 'in_behandeling' | 'evaluatie_locked' | 'afgerond'
const evaluaties = ref([
  {
    student_id: 'a572e332-a1f4-4811-810a-11684b2d0f41',
    student_naam: 'Anissa Canton',
    bedrijf: 'Acme Corp',
    tussentijds_score: '14 / 20',
    eindscore: 'Nog op stage bezig',
    status: 'in_behandeling'
  },
  {
    student_id: 'b1234567-aaaa-bbbb-cccc-d1234567ef89',
    student_naam: 'Tom Janssens',
    bedrijf: 'TechSol',
    tussentijds_score: '—',
    eindscore: '—',
    status: 'evaluatie_locked'
  }
])

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    mentor.value = data.user
    // TODO: fetch evaluaties van eigen stagiairs
    // const evalRes = await fetch('http://localhost:3000/api/evaluaties/mentor', {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // evaluaties.value = await evalRes.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function initialen(naam) {
  const delen = naam.split(' ')
  return (delen[0]?.[0] || '') + (delen[1]?.[0] || '')
}

function statusLabel(status) {
  if (status === 'in_behandeling') return '⏳ In behandeling'
  if (status === 'evaluatie_locked') return '🔒 Evaluatie locked'
  if (status === 'afgerond') return '✓ Afgerond'
  return status
}

function statusKlasse(status) {
  if (status === 'in_behandeling') return 'badge oranje'
  if (status === 'evaluatie_locked') return 'badge rood'
  if (status === 'afgerond') return 'badge groen'
  return 'badge'
}

function gaNaarEvaluatie(item) {
  router.push(`/mentor/student/${item.student_id}/eindevaluatie`)
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
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
      <h1>Evaluaties</h1>
      <p class="subtitle">Status van evaluaties per stagiair</p>

      <div v-if="loading" class="loading">Laden...</div>

      <div v-else class="table-card">
        <table>
          <thead>
            <tr>
              <th>Stagiair</th>
              <th>Bedrijf</th>
              <th>Tussentijds</th>
              <th>Eindscore</th>
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
              <td>{{ item.eindscore }}</td>
              <td><span :class="statusKlasse(item.status)">{{ statusLabel(item.status) }}</span></td>
              <td class="cel-arrow">→</td>
            </tr>
            <tr v-if="!evaluaties.length">
              <td colspan="6" class="leeg">Geen stagiairs gekoppeld.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
