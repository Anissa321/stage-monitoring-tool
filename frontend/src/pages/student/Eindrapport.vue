<template>
  <main class="student-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a>Dashboard</a>
        <a>Logboek</a>
        <a>Documenten</a>
        <a>Evaluatie</a>
      </nav>
      <div class="profile">Student</div>
    </header>

    <div class="page-header">
      <h1>Eindrapport</h1>
      <p>Deze pagina is nog in ontwikkeling.</p>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.student-page {
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
}

nav a:hover,
nav a.active {
  background: #fee2e2;
  color: #991b1b;
}

.profile {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.page-header {
  margin: 36px 64px 20px;
}

h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
}

@media (max-width: 900px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .page-header { margin-left: 20px; margin-right: 20px; }
}
</style>