import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// POST /api/tussentijdse-evaluaties — mentor slaat evaluatie op
router.post('/', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const {
      student_id,
      datum,
      tijd_van,
      tijd_tot,
      locatie,
      communicatie_score,
      probleemoplossing_score,
      teamwork_score,
      vaktechnisch_score
    } = req.body

    if (!student_id) return res.status(400).json({ error: 'student_id is verplicht' })

    // Check of student gekoppeld is aan deze mentor
    const { data: koppeling } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)
      .eq('student_id', student_id)
      .single()

    if (!koppeling) return res.status(403).json({ error: 'Deze student hoort niet bij jouw studenten' })

    const totaal_score = (communicatie_score || 0) + (probleemoplossing_score || 0) + (teamwork_score || 0) + (vaktechnisch_score || 0)

    // Check of er al een evaluatie bestaat voor deze student van deze mentor
    const { data: bestaand } = await supabaseAdmin
      .from('tussentijdse_evaluaties')
      .select('id')
      .eq('student_id', student_id)
      .eq('mentor_id', req.user.id)
      .single()

    let data, error

    if (bestaand) {
      // Update bestaande evaluatie
      const result = await supabaseAdmin
        .from('tussentijdse_evaluaties')
        .update({
          datum,
          tijd_van,
          tijd_tot,
          locatie,
          communicatie_score,
          probleemoplossing_score,
          teamwork_score,
          vaktechnisch_score,
          totaal_score,
          status: 'ingediend',
          updated_at: new Date().toISOString()
        })
        .eq('id', bestaand.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Nieuwe evaluatie aanmaken
      const result = await supabaseAdmin
        .from('tussentijdse_evaluaties')
        .insert({
          student_id,
          mentor_id: req.user.id,
          datum,
          tijd_van,
          tijd_tot,
          locatie,
          communicatie_score,
          probleemoplossing_score,
          teamwork_score,
          vaktechnisch_score,
          totaal_score,
          status: 'ingediend'
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Evaluatie opslaan error:', error)
      return res.status(500).json({ error: 'Kon evaluatie niet opslaan' })
    }

    res.json({ evaluatie: data })
  } catch (err) {
    console.error('POST evaluatie error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/tussentijdse-evaluaties/student/:studentId — haal evaluatie op (mentor, docent, student)
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params
    const { rol, id } = req.user

    // Toegangscheck per rol
    if (rol === 'student') {
      if (id !== studentId) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol === 'mentor') {
      const { data: koppeling } = await supabaseAdmin
        .from('mentor_studenten')
        .select('student_id')
        .eq('mentor_id', id)
        .eq('student_id', studentId)
        .single()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol === 'docent') {
      const { data: koppeling } = await supabaseAdmin
        .from('docent_studenten')
        .select('student_id')
        .eq('docent_id', id)
        .eq('student_id', studentId)
        .single()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else {
      return res.status(403).json({ error: 'Geen toegang' })
    }

    const { data, error } = await supabaseAdmin
      .from('tussentijdse_evaluaties')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Kon evaluatie niet ophalen' })
    }

    res.json({ evaluatie: data || null })
  } catch (err) {
    console.error('GET evaluatie error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/tussentijdse-evaluaties/mentor — mentor ziet al zijn studenten met hun evaluatie-status
router.get('/mentor', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    if (kError) return res.status(500).json({ error: 'Kon studenten niet ophalen' })

    const studentIds = koppelingen.map(k => k.student_id)
    if (studentIds.length === 0) return res.json({ studenten: [] })

    const { data: studenten } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam')
      .in('id', studentIds)

    // Bedrijfsnaam per student via het goedgekeurde stagevoorstel
    const { data: voorstellen } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('student_id, bedrijfsnaam')
      .in('student_id', studentIds)
      .eq('status', 'goedgekeurd')

    const { data: evaluaties } = await supabaseAdmin
      .from('tussentijdse_evaluaties')
      .select('student_id, totaal_score, status, created_at')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })

    const result = (studenten || []).map(s => {
      const voorstel = voorstellen?.find(v => v.student_id === s.id)
      const evaluatie = evaluaties?.find(e => e.student_id === s.id)

      let status = 'nog_niet_gestart'
      if (evaluatie) status = 'ingediend'

      return {
        student_id: s.id,
        student_naam: `${s.voornaam} ${s.achternaam}`,
        bedrijf: voorstel?.bedrijfsnaam || 'Onbekend',
        tussentijds_score: evaluatie ? `${evaluatie.totaal_score} / 100` : '—',
        status
      }
    })

    res.json({ studenten: result })
  } catch (err) {
    console.error('Mentor evaluaties error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router