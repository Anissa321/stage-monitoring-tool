<template>
  <main class="docent-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a class="active">Dashboard</a>
        <a>Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="profile">
        <span>Marie Declercq</span>
        <div class="avatar">MD</div>
      </div>
    </header>

    <section class="hero">
      <p class="label">Stagecommissie</p>
      <h1>Welkom terug, Marie</h1>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Openstaande aanvragen</h2>
          <p>12 aanvragen wachten op jouw beoordeling</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Bedrijf</th>
            <th>Periode</th>
            <th>Ingediend</th>
            <th>Status</th>
            <th>Actie</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td class="name">Anissa Canton</td>
            <td>Acme Corp</td>
            <td>feb - apr 2026</td>
            <td>10 jan 2026</td>
            <td><span class="badge orange">Wacht op beoordeling</span></td>
            <td><button class="icon-btn">Beoordeel</button></td>
          </tr>

          <tr>
            <td class="name">Tom Janssens</td>
            <td>TechBV</td>
            <td>feb - apr 2026</td>
            <td>11 jan 2026</td>
            <td><span class="badge orange">Wacht op beoordeling</span></td>
            <td><button class="icon-btn">Beoordeel</button></td>
          </tr>

          <tr>
            <td class="name">Sara De Vos</td>
            <td>DataLab</td>
            <td>mrt - mei 2026</td>
            <td>12 jan 2026</td>
            <td><span class="badge purple">Aanpassingen vereist</span></td>
            <td><button class="icon-btn">Beoordeel</button></td>
          </tr>

          <tr>
            <td class="name">Mohammed El Idrissi</td>
            <td>WebStudio</td>
            <td>feb - apr 2026</td>
            <td>12 jan 2026</td>
            <td><span class="badge orange">Wacht op beoordeling</span></td>
            <td><button class="icon-btn">Beoordeel</button></td>
          </tr>

          <tr>
            <td class="name">Emma Peeters</td>
            <td>InnovateBE</td>
            <td>mrt - jun 2026</td>
            <td>13 jan 2026</td>
            <td><span class="badge orange">Wacht op beoordeling</span></td>
            <td><button class="icon-btn">Beoordeel</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <div class="card-header">
        <div>
          <h2>Recente beslissingen</h2>
          <p>Laatst genomen beslissingen door de stagecommissie</p>
        </div>
      </div>

      <div class="decisions">
        <div class="decision">
          <span>✓ Lisa Geens — Goedgekeurd</span>
          <small>5 min geleden</small>
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

.orange {
  background: #fef3c7;
  color: #b45309;
}

.purple {
  background: #ede9fe;
  color: #6d28d9;
}

.icon-btn {
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  padding: 9px 15px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.icon-btn:hover {
  background: #991b1b;
  color: white;
  border-color: #991b1b;
}

.decisions {
  padding: 8px 28px 20px;
}

.decision {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  color: #15803d;
  font-weight: 700;
}

.decision small {
  color: #64748b;
}

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