<template>
  <main class="mentor-page">
    <p class="page-label">Mentor Dashboard</p>

    <section class="dashboard-shell">
      <header class="topbar">
        <div class="brand">Stage Monitor</div>

        <nav>
          <a class="active">Dashboard</a>
          <a>Stagiairs</a>
          <a>Evaluaties</a>
        </nav>

        <div class="profile">
          <div class="avatar">SJ</div>
          <span>Sven Janssens ▾</span>
        </div>
      </header>

      <section class="hero">
        <h1>Welkom terug, Sven!</h1>
        <p>Acme Corp • Je begeleidt 2 stagiairs</p>
      </section>

      <section class="content">
        <h2>Mijn stagiairs</h2>

        <div class="student-grid">
          <article class="student-card">
            <div class="student-top">
              <div class="student-avatar blue">AC</div>

              <div>
                <h3>Anissa Canton</h3>
                <p>anissa.canton@student.ehb.be</p>
                <span class="badge green">● Op schema</span>
              </div>
            </div>

            <p class="meta">Stage: Acme Corp • Week 12/16</p>
            <p class="progress-text">Logboeken: 52/65</p>

            <div class="progress">
              <div class="progress-fill green-fill"></div>
            </div>

            <div class="card-actions">
              <button class="primary-btn">Bekijk logboeken</button>
              <button class="outline-btn">Evaluatie</button>
            </div>
          </article>

          <article class="student-card">
            <div class="student-top">
              <div class="student-avatar orange">TJ</div>

              <div>
                <h3>Tom Janssens</h3>
                <p>tom.janssens@student.ehb.be</p>
                <span class="badge orange-badge">⚠ Logboek mist</span>
              </div>
            </div>

            <p class="meta">Stage: TechBV • Week 12/16</p>
            <p class="progress-text">Logboeken: 48/65</p>

            <div class="progress">
              <div class="progress-fill orange-fill"></div>
            </div>

            <div class="card-actions">
              <button class="primary-btn">Bekijk logboeken</button>
              <button class="outline-btn">Evaluatie</button>
            </div>
          </article>
        </div>

        <section class="table-section">
          <h2>Logboeken te tekenen</h2>
          <p>5 logboeken wachten op jouw aftekening</p>

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
              <tr>
                <td>Anissa Canton</td>
                <td>Maandag 12 mei 2026</td>
                <td>Week 12</td>
                <td><span class="status-pill">Wacht op aftekening</span></td>
                <td><button class="link-btn">Aftekenen →</button></td>
              </tr>

              <tr>
                <td>Anissa Canton</td>
                <td>Dinsdag 13 mei 2026</td>
                <td>Week 12</td>
                <td><span class="status-pill">Wacht op aftekening</span></td>
                <td><button class="link-btn">Aftekenen →</button></td>
              </tr>

              <tr>
                <td>Tom Janssens</td>
                <td>Maandag 12 mei 2026</td>
                <td>Week 12</td>
                <td><span class="status-pill">Wacht op aftekening</span></td>
                <td><button class="link-btn">Aftekenen →</button></td>
              </tr>

              <tr>
                <td>Tom Janssens</td>
                <td>Dinsdag 13 mei 2026</td>
                <td>Week 12</td>
                <td><span class="status-pill">Wacht op aftekening</span></td>
                <td><button class="link-btn">Aftekenen →</button></td>
              </tr>

              <tr>
                <td>Anissa Canton</td>
                <td>Woensdag 14 mei 2026</td>
                <td>Week 12</td>
                <td><span class="status-pill">Wacht op aftekening</span></td>
                <td><button class="link-btn">Aftekenen →</button></td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped>
.mentor-page {
  min-height: 100vh;
  background: #1f1f1f;
  padding: 32px;
  font-family: Arial, sans-serif;
}

.page-label {
  color: #6b7280;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  margin-bottom: 22px;
}

.dashboard-shell {
  min-height: 860px;
  background: #f3f4f6;
}

.topbar {
  height: 64px;
  background: white;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 38px;
  border-bottom: 1px solid #e5e7eb;
}

.brand {
  font-weight: 800;
  color: #111827;
}

nav {
  display: flex;
  gap: 32px;
}

nav a {
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;
  padding: 23px 0;
  font-weight: 600;
}

nav a.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}

.profile {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111827;
  font-size: 13px;
}

.avatar,
.student-avatar {
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.avatar {
  width: 30px;
  height: 30px;
  background: #bbf7d0;
  color: #059669;
}

.hero {
  padding: 34px 48px 42px;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #111827;
}

.hero p,
.content > p,
.table-section p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.content {
  padding: 0 48px 48px;
}

.content h2,
.table-section h2 {
  margin: 0 0 16px;
  color: #111827;
  font-size: 20px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 54px;
  margin-bottom: 22px;
}

.student-card {
  background: white;
  border-radius: 12px;
  padding: 26px 32px 18px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.student-top {
  display: flex;
  gap: 20px;
  align-items: center;
}

.student-avatar {
  width: 54px;
  height: 54px;
}

.student-avatar.blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.student-avatar.orange {
  background: #fed7aa;
  color: #c2410c;
}

.student-card h3 {
  margin: 0;
  font-size: 17px;
  color: #111827;
}

.student-card p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 12px;
}

.badge {
  display: inline-block;
  margin-top: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.green {
  background: #dcfce7;
  color: #166534;
}

.orange-badge {
  background: #ffedd5;
  color: #9a3412;
}

.meta {
  margin-top: 24px !important;
  color: #111827 !important;
  font-size: 13px !important;
}

.progress-text {
  margin-top: 10px !important;
}

.progress {
  height: 7px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0 16px;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.green-fill {
  width: 80%;
  background: #10b981;
}

.orange-fill {
  width: 74%;
  background: #f59e0b;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.primary-btn,
.outline-btn {
  border-radius: 7px;
  padding: 10px 24px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn {
  border: none;
  background: #2563eb;
  color: white;
}

.outline-btn {
  border: 1px solid #cbd5e1;
  background: white;
  color: #111827;
}

.table-section {
  margin-top: 18px;
}

.table-section h2 {
  margin-bottom: 4px;
}

table {
  width: 100%;
  margin-top: 22px;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

th,
td {
  text-align: left;
  padding: 18px 40px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

th {
  text-transform: uppercase;
  color: #6b7280;
  font-size: 11px;
  background: #f9fafb;
}

td {
  color: #111827;
}

.status-pill {
  background: #fef3c7;
  color: #92400e;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.link-btn {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 900px) {
  .mentor-page {
    padding: 0;
  }

  .topbar {
    grid-template-columns: 1fr auto;
  }

  nav {
    display: none;
  }

  .student-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}
</style>