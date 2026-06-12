<template>
  <main class="commissie-page">
    <header class="topbar">
      <strong>Stage Monitor</strong>

      <nav>
        <a @click="router.push('/commissie/dashboard')">Dashboard</a>
        <a class="active">Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="profile">
        <div class="avatar">MD</div>
        <span>Marie Declercq</span>
      </div>
    </header>

    <section class="page-header">
      <button class="back-btn" @click="goBack">
        ← Terug naar voorstel
      </button>

      <h1>Aanpassingen vereist</h1>
      <p>Stagevoorstel van Sara De Vos — DataLab</p>

      <span class="badge purple">
        ● Aanpassingen vereist
      </span>
    </section>

    <section class="alert">
      ⚠ De student ontvangt een melding met jouw feedback en kan het voorstel aanpassen en opnieuw indienen.
    </section>

    <section class="student-card">
      <div class="avatar green-avatar">SD</div>

      <div>
        <h3>Sara De Vos</h3>
        <p>sara.devos@student.ehb.be • Toegepaste Informatica • 3e jaar</p>
        <p>Stage bij DataLab • 1 mrt - 31 mei 2026</p>
      </div>
    </section>

    <section class="feedback-card">
      <h2>Feedback voor de student</h2>

      <div class="field">
        <label>✕ Wat moet aangepast worden</label>
        <textarea v-model="feedback.aanpassen"></textarea>
      </div>

      <div class="field good">
        <label>✓ Wat reeds goed is</label>
        <textarea v-model="feedback.goed"></textarea>
      </div>

      <div class="field checklist">
        <label>☑ Vereiste aanpassingen</label>
        <textarea v-model="feedback.checklist"></textarea>
      </div>
    </section>

    <section class="deadline-section">
      <label>Deadline voor herindienen</label>
      <input v-model="feedback.deadline" type="date">
    </section>

    <section class="actions">
      <button class="cancel-btn" @click="goBack">
        Annuleren
      </button>

      <button class="send-btn" @click="sendFeedback">
        ✎ Feedback versturen naar student
      </button>
    </section>
  </main>
</template>