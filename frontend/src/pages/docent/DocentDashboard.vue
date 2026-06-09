<template>
  <main class="docent-page">
    <header class="topbar">
      <strong>🎓 Stage Monitor</strong>

      <nav>
        <a href="#">Dashboard</a>
        <a href="#">Studenten</a>
        <a href="#">Evaluaties</a>
      </nav>

      <span>👤 Jan</span>
    </header>

    <section class="welcome">
      <h1>Welkom terug, Jan! 👋</h1>
      <p>Je begeleidt 8 studenten dit semester</p>
    </section>

    <section class="section">
      <h2>Mijn studenten</h2>

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
            <td>Acme Corp</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td>→</td>
          </tr>

          <tr>
            <td>Tom Janssens</td>
            <td>TechBV</td>
            <td>Week 12 / 16</td>
            <td><span class="badge orange">Logboek mist</span></td>
            <td>→</td>
          </tr>

          <tr>
            <td>Sara De Vos</td>
            <td>DataLab</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td>→</td>
          </tr>

          <tr>
            <td>Mohammed El Idrissi</td>
            <td>WebStudio</td>
            <td>Week 12 / 16</td>
            <td><span class="badge red">Achterstand</span></td>
            <td>→</td>
          </tr>

          <tr>
            <td>Emma Peeters</td>
            <td>InnovateBE</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td>→</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>Aankomende afspraken</h2>

      <div class="appointments">
        <div class="appointment">
          <div class="icon">📅</div>
          <div>
            <strong>Tussentijdse bespreking — Anissa Canton</strong>
            <p>15 mei 2026 — 14:00</p>
          </div>
          <button>Bekijk</button>
        </div>

        <div class="appointment">
          <div class="icon">🎓</div>
          <div>
            <strong>Eindpresentatie — Tom Janssens</strong>
            <p>20 mei 2026 — 10:00</p>
          </div>
          <button>Bekijk</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.docent-page {
  min-height: 100vh;
  background: #f4f5f7;
  color: #1f2937;
}

.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}

nav {
  display: flex;
  gap: 36px;
}

nav a {
  text-decoration: none;
  color: #4b5563;
  font-size: 14px;
}

nav a:first-child {
  color: #2563eb;
  font-weight: 700;
}

.welcome,
.section {
  margin: 36px 52px;
}

.welcome h1 {
  margin: 0;
  font-size: 28px;
}

.welcome p {
  margin-top: 6px;
  color: #6b7280;
}

.section h2 {
  margin-bottom: 16px;
}

table {
  width: 100%;
  background: white;
  border-radius: 12px;
  border-collapse: collapse;
  overflow: hidden;
}

th,
td {
  padding: 18px 22px;
  text-align: left;
  border-bottom: 1px solid #f1f1f1;
}

th {
  color: #6b7280;
  font-size: 13px;
}

.badge {
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}

.green {
  background: #d1fae5;
  color: #065f46;
}

.orange {
  background: #fef3c7;
  color: #92400e;
}

.red {
  background: #fee2e2;
  color: #991b1b;
}

.appointments {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.appointment {
  display: grid;
  grid-template-columns: 48px 1fr 90px;
  align-items: center;
  gap: 18px;
  padding: 12px;
}

.appointment p {
  margin: 4px 0 0;
  color: #6b7280;
}

.icon {
  width: 40px;
  height: 40px;
  background: #eef2ff;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

button {
  border: none;
  background: #f3f4f6;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}
</style>