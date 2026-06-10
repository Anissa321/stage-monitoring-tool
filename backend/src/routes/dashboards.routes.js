import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'
const router = Router()

// GET /api/dashboards/mentor (US-07)
// Alleen toegankelijk voor gebruikers met rol 'mentor'

router.get('/mentor', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    // Stap 1: Haal koppelingen op uit mentor_studenten
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    if (kError) {
      console.error('mentor_studenten query error:', kError)
      return res.status(500).json({ error: 'Kon koppelingen niet ophalen' })
    }

    // Stap 2: Haal de profielen op van die studenten
    const studentIds = koppelingen.map(k => k.student_id)
    let studenten = []

    if (studentIds.length > 0) {
      const { data, error: sError } = await supabaseAdmin
        .from('profiles')
        .select('id, voornaam, achternaam, email')
        .in('id', studentIds)

      if (sError) {
        console.error('profiles query error:', sError)
        return res.status(500).json({ error: 'Kon studenten niet ophalen' })
      }
      studenten = data || []
    }

    // Stuur alles terug
    res.json({
      message: 'Welkom op het mentor dashboard',
      user: req.user,
      studenten
    })
  } catch (err) {
    console.error('Mentor dashboard error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})
// GET /api/dashboards/commissie (US-10)
router.get('/commissie', authMiddleware, requireRole('stagecommissie'), (req, res) => {
  res.json({
    message: 'Welkom op het stagecommissie dashboard',
    user: req.user
  })
})
// GET /api/dashboards/administratie (US-12)
router.get('/administratie', authMiddleware, requireRole('administratie'), (req, res) => {
  res.json({
    message: 'Welkom op het administratie dashboard',
    user: req.user
  })
})
export default router