<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'

const users = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('users')
    .select('id, name, email, role')

  if (err) {
    error.value = err.message
  } else {
    users.value = data
  }
  loading.value = false
})
</script>

<template>
  <div style="padding: 40px; font-family: sans-serif; color: #111;">
    <h1>🔌 Supabase verbinding test</h1>

    <p v-if="loading">Bezig met laden...</p>

    <div v-else-if="error" style="background: #fee; padding: 16px; border-radius: 8px; color: #900;">
      <strong>❌ Fout:</strong> {{ error }}
    </div>

    <div v-else-if="users.length === 0" style="background: #fffbe6; padding: 16px; border-radius: 8px;">
      <strong>⚠️ Verbonden, maar 0 rijen ontvangen.</strong>
      <p>Waarschijnlijk staat RLS aan zonder leesrechten. Ik leg uit hoe je dit fixt.</p>
    </div>

    <div v-else>
      <p>✅ <strong>Verbonden! {{ users.length }} gebruikers gevonden:</strong></p>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }} — {{ user.email }} <em>({{ user.role }})</em>
        </li>
      </ul>
    </div>
  </div>
</template>