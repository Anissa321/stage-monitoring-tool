<template>
  <main class="login-page">
    <section class="login-card">
      <h1>Stage Monitoring Tool</h1>

      <form class="login-form">
        <label for="email">Email</label>
        <input id="email" type="email" />

        <label for="password">Wachtwoord</label>
        <input id="password" type="password" />

        <button type="button">Login</button>
      </form>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 360px;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 80px;
}

input {
  height: 35px;
}

button {
  height: 45px;
  margin-top: 20px;
}
</style>