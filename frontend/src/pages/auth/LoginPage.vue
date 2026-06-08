<template>
  <main class="login-page">
    <header class="ehb-header">
      <img src="../../assets/images/ERASMUSlogo.jpg" alt="Erasmus Hogeschool Brussel" class="ehb-logo" />
    </header>

    <section class="login-card">
      <h1>Stage Monitoring Tool</h1>

      <form class="login-form" @submit.prevent="handleLogin">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          :class="{ 'input-error': errors.email }"
          @input="errors.email = ''"
        />
        <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>

        <label for="password">Wachtwoord</label>
        <input
          id="password"
          type="password"
          v-model="password"
          :class="{ 'input-error': errors.password }"
          @input="errors.password = ''"
        />
        <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>

        <span class="forgot-link" @click="showModal = true">🔑 Wachtwoord vergeten?</span>

        <div v-if="errors.general" class="error-general">
          {{ errors.general }}
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">Bezig met inloggen...</span>
          <span v-else>Login</span>
        </button>
      </form>
    </section>

    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Wachtwoord vergeten</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>

        <div class="modal-body">
          <p>Vul uw e-mailadres in om een resetlink te ontvangen.</p>

          <label>E-mailadres:</label>
          <input
            v-model="resetEmail"
            type="email"
            placeholder="uw@email.com"
            class="modal-input"
          />

          <span v-if="resetError" class="error-msg">{{ resetError }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showModal = false">Annuleren</button>
          <button class="btn-reset" @click="handleReset">Reset wachtwoord</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const resetEmail = ref('')
const resetError = ref('')
const showModal = ref(false)
const isLoading = ref(false)

const errors = ref({
  email: '',
  password: '',
  general: ''
})

function validate() {
  let valid = true
  errors.value = { email: '', password: '', general: '' }

  if (!email.value) {
    errors.value.email = 'Email is verplicht.'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Voer een geldig e-mailadres in.'
    valid = false
  }

  if (!password.value) {
    errors.value.password = 'Wachtwoord is verplicht.'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validate()) return

  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await response.json()

    if (!response.ok) {
      errors.value.general = data.message || 'Inloggen mislukt. Controleer je gegevens.'
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)

    switch (data.role) {
      case 'student':
        router.push('/student/dashboard')
        break
      case 'docent':
        router.push('/docent/dashboard')
        break
      case 'mentor':
        router.push('/mentor/dashboard')
        break
      case 'commissie':
        router.push('/commissie/dashboard')
        break
      case 'admin':
        router.push('/admin/dashboard')
        break
      default:
        router.push('/')
    }
  } catch (err) {
    errors.value.general = 'Verbindingsfout. Probeer het later opnieuw.'
  } finally {
    isLoading.value = false
  }
}

function handleReset() {
  resetError.value = ''

  if (!resetEmail.value) {
    resetError.value = 'Vul uw e-mailadres in.'
    return
  }

  if (!/\S+@\S+\.\S+/.test(resetEmail.value)) {
    resetError.value = 'Voer een geldig e-mailadres in.'
    return
  }

  alert('Resetlink verzonden naar ' + resetEmail.value)
  showModal.value = false
  resetEmail.value = ''
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f1f3f6;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
}

.ehb-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 125px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding-left: 55px;
}

.ehb-logo {
  height: 120px;
}

.login-card {
  width: 460px;
  background: white;
  border-radius: 14px;
  padding: 60px 48px 46px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
}

.login-card h1 {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 70px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-form label {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.login-form input {
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  padding: 0 14px;
  font-size: 15px;
  outline: none;
}

.login-form input:focus {
  border-color: #b00000;
  box-shadow: 0 0 0 3px rgba(176, 0, 0, 0.12);
}

.input-error {
  border-color: #dc2626 !important;
}

.error-msg {
  color: #dc2626;
  font-size: 13px;
}

.error-general {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  font-size: 14px;
  padding: 11px 14px;
  border-radius: 8px;
}

.forgot-link {
  color: #b00000;
  font-size: 15px;
  font-weight: 600;
  text-align: right;
  cursor: pointer;
  margin-top: 4px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-form button {
  height: 54px;
  background: #b00000;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 30px;
}

.login-form button:hover:not(:disabled) {
  background: #930000;
}

.login-form button:disabled {
  background: #d48a8a;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 430px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 22px 26px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 21px;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 26px;
}

.modal-body p {
  text-align: center;
  color: #777;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 28px;
}

.modal-body label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  height: 52px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 15px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 26px 28px;
}

.btn-cancel,
.btn-reset {
  height: 42px;
  border: none;
  border-radius: 6px;
  padding: 0 22px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #6c757d;
}

.btn-reset {
  background: #b00000;
}

.btn-reset:hover {
  background: #930000;
}
</style>