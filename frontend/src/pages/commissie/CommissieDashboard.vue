<template>
  <div class="dashboard">

    <header class="topbar">
      <div class="logo">
        <strong>Stage Monitor</strong>
      </div>

      <nav>
        <a class="active">Dashboard</a>
        <a>Aanvragen</a>
        <a>Overzicht Beoordeling</a>
      </nav>

      <div class="user">
        Marie Declercq
      </div>
    </header>

    <section class="hero">
      <h1>Welkom terug, Marie! 👋</h1>
      <p>Stagecommissie • Overzicht alle stageaanvragen</p>
    </section>

    <section class="card">
      <h2>Openstaande aanvragen</h2>
      <p class="subtitle">
        12 aanvragen wachten op jouw beoordeling
      </p>

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
            <td>Anissa Canton</td>
            <td>Acme Corp</td>
            <td>feb - apr 2026</td>
            <td>10 jan 2026</td>
            <td><span class="status waiting">Wacht op beoordeling</span></td>
            <td><a href="#">Beoordeel →</a></td>
          </tr>

          <tr>
            <td>Tom Janssens</td>
            <td>TechBV</td>
            <td>feb - apr 2026</td>
            <td>11 jan 2026</td>
            <td><span class="status waiting">Wacht op beoordeling</span></td>
            <td><a href="#">Beoordeel →</a></td>
          </tr>

          <tr>
            <td>Sara De Vos</td>
            <td>DataLab</td>
            <td>mrt - mei 2026</td>
            <td>12 jan 2026</td>
            <td><span class="status revision">Aanpassingen vereist</span></td>
            <td><a href="#">Beoordeel →</a></td>
          </tr>

          <tr>
            <td>Mohammed El Idrissi</td>
            <td>WebStudio</td>
            <td>feb - apr 2026</td>
            <td>12 jan 2026</td>
            <td><span class="status waiting">Wacht op beoordeling</span></td>
            <td><a href="#">Beoordeel →</a></td>
          </tr>

          <tr>
            <td>Emma Peeters</td>
            <td>InnovateBE</td>
            <td>mrt - jun 2026</td>
            <td>13 jan 2026</td>
            <td><span class="status waiting">Wacht op beoordeling</span></td>
            <td><a href="#">Beoordeel →</a></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card decisions">
      <h2>Recente beslissingen</h2>

      <div class="decision">
        ✓ Lisa Geens — Goedgekeurd
        <span>5 min geleden</span>
      </div>
    </section>

  </div>
</template>

<style scoped>
.dashboard {
  background: #f5f6f8;
  min-height: 100vh;
  padding: 30px;
}

.topbar {
  background: white;
  padding: 18px 30px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav {
  display: flex;
  gap: 25px;
}

nav a {
  text-decoration: none;
  color: #555;
}

.active {
  color: #2563eb;
  font-weight: bold;
}

.hero {
  margin: 40px 0;
}

.hero h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.hero p {
  color: #666;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.subtitle {
  color: #777;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 14px;
  border-bottom: 1px solid #ddd;
}

td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.waiting {
  background: #fde7a7;
}

.revision {
  background: #e9ddff;
}

.decisions .decision {
  color: green;
  display: flex;
  justify-content: space-between;
}

.decisions span {
  color: #999;
}
</style>