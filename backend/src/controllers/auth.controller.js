import { supabase, supabaseAdmin } from '../config/supabase.js'

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body

    // Input validatie
    if (!email || !password) {
      return res.status(400).json({ error: 'Email en wachtwoord zijn verplicht' })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email en wachtwoord moeten strings zijn' })
    }

    // Supabase authenticatie
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
console.log('EMAIL:', email)
console.log('PASSWORD:', password)
console.log('SUPABASE ERROR:', error)

    if (error) {
      return res.status(401).json({ error: 'Ongeldige login gegevens' })
    }

    // Profile ophalen uit profiles tabel
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, voornaam, achternaam, rol')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profiel niet gevonden' })
    }

    // Stuur user info + tokens terug
    res.json({
      user: profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token) {
      await supabaseAdmin.auth.admin.signOut(token)
    }

    res.json({ message: 'Uitgelogd' })
  } catch (err) {
    console.error('Logout error:', err)
    res.json({ message: 'Uitgelogd' })
  }
}

// GET /api/auth/me — huidige user opvragen (protected route)
export async function me(req, res) {
  // req.user is gezet door authMiddleware
  res.json({ user: req.user })
}