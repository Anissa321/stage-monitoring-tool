<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/commissie')
}

function goToFeedback() {
  router.push('/commissie/feedback-geven')
}

function approveProposal() {
  alert('Stagevoorstel goedgekeurd')
}

function rejectProposal() {
  alert('Stagevoorstel afgekeurd')
}
</script>

<template>
  <main class="commissie-page">
    <header class="topbar">
      <strong>Stage Monitor</strong>

      <nav>
        <a>Dashboard</a>
        <a class="active">Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="profile">
        <div class="avatar">MD</div>
        <span>Marie Declercq</span>
      </div>
    </header>

      <section class="page-header">
      <button class="back-btn" @click="goBack">← Terug naar dashboard</button>
      <h1>Stagevoorstel beoordelen</h1>
      <p>Ingediend door Anissa Canton op 10 jan 2026</p>
      <span class="badge orange">● Wacht op beoordeling</span>
    </section>
 </main>
</template>