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

.back-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 18px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.status-badge {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.green {
  background: #dcfce7;
  color: #15803d;
}

.red {
  background: #fee2e2;
  color: #991b1b;
}

.alert {
  margin: 0 64px 24px;
  padding: 16px 20px;
  border-radius: 14px;
  font-weight: 700;
}

.success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.result-card {
  margin: 0 64px 24px;
  background: white;
  border-radius: 22px;
  padding: 28px 32px;
  border: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: 120px 1fr 180px;
  gap: 28px;
  align-items: center;
  box-shadow: 0 14px 30px rgba(15,23,42,0.05);
}

.score-circle {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  align-content: center;
}

.score-circle strong {
  font-size: 30px;
}

.score-circle span {
  font-size: 12px;
  font-weight: 700;
}

.score-green {
  background: #dcfce7;
  color: #059669;
}

.score-red {
  background: #fee2e2;
  color: #dc2626;
}

.result-card h2 {
  margin: 0 0 6px;
  font-size: 22px;
}

.result-card p {
  margin: 0;
  color: #64748b;
}

.result-stats {
  margin-top: 18px;
  display: flex;
  gap: 28px;
}

.result-stats span,
.rating span,
.signatures span {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.result-stats strong,
.rating strong {
  display: block;
  margin-top: 6px;
}

.rating {
  text-align: right;
}

.card {
  margin: 24px 64px;
  background: white;
  border-radius: 22px;
  padding: 28px 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(15,23,42,0.05);
}

.card h2 {
  margin-top: 0;
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
  padding: 14px;
}

td {
  padding: 16px 14px;
  border-top: 1px solid #f1f5f9;
  color: #334155;
}

td p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.text-green {
  color: #059669;
  font-weight: 800;
}

.text-red {
  color: #dc2626;
  font-weight: 800;
}

.progress {
  width: 160px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.fill-green {
  background: #10b981;
}

.fill-red {
  background: #ef4444;
}

.feedback-grid {
  margin: 24px 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.feedback-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.feedback-card.warning {
  background: #fff7ed;
  border-color: #fed7aa;
}

.feedback-card h3 {
  margin-top: 0;
}

.feedback-card li {
  margin-bottom: 8px;
  color: #334155;
}

.next-steps {
  background: #fff7ed;
  border-color: #fed7aa;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 20px;
}

.steps div {
  background: white;
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #fed7aa;
}

.steps strong {
  width: 28px;
  height: 28px;
  background: #f59e0b;
  color: white;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
}

.signatures {
  margin: 24px 64px 48px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.signatures div {
  background: white;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #e5e7eb;
}

.signatures p {
  color: #059669;
  font-weight: 700;
}

@media (max-width: 900px) {
  .topbar {
    padding: 0 20px;
  }

  nav {
    display: none;
  }

  .page-header,
  .alert,
  .result-card,
  .card,
  .feedback-grid,
  .signatures {
    margin-left: 20px;
    margin-right: 20px;
  }

  .title-row,
  .result-card {
    grid-template-columns: 1fr;
    display: block;
  }

  .feedback-grid,
  .steps,
  .signatures {
    grid-template-columns: 1fr;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}
</style>