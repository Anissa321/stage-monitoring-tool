import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/dashboards/student
router.get('/student', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: stage } = await supabaseAdmin
      .from('stages')
      .select('id, bedrijfsnaam, startdatum, einddatum, status')
      .eq('student_id', req.user.id)
      .single()

    let mentor = null
    const { data: mentorKoppeling } = await supabaseAdmin
      .from('mentor_studenten')
      .select('mentor_id')
      .eq('student_id', req.user.id)
      .single()

    if (mentorKoppeling) {
      const { data: mentorProfiel } = await supabaseAdmin
        .from('profiles')
        .select('voornaam, achternaam')
        .eq('id', mentorKoppeling.mentor_id)
        .single()

      if (mentorProfiel) {
        mentor = `${mentorProfiel.voornaam} ${mentorProfiel.achternaam}`
      }
    }

    const nu = new Date()
    const dag = nu.getDay()
    const diffMaandag = dag === 0 ? -6 : 1 - dag
    const maandag = new Date(nu)
    maandag.setDate(nu.getDate() + diffMaandag)
    const vrijdag = new Date(maandag)
    vrijdag.setDate(maandag.getDate() + 4)

    const maandagStr = maandag.toISOString().split('T')[0]
    const vrijdagStr = vrijdag.toISOString().split('T')[0]

    const { data: logboekenDezeWeek } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, status, tasks, uren_gewerkt')
      .eq('student_id', req.user.id)
      .gte('datum', maandagStr)
      .lte('datum', vrijdagStr)
      .order('datum', { ascending: true })

    const { data: recenteLogboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, status, tasks')
      .eq('student_id', req.user.id)
      .order('datum', { ascending: false })
      .limit(5)

    const totaalDezeWeek = logboekenDezeWeek?.length || 0
    const ingevuldDezeWeek = logboekenDezeWeek?.filter(l =>
      ['goedgekeurd', 'ingediend', 'concept'].includes(l.status)
    ).length || 0

    res.json({
      user: req.user,
      stage: stage || null,
      mentor,
      logboeken_deze_week: logboekenDezeWeek || [],
      recente_logboeken: recenteLogboeken || [],
      week_voortgang: {
        ingevuld: ingevuldDezeWeek,
        totaal: totaalDezeWeek,
        week_van: maandagStr,
        week_tot: vrijdagStr
      }
    })
  } catch (err) {
    console.error('Student dashboard error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/dashboards/docent (US-04)
router.get('/docent', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id')
      .eq('docent_id', req.user.id)

    if (kError) return res.status(500).json({ error: 'Kon koppelingen niet ophalen' })

    const studentIds = koppelingen.map(k => k.student_id)
    let studenten = []

    if (studentIds.length > 0) {
      const { data, error: sError } = await supabaseAdmin
        .from('profiles')
        .select('id, voornaam, achternaam, email')
        .in('id', studentIds)

      if (sError) return res.status(500).json({ error: 'Kon studenten niet ophalen' })
      studenten = data || []
    }

    res.json({
      message: 'Welkom op het docent dashboard',
      user: req.user,
      studenten
    })
  } catch (err) {
    console.error('Docent dashboard error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/dashboards/mentor (US-07)
router.get('/mentor', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { data: koppelingen, error: kError } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    if (kError) return res.status(500).json({ error: 'Kon koppelingen niet ophalen' })

    const studentIds = koppelingen.map(k => k.student_id)
    let studenten = []

    if (studentIds.length > 0) {
      const { data, error: sError } = await supabaseAdmin
        .from('profiles')
        .select('id, voornaam, achternaam, email')
        .in('id', studentIds)

      if (sError) return res.status(500).json({ error: 'Kon studenten niet ophalen' })
      studenten = data || []
    }

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

// GET /api/dashboards/mentor/student/:studentId
router.get('/mentor/student/:studentId', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { studentId } = req.params

    const { data: koppeling } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)
      .eq('student_id', studentId)
      .single()

    if (!koppeling) return res.status(403).json({ error: 'Student niet gevonden' })

    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam, email')
      .eq('id', studentId)
      .single()

    const { data: stage } = await supabaseAdmin
      .from('stages')
      .select('id, bedrijfsnaam, startdatum, einddatum, status')
      .eq('student_id', studentId)
      .single()

    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, status, tasks, week_number')
      .eq('student_id', studentId)
      .order('datum', { ascending: false })
      .limit(5)

    res.json({ student, stage: stage || null, logboeken: logboeken || [] })
  } catch (err) {
    console.error('Mentor student detail error:', err)
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