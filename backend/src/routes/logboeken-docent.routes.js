import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET / — lijst van studenten met recente logboeken
router.get('/', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id')
      .eq('docent_id', req.user.id)

    if (kError) return res.status(500).json({ error: 'Kon studenten niet ophalen' })

    const studentIds = koppelingen.map(k => k.student_id)
    if (studentIds.length === 0) return res.json({ studenten: [] })

    const { data: studenten } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam, email')
      .in('id', studentIds)

    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, student_id, datum, tasks, status')
      .in('student_id', studentIds)
      .order('datum', { ascending: false })

    const result = studenten.map(s => ({
      ...s,
      recenteLogboeken: logboeken.filter(l => l.student_id === s.id).slice(0, 3)
    }))

    res.json({ studenten: result })
  } catch (err) {
    console.error('Docent logboeken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /:studentId — alle logboeken van één student
router.get('/:studentId', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const { studentId } = req.params

    const { data: koppeling } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id')
      .eq('docent_id', req.user.id)
      .eq('student_id', studentId)
      .single()

    if (!koppeling) return res.status(403).json({ error: 'Student niet gevonden voor deze docent' })

    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam, email')
      .eq('id', studentId)
      .single()

    const { data: logboeken, error: lError } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, week_number, tasks, reflection, learning_points, uren_gewerkt, competenties, status, created_at')
      .eq('student_id', studentId)
      .order('datum', { ascending: false })

    if (lError) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    res.json({ student, logboeken })
  } catch (err) {
    console.error('Docent student logboeken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router