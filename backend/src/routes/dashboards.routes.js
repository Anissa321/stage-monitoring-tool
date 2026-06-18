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
      .select('id, company_name, start_date, end_date, status')
      .eq('student_id', req.user.id)
      .single()

    let stagevoorstel = null
    if (!stage) {
      const { data: voorstel } = await supabaseAdmin
        .from('stagevoorstellen')
        .select('*')
        .eq('student_id', req.user.id)
        .order('indieningsdatum', { ascending: false })
        .limit(1)
        .single()
      stagevoorstel = voorstel || null
    }

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
      if (mentorProfiel) mentor = `${mentorProfiel.voornaam} ${mentorProfiel.achternaam}`
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
      stagevoorstel,
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

// GET /api/dashboards/docent
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

    let logboekenTeControlen = []
    if (studentIds.length > 0) {
      const { data: logboeken } = await supabaseAdmin
        .from('logbooks')
        .select('id, student_id, datum, week_number, status')
        .in('student_id', studentIds)
        .eq('status', 'ingediend')
        .order('datum', { ascending: false })
        .limit(10)

      if (logboeken && logboeken.length > 0) {
        const profielMap = {}
        studenten.forEach(s => { profielMap[s.id] = s })
        logboekenTeControlen = logboeken.map(l => ({
          ...l,
          student_naam: profielMap[l.student_id]
            ? `${profielMap[l.student_id].voornaam} ${profielMap[l.student_id].achternaam}`
            : 'Onbekend'
        }))
      }
    }

    res.json({
      user: req.user,
      studenten,
      logboeken_te_controleren: logboekenTeControlen
    })
  } catch (err) {
    console.error('Docent dashboard error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/dashboards/docent/student/:studentId
router.get('/docent/student/:studentId', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const { studentId } = req.params

    const { data: koppeling } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id')
      .eq('docent_id', req.user.id)
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
      .select('id, company_name, start_date, end_date, status')
      .eq('student_id', studentId)
      .single()

    const { data: mentorKoppeling } = await supabaseAdmin
      .from('mentor_studenten')
      .select('mentor_id')
      .eq('student_id', studentId)
      .single()

    let mentorNaam = null
    if (mentorKoppeling) {
      const { data: mentorProfiel } = await supabaseAdmin
        .from('profiles')
        .select('voornaam, achternaam')
        .eq('id', mentorKoppeling.mentor_id)
        .single()
      if (mentorProfiel) mentorNaam = `${mentorProfiel.voornaam} ${mentorProfiel.achternaam}`
    }

    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, status, tasks, week_number')
      .eq('student_id', studentId)
      .order('datum', { ascending: false })

    res.json({
      student,
      stage: stage ? {
        company_name: stage.company_name,
        startdatum: stage.start_date,
        einddatum: stage.end_date,
        status: stage.status,
        mentor_naam: mentorNaam
      } : null,
      logboeken: logboeken || []
    })
  } catch (err) {
    console.error('Docent student detail error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/dashboards/mentor
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

    let logboekenTeAftekenen = []
    if (studentIds.length > 0) {
      const { data: logboeken } = await supabaseAdmin
        .from('logbooks')
        .select('id, student_id, datum, week_number, status')
        .in('student_id', studentIds)
        .eq('status', 'ingediend')
        .order('datum', { ascending: false })
        .limit(10)

      if (logboeken && logboeken.length > 0) {
        const profielMap = {}
        studenten.forEach(s => { profielMap[s.id] = s })
        logboekenTeAftekenen = logboeken.map(l => ({
          ...l,
          student_naam: profielMap[l.student_id]
            ? `${profielMap[l.student_id].voornaam} ${profielMap[l.student_id].achternaam}`
            : 'Onbekend'
        }))
      }
    }

    res.json({
      user: req.user,
      studenten,
      logboeken_te_aftekenen: logboekenTeAftekenen
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
      .select('id, company_name, start_date, end_date, status')
      .eq('student_id', studentId)
      .single()

    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, datum, status, tasks, week_number')
      .eq('student_id', studentId)
      .order('datum', { ascending: false })
      .limit(10)

    res.json({
      student,
      stage: stage ? {
        company_name: stage.company_name,
        startdatum: stage.start_date,
        einddatum: stage.end_date,
        status: stage.status
      } : null,
      logboeken: logboeken || []
    })
  } catch (err) {
    console.error('Mentor student detail error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/dashboards/commissie
router.get('/commissie', authMiddleware, requireRole('stagecommissie'), async (req, res) => {
  try {
    const { data: voorstellen } = await supabaseAdmin
      .from('stagecoorstellingen')
      .select('id, student_id, bedrijfsnaam, bedrijf_adres, mentor_naam, mentor_mail, startdatum, einddatum, status, indieningsdatum')
      .order('indieningsdatum', { ascending: false })

    res.json({
      user: req.user,
      voorstellen: voorstellen || []
    })
  } catch (err) {
    console.error('Commissie dashboard error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/dashboards/administratie
router.get('/administratie', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { data: competenties } = await supabaseAdmin
      .from('logbook_competencies')
      .select('competence_name')

    const uniek = [...new Set((competenties || []).map(c => c.competence_name))]

    res.json({
      user: req.user,
      aantal_competenties: uniek.length,
      competenties: uniek
    })
  } catch (err) {
    console.error('Admin dashboard error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router