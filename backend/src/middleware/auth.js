import { supabaseAdmin } from '../config/supabase.js'

// Verifieert JWT token en hangt user profiel + rol aan req.user
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Geen token meegegeven' })
    }

    const token = authHeader.split(' ')[1]

    // Supabase verifieert het token (signature + expiry)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Ongeldig of verlopen token' })
    }

    // Profiel + rol ophalen uit profiles tabel
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, voornaam, achternaam, rol')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profiel niet gevonden' })
    }

    // Hang user info aan de request voor latere middleware/controllers
    req.user = profile
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ error: 'Server fout bij authenticatie' })
  }
}