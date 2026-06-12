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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.commissie-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #111827;
}

.topbar {
  height: 72px;
  background: rgba(255,255,255,0.95);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar strong {
  color: #991b1b;
  font-weight: 800;
}

nav {
  display: flex;
  gap: 8px;
}

nav a {
  text-decoration: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
}

nav a:hover,
nav a.active {
  background: #fee2e2;
  color: #991b1b;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  color: #991b1b;
}
</style>