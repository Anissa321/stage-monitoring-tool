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
      .select('id, datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status, submitted_at')
      .eq('student_id', req.user.id)
      .order('datum', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    const logboekIds = data.map(l => l.id)

    const { data: competenties } = await supabaseAdmin
      .from('logbook_competencies')
      .select('logbook_id, competence_name, selected')
      .in('logbook_id', logboekIds)
      .eq('selected', true)

    const weekNummers = [...new Set(data.map(l => l.week_number))]
    const { data: reviews } = await supabaseAdmin
      .from('logbook_reviews')
      .select('week_number, week_status, mentor_id, reviewer_role')
      .eq('reviewer_role', 'mentor')
      .in('week_number', weekNummers)
      .order('reviewed_at', { ascending: false })

    let mentorNamen = {}
    if (reviews && reviews.length > 0) {
      const mentorIds = [...new Set(reviews.filter(r => r.mentor_id).map(r => r.mentor_id))]
      if (mentorIds.length > 0) {
        const { data: mentors } = await supabaseAdmin
          .from('profiles')
          .select('id, voornaam, achternaam')
          .in('id', mentorIds)
        if (mentors) {
          mentors.forEach(m => {
            mentorNamen[m.id] = `${m.voornaam} ${m.achternaam}`
          })
        }
      }
    }

    const weekInfo = {}
    if (reviews) {
      reviews.forEach(r => {
        if (!weekInfo[r.week_number]) {
          weekInfo[r.week_number] = {
            week_status: r.week_status || 'wacht_op_weekgoedkeuring',
            mentor_naam: r.mentor_id ? mentorNamen[r.mentor_id] || null : null
          }
        }
      })
    }

    const logboekenMetData = data.map(log => ({
      ...log,
      competenties: competenties
        ? competenties.filter(c => c.logbook_id === log.id).map(c => c.competence_name)
        : [],
      week_status: weekInfo[log.week_number]?.week_status || 'wacht_op_weekgoedkeuring',
      mentor_naam: weekInfo[log.week_number]?.mentor_naam || null
    }))

    res.json({ logboeken: logboekenMetData })
  } catch (err) {
    console.error('Logboeken ophalen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/logboeken/nieuw-info — info voor nieuw logboek (student)
router.get('/nieuw-info', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: stage } = await supabaseAdmin
      .from('stages')
      .select('id, startdatum, einddatum')
      .eq('student_id', req.user.id)
      .single()

    const vandaag = new Date()
    const datum = vandaag.toISOString().split('T')[0]

    let week_number = 1
    let totaal_weken = 20

    if (stage) {
      const start = new Date(stage.startdatum)
      const eind = new Date(stage.einddatum)
      const msPerWeek = 7 * 24 * 60 * 60 * 1000
      totaal_weken = Math.ceil((eind - start) / msPerWeek)
      week_number = Math.ceil((vandaag - start) / msPerWeek)
      if (week_number < 1) week_number = 1
      if (week_number > totaal_weken) week_number = totaal_weken
    }

    res.json({ datum, week_number, totaal_weken })
  } catch (err) {
    console.error('Nieuw-info error:', err)
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
      .order('datum', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    res.json({ logboeken: data })
  } catch (err) {
    console.error('Mentor logboeken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/logboeken/mentor/week/:studentId/:weekNummer
router.get('/mentor/week/:studentId/:weekNummer', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { studentId, weekNummer } = req.params

    const { data: koppelingen } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    const studentIds = koppelingen.map(k => k.student_id)
    if (!studentIds.includes(studentId)) {
      return res.status(403).json({ error: 'Student niet gekoppeld' })
    }

    const { data, error } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status, submitted_at')
      .eq('student_id', studentId)
      .eq('week_number', weekNummer)
      .order('datum', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    const logboekIds = data.map(l => l.id)
    const { data: competenties } = await supabaseAdmin
      .from('logbook_competencies')
      .select('logbook_id, competence_name, selected')
      .in('logbook_id', logboekIds)
      .eq('selected', true)

    const logboekenMetCompetenties = data.map(log => ({
      ...log,
      competenties: competenties
        ? competenties.filter(c => c.logbook_id === log.id).map(c => c.competence_name)
        : []
    }))

    // Haal student profiel op
    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('voornaam, achternaam')
      .eq('id', studentId)
      .single()

    res.json({ logboeken: logboekenMetCompetenties, student })
  } catch (err) {
    console.error('Mentor week error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/logboeken/docent — logboeken van gekoppelde studenten
router.get('/docent', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id')
      .eq('docent_id', req.user.id)

    if (kError) return res.status(500).json({ error: 'Kon studenten niet ophalen' })

    const studentIds = koppelingen.map(k => k.student_id)
    if (studentIds.length === 0) return res.json({ logboeken: [] })

    const { data, error } = await supabaseAdmin
      .from('logbooks')
      .select('id, student_id, datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status, submitted_at')
      .in('student_id', studentIds)
      .order('datum', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon logboeken niet ophalen' })

    const logboekIds = data.map(l => l.id)
    const { data: competenties } = await supabaseAdmin
      .from('logbook_competencies')
      .select('logbook_id, competence_name, selected')
      .in('logbook_id', logboekIds)

    const logboekenMetCompetenties = data.map(log => ({
      ...log,
      competenties: competenties
        ? competenties.filter(c => c.logbook_id === log.id)
        : []
    }))

    res.json({ logboeken: logboekenMetCompetenties })
  } catch (err) {
    console.error('Docent logboeken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/logboeken — nieuw logboek aanmaken (student)
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status, competenties } = req.body

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
        status: status || 'concept'
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon logboek niet aanmaken' })

    // Sla competenties op in logbook_competencies
    if (competenties && competenties.length > 0) {
      const competentieRijen = competenties.map(naam => ({
        logbook_id: data.id,
        competence_name: naam,
        selected: true
      }))

      const { error: cError } = await supabaseAdmin
        .from('logbook_competencies')
        .insert(competentieRijen)

      if (cError) console.error('Competenties opslaan mislukt:', cError)
    }

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
      .select('id, student_id, status, week_number')
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
        week_number: logboek.week_number,
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
      .update({ datum, week_number, tasks, reflection, learning_points, uren_gewerkt, status })
      .eq('id', id)
      .eq('student_id', req.user.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon logboek niet bewerken' })

    // Competenties updaten: verwijder oude en voeg nieuwe in
    if (competenties !== undefined) {
      await supabaseAdmin
        .from('logbook_competencies')
        .delete()
        .eq('logbook_id', id)

      if (competenties.length > 0) {
        const competentieRijen = competenties.map(naam => ({
          logbook_id: parseInt(id),
          competence_name: naam,
          selected: true
        }))

        const { error: cError } = await supabaseAdmin
          .from('logbook_competencies')
          .insert(competentieRijen)

        if (cError) console.error('Competenties updaten mislukt:', cError)
      }
    }

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

    await supabaseAdmin
      .from('logbook_competencies')
      .delete()
      .eq('logbook_id', id)

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