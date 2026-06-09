<template>
  <main class="docent-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a class="active">Dashboard</a>
        <a>Studenten</a>
        <a>Evaluaties</a>
      </nav>

      <div class="profile">
        <span>Jan De Vries</span>
        <div class="avatar">JD</div>
      </div>
    </header>

    <section class="hero">
      <p class="label">Docentenportaal</p>
      <h1>Welkom terug, Jan</h1>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Mijn studenten</h2>
          <p>Overzicht van de stagevoortgang</p>
        </div>
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
            <td class="name">Anissa Canton</td>
            <td>Acme Corp</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td><button class="icon-btn">Bekijk</button></td>
          </tr>

          <tr>
            <td class="name">Tom Janssens</td>
            <td>TechBV</td>
            <td>Week 12 / 16</td>
            <td><span class="badge orange">Logboek mist</span></td>
            <td><button class="icon-btn">Bekijk</button></td>
          </tr>

          <tr>
            <td class="name">Sara De Vos</td>
            <td>DataLab</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td><button class="icon-btn">Bekijk</button></td>
          </tr>

          <tr>
            <td class="name">Mohammed El Idrissi</td>
            <td>WebStudio</td>
            <td>Week 12 / 16</td>
            <td><span class="badge red">Achterstand</span></td>
            <td><button class="icon-btn">Bekijk</button></td>
          </tr>

          <tr>
            <td class="name">Emma Peeters</td>
            <td>InnovateBE</td>
            <td>Week 12 / 16</td>
            <td><span class="badge green">Op schema</span></td>
            <td><button class="icon-btn">Bekijk</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Aankomende afspraken</h2>
          <p>Geplande besprekingen en presentaties</p>
        </div>
      </div>

      <div class="appointments">
        <div class="appointment">
          <div class="date-box">
            <strong>15</strong>
            <span>MEI</span>
          </div>

          <div class="appt-info">
            <h3>Tussentijdse bespreking — Anissa Canton</h3>
            <p>14:00 · Online / lokaal overleg</p>
          </div>

          <button class="secondary-btn">Bekijk</button>
        </div>

        <div class="appointment">
          <div class="date-box">
            <strong>20</strong>
            <span>MEI</span>
          </div>

          <div class="appt-info">
            <h3>Eindpresentatie — Tom Janssens</h3>
            <p>10:00 · Eindbeoordeling stage</p>
          </div>

          <button class="secondary-btn">Bekijk</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.docent-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #111827;
}

/* Topbar */
.topbar {
  height: 72px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  color: #991b1b;
}

.logo-circle {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #991b1b;
  color: white;
  display: grid;
  place-items: center;
  font-size: 13px;
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
  transition: 0.2s ease;
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
  font-size: 13px;
}

/* Hero */
.hero {
  margin: 40px 64px 28px;
  padding: 42px;
  border-radius: 24px;
  background: linear-gradient(135deg, #991b1b, #dc2626);
  color: white;
  box-shadow: 0 18px 40px rgba(153, 27, 27, 0.22);
}

.label {
  font-size: 13px;
  font-weight: 700;
  opacity: 0.9;
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero h1 {
  font-size: 38px;
  margin: 0;
  font-weight: 800;
}

/* Cards */
.card {
  margin: 24px 64px;
  background: white;
  border-radius: 22px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.05);
}

.card-header {
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.card-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  color: #94a3b8;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  padding: 16px 28px;
}

td {
  padding: 20px 28px;
  border-top: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
  transition: 0.25s ease;
}

tbody tr {
  cursor: pointer;
  transition: 0.25s ease;
}

tbody tr:hover {
  background: #fafafa;
  transform: scale(1.002);
  box-shadow: inset 5px 0 0 #991b1b;
}

tbody tr:hover td {
  color: #111827;
  background: #fafafa;
}

.name {
  font-weight: 700;
  color: #0f172a;
}

.badge {
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.green {
  background: #dcfce7;
  color: #15803d;
}

.orange {
  background: #fef3c7;
  color: #b45309;
}

.red {
  background: #fee2e2;
  color: #b91c1c;
}

.icon-btn,
.secondary-btn {
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  padding: 9px 15px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.icon-btn:hover,
.secondary-btn:hover {
  background: #991b1b;
  color: white;
  border-color: #991b1b;
}

/* Appointments */
.appointments {
  padding: 8px 28px 20px;
}

.appointment {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid #f1f5f9;
}

.appointment:last-child {
  border-bottom: none;
}

.date-box {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: #fee2e2;
  color: #991b1b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-box strong {
  font-size: 20px;
}

.date-box span {
  font-size: 11px;
  font-weight: 800;
}

.appt-info {
  flex: 1;
}

.appt-info h3 {
  margin: 0 0 5px;
  font-size: 15px;
}

.appt-info p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 900px) {
  .topbar {
    padding: 0 20px;
  }

  .hero,
  .card {
    margin-left: 20px;
    margin-right: 20px;
  }

  .hero {
    padding: 30px;
  }

  .hero h1 {
    font-size: 30px;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}
</style>