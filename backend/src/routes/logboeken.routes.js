import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/logboeken/mijn — eigen logboeken ophalen (student)
router.get('/mijn', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status, submitted_at, competenties')
      .eq('student_id', req.user.id)
      .order('datum', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    res.json({ logboeken: data })
  } catch (err) {
    console.error('Logboeken ophalen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/logboeken/mentor — logboeken van gekoppelde studenten
router.get('/mentor', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    if (kError) return res.status(500).json({ error: 'Kon studenten niet ophalen' })

    const studentIds = koppelingen.map(k => k.student_id)
    if (studentIds.length === 0) return res.json({ logboeken: [] })

    const { data, error } = await supabaseAdmin
      .from('logbooks')
      .select('id, student_id, datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status, submitted_at')
      .in('student_id', studentIds)
      .order('datum', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    res.json({ logboeken: data })
  } catch (err) {
    console.error('Mentor logboeken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/logboeken — nieuw logboek aanmaken (student)
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { datum, week_number, tasks, reflection, learning_points, uren_gewerkt, competenties } = req.body

    if (!datum || !tasks) {
      return res.status(400).json({ error: 'Datum en taken zijn verplicht' })
    }

    const { data, error } = await supabaseAdmin
      .from('logbooks')
      .insert({
        student_id: req.user.id,
        datum,
        week_number,
        tasks,
        reflection,
        learning_points,
        uren_gewerkt,
        competenties,
        status: 'concept'
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon logboek niet aanmaken' })

    res.status(201).json({ logboek: data })
  } catch (err) {
    console.error('Logboek aanmaken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/logboeken/:id/aftekenen — logboek aftekenen (mentor)
router.post('/:id/aftekenen', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params
    const { feedback, week_feedback, week_status } = req.body

    if (!week_status || !['goedgekeurd', 'afgekeurd'].includes(week_status)) {
      return res.status(400).json({ error: 'week_status moet goedgekeurd of afgekeurd zijn' })
    }

    const { data: koppelingen } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    const studentIds = koppelingen.map(k => k.student_id)

    const { data: logboek } = await supabaseAdmin
      .from('logbooks')
      .select('id, student_id, status')
      .eq('id', id)
      .single()

    if (!logboek) return res.status(404).json({ error: 'Logboek niet gevonden' })
    if (!studentIds.includes(logboek.student_id)) {
      return res.status(403).json({ error: 'Dit logboek hoort niet bij jouw student' })
    }

    const { data: review, error: rError } = await supabaseAdmin
      .from('logbook_reviews')
      .insert({
        logbook_id: parseInt(id),
        mentor_id: req.user.id,
        feedback,
        week_feedback,
        week_status,
        signed: true,
        reviewer_role: 'mentor',
        status: 'afgetekend'
      })
      .select()
      .single()

    if (rError) return res.status(500).json({ error: 'Kon review niet opslaan' })

    await supabaseAdmin
      .from('logbooks')
      .update({ status: week_status })
      .eq('id', id)

    res.status(201).json({ review })
  } catch (err) {
    console.error('Aftekenen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/logboeken/:id — logboek bewerken (student)
router.put('/:id', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params
    const { datum, week_number, tasks, reflection, learning_points, uren_gewerkt, competenties, status } = req.body

    const { data: bestaand } = await supabaseAdmin
      .from('logbooks')
      .select('id, status, student_id')
      .eq('id', id)
      .eq('student_id', req.user.id)
      .single()

    if (!bestaand) return res.status(404).json({ error: 'Logboek niet gevonden' })
    if (bestaand.status === 'goedgekeurd') {
      return res.status(403).json({ error: 'Goedgekeurd logboek kan niet meer bewerkt worden' })
    }

    const { data, error } = await supabaseAdmin
      .from('logbooks')
      .update({ datum, week_number, tasks, reflection, learning_points, uren_gewerkt, competenties, status })
      .eq('id', id)
      .eq('student_id', req.user.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon logboek niet bewerken' })

    res.json({ logboek: data })
  } catch (err) {
    console.error('Logboek bewerken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// DELETE /api/logboeken/:id — logboek verwijderen (student)
router.delete('/:id', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params

    const { data: bestaand } = await supabaseAdmin
      .from('logbooks')
      .select('id, status, student_id')
      .eq('id', id)
      .eq('student_id', req.user.id)
      .single()

    if (!bestaand) return res.status(404).json({ error: 'Logboek niet gevonden' })
    if (bestaand.status === 'goedgekeurd') {
      return res.status(403).json({ error: 'Goedgekeurd logboek kan niet verwijderd worden' })
    }

    const { error } = await supabaseAdmin
      .from('logbooks')
      .delete()
      .eq('id', id)
      .eq('student_id', req.user.id)

    if (error) return res.status(500).json({ error: 'Kon logboek niet verwijderen' })

    res.json({ message: 'Logboek verwijderd' })
  } catch (err) {
    console.error('Logboek verwijderen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router