<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = ref(null)
const bestand = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const error = ref('')
const succes = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:3000/api/dashboards/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    data.value = await res.json()
  } catch (err) {
    console.error(err)
  }
})

function voornaam() { return data.value?.user?.voornaam || 'Student' }
function initialen() {
  const u = data.value?.user
  if (!u) return 'S'
  return (u.voornaam?.[0] || '') + (u.achternaam?.[0] || '')
}

async function logout() {
  const token = localStorage.getItem('token')
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    console.log(err)
  }
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  router.push('/login')
}

function onDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  verwerkBestand(file)
}

function onFileInput(e) {
  const file = e.target.files[0]
  verwerkBestand(file)
}

function verwerkBestand(file) {
  error.value = ''
  if (!file) return
  if (file.type !== 'application/pdf') {
    error.value = 'Alleen PDF-bestanden zijn toegestaan.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Bestand is te groot. Maximum is 10 MB.'
    return
  }
  bestand.value = file
}

function verwijderBestand() {
  bestand.value = null
  error.value = ''
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

async function uploaden() {
  if (!bestand.value) {
    error.value = 'Selecteer eerst een PDF-bestand.'
    return
  }

  uploading.value = true
  error.value = ''

  try {
    // TODO: vervang dit door echte API call als Artin endpoint heeft gemaakt
    // const formData = new FormData()
    // formData.append('overeenkomst', bestand.value)
    // const token = localStorage.getItem('token')
    // const res = await fetch('http://localhost:3000/api/documenten/overeenkomst', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` },
    //   body: formData
    // })
    // const data = await res.json()
    // if (!res.ok) throw new Error(data.error)

    // Mock: simuleer upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    succes.value = 'Stageovereenkomst succesvol opgeladen! Je stage is gestart.'
    setTimeout(() => router.push('/student/dashboard'), 2000)
  } catch (err) {
    error.value = err.message || 'Upload mislukt, probeer opnieuw.'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <main class="page">
    <header class="topbar">
      <div class="brand">
        <div class="logo-circle">SM</div>
        <span>Stage Monitor</span>
      </div>
      <nav>
        <a @click="router.push('/student/dashboard')">Dashboard</a>
        <a @click="router.push('/student/logboek')">Logboek</a>
        <a class="active" @click="router.push('/student/documenten')">Documenten</a>
        <a @click="router.push('/student/evaluatie')">Evaluatie</a>
      </nav>
      <div class="profile">
        <span>{{ voornaam() }}</span>
        <button class="logout-btn" @click="logout">Uitloggen</button>
        <div class="avatar">{{ initialen() }}</div>
      </div>
    </header>

    <section class="content">
      <a class="back-link" @click="router.push('/student/dashboard')">← Terug naar mijn Dashboard</a>
      <h1>Stageovereenkomst opladen</h1>
      <p class="subtitle">Upload je ondertekende stageovereenkomst.</p>

      <div class="info-banner">
        <span class="info-icon">ℹ️</span>
        <div>
          <strong>Belangrijk</strong>
          <p>De stageovereenkomst is cruciaal voor je verzekering. Zorg dat het document correct ondertekend is door alle partijen.</p>
        </div>
      </div>

      <div
        class="upload-zone"
        :class="{ dragging: isDragging, 'has-file': bestand }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @click="!bestand && $refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="application/pdf"
          style="display: none"
          @change="onFileInput"
        />

        <template v-if="!bestand">
          <div class="upload-icon">📄</div>
          <p class="upload-text">Sleep een PDF hier of klik om te bladeren</p>
          <button class="choose-btn" @click.stop="$refs.fileInput.click()">Bestand kiezen</button>
          <p class="upload-hint">Max 10 MB • Alleen PDF</p>
        </template>

        <template v-else>
          <div class="file-preview">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <p class="file-name">{{ bestand.name }}</p>
              <p class="file-size">{{ formatSize(bestand.size) }}</p>
            </div>
            <button class="remove-btn" @click.stop="verwijderBestand">✕</button>
          </div>
        </template>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="succes" class="succes-msg">{{ succes }}</div>

      <div class="actions">
        <button class="cancel-btn" @click="router.push('/student/dashboard')">Annuleren</button>
        <button
          class="submit-btn"
          :disabled="uploading || !bestand"
          @click="uploaden"
        >
          <span v-if="uploading">Opladen...</span>
          <span v-else>✓ Stage starten</span>
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; font-family: 'Inter', sans-serif; }
.page { min-height: 100vh; background: #f8fafc; color: #111827; }

.topbar { height: 72px; background: rgba(255,255,255,0.95); border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 64px; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; color: #991b1b; }
.logo-circle { width: 38px; height: 38px; border-radius: 12px; background: #991b1b; color: white; display: grid; place-items: center; font-size: 13px; }
nav { display: flex; gap: 8px; }
nav a { text-decoration: none; color: #64748b; font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 12px; cursor: pointer; transition: 0.2s ease; }
nav a:hover, nav a.active { background: #fee2e2; color: #991b1b; }
.profile { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #334155; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 13px; }
.logout-btn { border: none; background: #991b1b; color: white; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.logout-btn:hover { background: #7f1d1d; }

.content { max-width: 760px; margin: 0 auto; padding: 32px 24px 60px; }
.back-link { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 14px; }
.back-link:hover { color: #991b1b; }
.content h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0 0 24px; color: #64748b; font-size: 14px; }

.info-banner { display: flex; gap: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; }
.info-icon { font-size: 20px; flex-shrink: 0; }
.info-banner strong { display: block; font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 4px; }
.info-banner p { margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.5; }

.upload-zone { background: white; border: 2px dashed #cbd5e1; border-radius: 18px; padding: 48px 32px; text-align: center; cursor: pointer; transition: 0.2s ease; margin-bottom: 20px; }
.upload-zone:hover, .upload-zone.dragging { border-color: #991b1b; background: #fff5f5; }
.upload-zone.has-file { cursor: default; border-style: solid; border-color: #a7f3d0; background: #f0fdf4; }
.upload-icon { font-size: 40px; margin-bottom: 12px; }
.upload-text { margin: 0 0 16px; font-size: 15px; color: #334155; font-weight: 600; }
.choose-btn { border: none; background: #991b1b; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; margin-bottom: 12px; }
.choose-btn:hover { background: #7f1d1d; }
.upload-hint { margin: 0; font-size: 12px; color: #94a3b8; }

.file-preview { display: flex; align-items: center; gap: 16px; text-align: left; }
.file-icon { font-size: 36px; flex-shrink: 0; }
.file-info { flex: 1; }
.file-name { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #111827; word-break: break-all; }
.file-size { margin: 0; font-size: 12px; color: #64748b; }
.remove-btn { border: none; background: #fef2f2; color: #991b1b; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.remove-btn:hover { background: #fee2e2; }

.error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.succes-msg { background: #ecfdf5; border: 1px solid #a7f3d0; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }

.actions { display: flex; justify-content: space-between; align-items: center; }
.cancel-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 12px 22px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
.cancel-btn:hover { background: #f8fafc; }
.submit-btn { border: none; background: #15803d; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; transition: 0.2s ease; }
.submit-btn:hover:not(:disabled) { background: #166534; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 700px) {
  .topbar { padding: 0 20px; }
  nav { display: none; }
  .content { padding: 24px 16px 40px; }
  .upload-zone { padding: 32px 20px; }
}
</style>