<template>
  <main class="admin-page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>

      <nav>
        <a class="active">Dashboard</a>
        <a>Competenties</a>
      </nav>

      <div class="profile">
        <span>Sarah Admin</span>
        <div class="avatar">SA</div>
      </div>
    </header>

    <section class="hero">
      <p class="label">Administratieportaal</p>
      <h1>Welkom terug, Sarah</h1>
      <p class="subtitle">Beheer het stagesysteem en houd het overzicht</p>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.admin-page {
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
}

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

.subtitle {
  margin: 8px 0 0;
  opacity: 0.9;
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

.actions {
  padding: 24px 28px;
}

.action-card {
  width: 280px;
  border: 2px solid #991b1b;
  border-radius: 18px;
  padding: 22px;
  cursor: pointer;
  transition: 0.2s ease;
}

.action-card:hover {
  background: #fff7f7;
}

.action-icon {
  width: 44px;
  height: 44px;
  background: #fee2e2;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
}

.action-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.action-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}
</style>