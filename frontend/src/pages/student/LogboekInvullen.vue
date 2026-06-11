<template>
  <main class="logboek-page">
    <section class="hero">
      <p class="label">Stage Logboek</p>
      <h1>Logboek invullen</h1>
      <p class="subtitle">
        Vul je dagelijkse activiteiten en leerpunten in.
      </p>
    </section>

    <section class="form-card">
      <h2>Uitgevoerde taken</h2>

      <textarea
        placeholder="Beschrijf wat je vandaag gedaan hebt..."
      ></textarea>

      <div class="hours-section">
        <label>Uren gewerkt vandaag</label>
        <input type="number" min="0" max="24" placeholder="8" />
      </div>

      <div class="competenties">
        <h3>Competenties toegepast vandaag</h3>

        <label>
          <input type="checkbox" />
          Communicatie
        </label>

        <label>
          <input type="checkbox" />
          Probleemoplossing
        </label>

        <label>
          <input type="checkbox" />
          Teamwork
        </label>

        <label>
          <input type="checkbox" />
          Vaktechnisch handelen
        </label>
      </div>

      <div class="reflection">
        <h3>Reflectie / Leerpunten</h3>

        <textarea
          placeholder="Wat heb je vandaag geleerd?"
        ></textarea>
      </div>

      <div class="actions">
        <button class="draft-btn">
          Opslaan als concept
        </button>

        <button class="submit-btn">
          Indienen
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.logboek-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px;
}

.hero {
  background: white;
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(0,0,0,.05);
}

.label {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.hero h1 {
  margin: 10px 0;
  color: #0f172a;
  font-size: 36px;
}

.subtitle {
  color: #64748b;
}

.form-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0,0,0,.05);
}

.form-card h2 {
  margin-bottom: 16px;
  color: #0f172a;
}

.form-card h3 {
  margin-bottom: 14px;
  color: #0f172a;
}

textarea {
  width: 100%;
  min-height: 140px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 14px;
  resize: vertical;
  font-size: 14px;
}

.hours-section {
  margin-top: 24px;
}

.hours-section label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.hours-section input {
  width: 120px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}

.competenties {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.competenties label {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #334155;
}

.reflection {
  margin-top: 30px;
}

.actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.draft-btn {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.submit-btn {
  border: none;
  background: #2563eb;
  color: white;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.submit-btn:hover {
  background: #1d4ed8;
}
</style>