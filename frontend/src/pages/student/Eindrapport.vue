<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const rapport = ref({
  student: 'Anissa Canton',
  bedrijf: 'Acme Corp',
  periode: 'februari – april 2026',
  score: 16,
  aanwezigheid: 97,
  logboeken: '63 / 65 dagen',
  eindpresentatie: '17 / 20',
  beoordeling: 'Uitstekend',
  docent: 'Jan De Vries',
  mentor: 'Sven Janssens'
})

const geslaagd = computed(() => rapport.value.score >= 10)

function goBack() {
  router.push('/student/dashboard')
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
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a>Logboek</a>
        <a>Documenten</a>
        <a class="active">Evaluatie</a>
      </nav>

      <div class="profile">
        <span>{{ rapport.student }}</span>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="goBack">← Terug naar dashboard</button>

      <div class="title-row">
        <div>
          <h1>Mijn eindrapport</h1>
          <p>Stage afgerond bij {{ rapport.bedrijf }} • {{ rapport.periode }}</p>
        </div>

        <span :class="['status-badge', geslaagd ? 'green' : 'red']">
          {{ geslaagd ? '✓ Afgerond' : '× Niet geslaagd' }}
        </span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.student-page {
  min-height: 100vh;
}
</style>