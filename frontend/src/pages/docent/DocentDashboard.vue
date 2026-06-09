<template>
  <div class="dashboard">
    <h1>Docent Dashboard</h1>

    <div class="stats">
      <div class="card">
        <h3>Aantal Studenten</h3>
        <p>12</p>
      </div>

      <div class="card">
        <h3>Open Logboeken</h3>
        <p>8</p>
      </div>

      <div class="card">
        <h3>Evaluaties</h3>
        <p>5</p>
      </div>
    </div>

    <h2>Studentenoverzicht</h2>

    <table>
      <thead>
        <tr>
          <th>Naam</th>
          <th>Bedrijf</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>Anissa Canton</td>
          <td>Microsoft</td>
          <td>Actief</td>
        </tr>

        <tr>
          <td>Insaf</td>
          <td>Google</td>
          <td>Actief</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  min-width: 180px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
}

th {
  background: #f5f5f5;
}
</style>