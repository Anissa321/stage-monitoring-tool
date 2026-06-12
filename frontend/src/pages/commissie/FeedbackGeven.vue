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

.green-avatar {
  background: #dcfce7;
  color: #059669;
  border: none;
}

.page-header {
  margin: 40px 64px 28px;
  padding: 42px;
  border-radius: 24px;
  background: linear-gradient(135deg, #991b1b, #dc2626);
  color: white;
  box-shadow: 0 18px 40px rgba(153,27,27,0.22);
}

.back-btn {
  border: none;
  background: transparent;
  color: white;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.9;
}

h1 {
  font-size: 38px;
  margin: 18px 0 8px;
  font-weight: 800;
}

.page-header p {
  margin: 0 0 14px;
  opacity: 0.9;
}

.badge {
  display: inline-block;
  padding: 7px 13px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.purple {
  background: #ede9fe;
  color: #7c3aed;
}

.alert {
  margin: 0 64px 28px;
  padding: 18px 22px;
  border: 1px solid #f59e0b;
  background: #fffbeb;
  color: #92400e;
  border-radius: 16px;
  font-weight: 600;
}

.student-card {
  margin: 0 64px 28px;
  background: white;
  border-radius: 22px;
  padding: 28px 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(15,23,42,0.05);
  display: flex;
  align-items: center;
  gap: 18px;
}

.student-card h3 {
  margin: 0 0 4px;
}

.student-card p {
  margin: 4px 0;
  color: #64748b;
}
</style>