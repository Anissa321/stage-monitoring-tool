import { supabase, supabaseAdmin } from '../config/supabase.js'

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body

    // Input validatie
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email en wachtwoord zijn verplicht' 
      })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        error: 'Email en wachtwoord moeten strings zijn' 
      })
    }

    // Supabase authenticatie
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // Generieke foutmelding (geen user enumeration mogelijk)
      return res.status(401).json({ error: 'Ongeldige login gegevens' })
    }

    // Login succesvol — stuur user info + tokens terug
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email
      },
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
    // Logout faalt zelden — we geven altijd 200 terug
    res.json({ message: 'Uitgelogd' })
  }
}