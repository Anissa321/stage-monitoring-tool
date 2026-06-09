<template>
  <main class="mentor-page">
    <header class="topbar">
      <div class="brand">
        <span class="logo">SM</span>
        <strong>Stage Monitor</strong>
      </div>

      <nav>
        <a class="active" href="#">Dashboard</a>
        <a href="#">Stagiairs</a>
        <a href="#">Logboeken</a>
        <a href="#">Evaluaties</a>
      </nav>

      <div class="profile">
        <span>Peter Mentor</span>
        <div class="avatar">PM</div>
      </div>
    </header>

    <section class="hero">
      <div>
        <p class="label">Stagementorportaal</p>
        <h1>Welkom terug, Peter 👋</h1>
        <p class="subtitle">Je begeleidt momenteel 1 student tijdens de stageperiode.</p>
      </div>

      <button class="primary-btn">Bekijk logboeken</button>
    </section>

    <section class="stats">
      <div class="stat-card">
        <span>Stagiairs</span>
        <strong>1</strong>
      </div>

      <div class="stat-card">
        <span>Open logboeken</span>
        <strong>3</strong>
      </div>

      <div class="stat-card">
        <span>Evaluaties</span>
        <strong>1</strong>
      </div>
    </section>

    <section class="content-card">
      <div class="section-header">
        <h2>Mijn stagiairs</h2>
        <p>Overzicht van studenten die jij begeleidt.</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Bedrijf</th>
            <th>Week</th>
            <th>Status</th>
            <th>Actie</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Anissa Canton</td>
            <td>Microsoft</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td><button class="small-btn">Bekijk</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="content-card">
      <div class="section-header">
        <h2>Recente logboeken</h2>
        <p>Logboeken die wachten op feedback of aftekening.</p>
      </div>

      <div class="logbook-list">
        <div class="logbook-item">
          <div class="icon">📘</div>

          <div>
            <strong>Week 12 - Anissa Canton</strong>
            <p>Nieuw logboek ingediend en klaar voor feedback.</p>
          </div>

          <button class="small-btn">Bekijk</button>
        </div>

        <div class="logbook-item">
          <div class="icon">📝</div>

          <div>
            <strong>Tussentijdse feedback</strong>
            <p>Feedbackmoment gepland voor deze week.</p>
          </div>

          <button class="small-btn">Open</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped>
.mentor-page {
  min-height: 100vh;
  background: #f4f6f8;
  color: #1f2937;
  font-family: Arial, sans-serif;
}

.topbar {
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 42px;
}

.brand,
.profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo,
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: grid;
  place-items: center;
  font-weight: 700;
}

nav {
  display: flex;
  gap: 32px;
}

nav a {
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
}

nav a.active {
  color: #2563eb;
}

.hero {
  margin: 38px 52px 24px;
  padding: 32px;
  background: #ffffff;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #2563eb;
  font-weight: 700;
  margin: 0 0 8px;
}

.hero h1 {
  font-size: 30px;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin-top: 8px;
}

.primary-btn,
.small-btn {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.primary-btn {
  background: #2563eb;
  color: white;
  padding: 12px 20px;
}

.stats {
  margin: 0 52px 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-card span {
  color: #6b7280;
  font-size: 14px;
}

.stat-card strong {
  font-size: 28px;
}

.content-card {
  margin: 0 52px 28px;
  background: white;
  border-radius: 18px;
  padding: 26px;
}

.section-header h2 {
  margin: 0;
}

.section-header p {
  margin-top: 6px;
  color: #6b7280;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 22px;
}

th,
td {
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #eef0f2;
}

th {
  color: #6b7280;
  font-size: 13px;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.green {
  background: #d1fae5;
  color: #065f46;
}

.small-btn {
  background: #eef2ff;
  color: #2563eb;
  padding: 9px 14px;
}

.logbook-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.logbook-item {
  display: grid;
  grid-template-columns: 46px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eef0f2;
  border-radius: 14px;
}

.logbook-item p {
  margin: 4px 0 0;
  color: #6b7280;
}

.icon {
  width: 42px;
  height: 42px;
  background: #eef2ff;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
</style>