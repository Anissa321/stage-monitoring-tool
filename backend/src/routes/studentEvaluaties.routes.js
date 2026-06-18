import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// POST /api/student-evaluaties — student slaat zelfevaluatie op
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const {
      communicatie_score,
      probleemoplossing_score,
      teamwork_score,
      vaktechnisch_score
    } = req.body

    const totaal_score = (communicatie_score || 0) + (probleemoplossing_score || 0) + (teamwork_score || 0) + (vaktechnisch_score || 0)

    // Check of er al een zelfevaluatie bestaat
    const { data: bestaand } = await supabaseAdmin
      .from('student_evaluaties')
      .select('id')
      .eq('student_id', req.user.id)
      .single()

    let data, error

    if (bestaand) {
      const result = await supabaseAdmin
        .from('student_evaluaties')
        .update({
          communicatie_score,
          probleemoplossing_score,
          teamwork_score,
          vaktechnisch_score,
          totaal_score,
          updated_at: new Date().toISOString()
        })
        .eq('id', bestaand.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabaseAdmin
        .from('student_evaluaties')
        .insert({
          student_id: req.user.id,
          communicatie_score,
          probleemoplossing_score,
          teamwork_score,
          vaktechnisch_score,
          totaal_score
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) return res.status(500).json({ error: 'Kon zelfevaluatie niet opslaan' })
    res.json({ evaluatie: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/student-evaluaties/mijn — student haalt eigen zelfevaluatie op
router.get('/mijn', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('student_evaluaties')
      .select('*')
      .eq('student_id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Kon zelfevaluatie niet ophalen' })
    }

    res.json({ evaluatie: data || null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/student-evaluaties/student/:studentId — docent/mentor haalt zelfevaluatie op van student
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params
    const { rol, id } = req.user

    // Toegangscheck
    if (rol === 'docent') {
      const { data: koppeling } = await supabaseAdmin
        .from('docent_studenten')
        .select('student_id')
        .eq('docent_id', id)
        .eq('student_id', studentId)
        .single()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol === 'mentor') {
      const { data: koppeling } = await supabaseAdmin
        .from('mentor_studenten')
        .select('student_id')
        .eq('mentor_id', id)
        .eq('student_id', studentId)
        .single()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol !== 'administratie') {
      return res.status(403).json({ error: 'Geen toegang' })
    }

    const { data, error } = await supabaseAdmin
      .from('student_evaluaties')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Kon zelfevaluatie niet ophalen' })
    }

    res.json({ evaluatie: data || null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router