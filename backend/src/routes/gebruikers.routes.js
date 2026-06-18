import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/gebruikers — admin haalt alle gebruikers op
router.get('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, voornaam, achternaam, rol, created_at')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon gebruikers niet ophalen' })
    res.json({ gebruikers: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/gebruikers — admin maakt nieuw account aan
router.post('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { email, wachtwoord, voornaam, achternaam, rol } = req.body

    if (!email || !wachtwoord || !voornaam || !achternaam || !rol) {
      return res.status(400).json({ error: 'Alle velden zijn verplicht' })
    }

    const toegestaneRollen = ['mentor', 'docent', 'student', 'stagecommissie', 'administratie']
    if (!toegestaneRollen.includes(rol)) {
      return res.status(400).json({ error: 'Ongeldige rol' })
    }

    // Maak gebruiker aan in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: wachtwoord,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(400).json({ error: authError.message || 'Kon gebruiker niet aanmaken' })
    }

    // Maak profiel aan
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        voornaam,
        achternaam,
        rol
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Verwijder de auth gebruiker als profiel aanmaken mislukt
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(500).json({ error: 'Kon profiel niet aanmaken' })
    }

    res.json({ gebruiker: { id: authData.user.id, email, voornaam, achternaam, rol } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// DELETE /api/gebruikers/:id — admin verwijdert account
router.delete('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params

    // Verwijder profiel
    await supabaseAdmin.from('profiles').delete().eq('id', id)

    // Verwijder auth gebruiker
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) return res.status(500).json({ error: 'Kon gebruiker niet verwijderen' })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router