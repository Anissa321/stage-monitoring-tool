import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// POST /api/tussentijdse-rapporten — docent maakt rapport aan
router.post('/', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const {
      student_id,
      communicatie_score,
      probleemoplossing_score,
      teamwork_score,
      vaktechnisch_score,
      algemene_feedback
    } = req.body

    if (!student_id) return res.status(400).json({ error: 'student_id is verplicht' })

    const totaal_score = (communicatie_score || 0) + (probleemoplossing_score || 0) + (teamwork_score || 0) + (vaktechnisch_score || 0)

    const { data: bestaand } = await supabaseAdmin
      .from('tussentijdse_rapporten')
      .select('id')
      .eq('student_id', student_id)
      .eq('docent_id', req.user.id)
      .maybeSingle()

    let data, error

    if (bestaand) {
      const result = await supabaseAdmin
        .from('tussentijdse_rapporten')
        .update({
          communicatie_score,
          probleemoplossing_score,
          teamwork_score,
          vaktechnisch_score,
          totaal_score,
          algemene_feedback,
          status: 'ingediend',
          updated_at: new Date().toISOString()
        })
        .eq('id', bestaand.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabaseAdmin
        .from('tussentijdse_rapporten')
        .insert({
          student_id,
          docent_id: req.user.id,
          communicatie_score,
          probleemoplossing_score,
          teamwork_score,
          vaktechnisch_score,
          totaal_score,
          algemene_feedback,
          status: 'ingediend'
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) return res.status(500).json({ error: 'Kon rapport niet opslaan' })
    res.json({ rapport: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/tussentijdse-rapporten/student/:studentId — rapport ophalen
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params
    const { rol, id } = req.user

    if (rol === 'docent') {
      const { data: koppeling } = await supabaseAdmin
        .from('docent_studenten')
        .select('student_id')
        .eq('docent_id', id)
        .eq('student_id', studentId)
        .maybeSingle()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol === 'student') {
      if (id !== studentId) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol !== 'administratie' && rol !== 'mentor') {
      return res.status(403).json({ error: 'Geen toegang' })
    }

    const { data, error } = await supabaseAdmin
      .from('tussentijdse_rapporten')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()

    if (error) return res.status(500).json({ error: 'Kon rapport niet ophalen' })
    res.json({ rapport: data || null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router