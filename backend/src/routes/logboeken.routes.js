import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// Verwijdert logboek-rijen (en gekoppelde competenties/reviews) die buiten de officiële periode vallen
async function ruimOudeLogboekenOp(studentId, startdatum, einddatum) {
  try {
    const { data: buitenPeriode } = await supabaseAdmin
      .from('logbooks')
      .select('id')
      .eq('student_id', studentId)
      .or(`datum.lt.${startdatum},datum.gt.${einddatum}`)

    if (!buitenPeriode || buitenPeriode.length === 0) return

    const idsOmTeVerwijderen = buitenPeriode.map(l => l.id)

    await supabaseAdmin
      .from('logbook_competencies')
      .delete()
      .in('logbook_id', idsOmTeVerwijderen)

    await supabaseAdmin
      .from('logbook_reviews')
      .delete()
      .in('logbook_id', idsOmTeVerwijderen)

    await supabaseAdmin
      .from('logbooks')
      .delete()
      .in('id', idsOmTeVerwijderen)
  } catch (err) {
    console.error('ruimOudeLogboekenOp error:', err)
  }
}

// POST /api/logboeken/genereer-periode — genereer logboek records voor hele stageperiode (student)
// Bron van waarheid: altijd het meest recente GOEDGEKEURDE stagevoorstel van de student.
// De losse 'stages' tabel wordt hier bewust NIET meer gebruikt, want die raakte in het
// verleden uit sync (verouderde periodes die nooit werden bijgewerkt).
router.post('/genereer-periode', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: voorstel } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('startdatum, einddatum')
      .eq('student_id', req.user.id)
      .eq('status', 'goedgekeurd')
      .order('indieningsdatum', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!voorstel) {
      return res.status(404).json({ error: 'Geen goedgekeurd stagevoorstel gevonden' })
    }

    const startdatum = voorstel.startdatum
    const einddatum = voorstel.einddatum

    if (!startdatum || !einddatum) {
      return res.status(400).json({ error: 'Geen geldige periode gevonden' })
    }

    // Eerst opruimen: alles buiten de officiële periode hoort hier niet meer
    // (bijvoorbeeld na een nieuw/aangepast stagevoorstel met een andere periode)
    await ruimOudeLogboekenOp(req.user.id, startdatum, einddatum)

    const { data: bestaandeLogboeken } = await supabaseAdmin
      .from('logbooks')
      .select('datum')
      .eq('student_id', req.user.id)

    const bestaandeDatums = new Set((bestaandeLogboeken || []).map(l => l.datum))

    // Belangrijk: parse als UTC datum (jaar, maand, dag) om tijdzone-verschuivingen te vermijden
    const [startJaar, startMaand, startDag] = startdatum.split('-').map(Number)
    const [eindJaar, eindMaand, eindDag] = einddatum.split('-').map(Number)

    const start = new Date(Date.UTC(startJaar, startMaand - 1, startDag))
    const eind = new Date(Date.UTC(eindJaar, eindMaand - 1, eindDag))

    const nieuweRijen = []

    let huidigeDatum = new Date(start)
    let weekTeller = 0
    let laatsteMaandag = null

    while (huidigeDatum <= eind) {
      const dagVanWeek = huidigeDatum.getUTCDay() // 0 = zondag, 6 = zaterdag (UTC-consistent)
      const datumStr = huidigeDatum.toISOString().split('T')[0]

      // Alleen werkdagen (maandag t/m vrijdag) tellen mee — weekend wordt volledig genegeerd,
      // zowel voor de weeknummering als voor het aanmaken van logboek-rijen
      if (dagVanWeek >= 1 && dagVanWeek <= 5) {
        const maandagVanDezeWeek = new Date(huidigeDatum)
        const diffNaarMaandag = dagVanWeek === 0 ? -6 : 1 - dagVanWeek
        maandagVanDezeWeek.setUTCDate(huidigeDatum.getUTCDate() + diffNaarMaandag)
        const maandagStr = maandagVanDezeWeek.toISOString().split('T')[0]

        if (laatsteMaandag !== maandagStr) {
          weekTeller++
          laatsteMaandag = maandagStr
        }

        if (!bestaandeDatums.has(datumStr)) {
          nieuweRijen.push({
            student_id: req.user.id,
            datum: datumStr,
            week_number: weekTeller,
            status: 'niet_ingevuld'
          })
        }
      }

      huidigeDatum.setUTCDate(huidigeDatum.getUTCDate() + 1)
    }

    if (nieuweRijen.length === 0) {
      return res.json({ message: 'Geen nieuwe logboeken nodig, alles al aangemaakt', aangemaakt: 0 })
    }

    const { error } = await supabaseAdmin
      .from('logbooks')
      .insert(nieuweRijen)

    if (error) return res.status(500).json({ error: 'Kon logboeken niet genereren' })

    res.json({ message: 'Logboeken gegenereerd', aangemaakt: nieuweRijen.length })
  } catch (err) {
    console.error('Genereer periode error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

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
      .select('logbook_id, competence_name, selected, description')
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
        ? competenties.filter(c => c.logbook_id === log.id).map(c => ({
            naam: c.competence_name,
            description: c.description || ''
          }))
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

// GET /api/logboeken/mijn/reviews — feedback van mentor per week (student)
router.get('/mijn/reviews', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, week_number')
      .eq('student_id', req.user.id)

    const logboekIds = logboeken.map(l => l.id)
    if (logboekIds.length === 0) return res.json({ reviews: [] })

    const { data: reviews } = await supabaseAdmin
      .from('logbook_reviews')
      .select('logbook_id, week_number, week_feedback, week_status, mentor_id, reviewed_at')
      .in('logbook_id', logboekIds)
      .eq('reviewer_role', 'mentor')
      .order('reviewed_at', { ascending: false })

    const mentorIds = [...new Set(reviews.filter(r => r.mentor_id).map(r => r.mentor_id))]
    let mentorNamen = {}
    if (mentorIds.length > 0) {
      const { data: mentors } = await supabaseAdmin
        .from('profiles')
        .select('id, voornaam, achternaam')
        .in('id', mentorIds)
      mentors?.forEach(m => {
        mentorNamen[m.id] = `${m.voornaam} ${m.achternaam}`
      })
    }

    const reviewsMetNaam = reviews.map(r => ({
      ...r,
      mentor_naam: mentorNamen[r.mentor_id] || 'Mentor'
    }))

    res.json({ reviews: reviewsMetNaam })
  } catch (err) {
    console.error('Reviews ophalen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/logboeken/nieuw-info — info voor nieuw logboek (student)
router.get('/nieuw-info', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: voorstel } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('startdatum, einddatum')
      .eq('student_id', req.user.id)
      .eq('status', 'goedgekeurd')
      .order('indieningsdatum', { ascending: false })
      .limit(1)
      .maybeSingle()

    const vandaag = new Date()
    const datum = vandaag.toISOString().split('T')[0]

    let week_number = 1
    let totaal_weken = 20

    if (voorstel) {
      const start = new Date(voorstel.startdatum)
      const eind = new Date(voorstel.einddatum)
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
      .select('logbook_id, competence_name, selected, description')
      .in('logbook_id', logboekIds)
      .eq('selected', true)

    const logboekenMetCompetenties = data.map(log => ({
      ...log,
      competenties: competenties
        ? competenties.filter(c => c.logbook_id === log.id).map(c => ({
            naam: c.competence_name,
            description: c.description || ''
          }))
        : []
    }))

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
      .select('logbook_id, competence_name, selected, description')
      .in('logbook_id', logboekIds)
      .eq('selected', true)

    const weekNummers = [...new Set(data.map(l => l.week_number))]
    const { data: reviews } = await supabaseAdmin
      .from('logbook_reviews')
      .select('week_number, week_feedback, week_status, mentor_id, reviewed_at')
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
        mentors?.forEach(m => {
          mentorNamen[m.id] = `${m.voornaam} ${m.achternaam}`
        })
      }
    }

    const weekFeedbackMap = {}
    if (reviews) {
      reviews.forEach(r => {
        if (!weekFeedbackMap[r.week_number]) {
          weekFeedbackMap[r.week_number] = {
            week_feedback: r.week_feedback || null,
            week_status: r.week_status || null,
            mentor_naam: r.mentor_id ? mentorNamen[r.mentor_id] || 'Mentor' : null
          }
        }
      })
    }

    const logboekenMetCompetenties = data.map(log => ({
      ...log,
      competenties: competenties
        ? competenties.filter(c => c.logbook_id === log.id).map(c => ({
            naam: c.competence_name,
            description: c.description || ''
          }))
        : [],
      mentor_feedback: weekFeedbackMap[log.week_number]?.week_feedback || null,
      mentor_week_status: weekFeedbackMap[log.week_number]?.week_status || null,
      mentor_naam: weekFeedbackMap[log.week_number]?.mentor_naam || null
    }))

    res.json({ logboeken: logboekenMetCompetenties })
  } catch (err) {
    console.error('Docent logboeken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/logboeken/docent/reviews — mentor feedback voor docent
router.get('/docent/reviews', authMiddleware, requireRole('docent'), async (req, res) => {
  try {
    const { data: koppelingen } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id')
      .eq('docent_id', req.user.id)

    const studentIds = koppelingen.map(k => k.student_id)
    if (studentIds.length === 0) return res.json({ reviews: [] })

    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id, week_number')
      .in('student_id', studentIds)

    const logboekIds = logboeken.map(l => l.id)
    if (logboekIds.length === 0) return res.json({ reviews: [] })

    const { data: reviews } = await supabaseAdmin
      .from('logbook_reviews')
      .select('logbook_id, week_number, week_feedback, week_status, mentor_id, reviewed_at')
      .in('logbook_id', logboekIds)
      .eq('reviewer_role', 'mentor')
      .order('reviewed_at', { ascending: false })

    const mentorIds = [...new Set(reviews.filter(r => r.mentor_id).map(r => r.mentor_id))]
    let mentorNamen = {}
    if (mentorIds.length > 0) {
      const { data: mentors } = await supabaseAdmin
        .from('profiles')
        .select('id, voornaam, achternaam')
        .in('id', mentorIds)
      mentors?.forEach(m => {
        mentorNamen[m.id] = `${m.voornaam} ${m.achternaam}`
      })
    }

    const reviewsMetNaam = reviews.map(r => ({
      ...r,
      mentor_naam: mentorNamen[r.mentor_id] || 'Mentor'
    }))

    res.json({ reviews: reviewsMetNaam })
  } catch (err) {
    console.error('Docent reviews error:', err)
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

    const { data: bestaand } = await supabaseAdmin
      .from('logbooks')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('datum', datum)
      .single()

    if (bestaand) {
      return res.status(400).json({ error: 'Er bestaat al een logboek voor deze datum' })
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

    if (competenties && competenties.length > 0) {
      const competentieRijen = competenties.map(c => ({
        logbook_id: data.id,
        competence_name: typeof c === 'string' ? c : c.naam,
        selected: true,
        description: typeof c === 'string' ? '' : (c.description || '')
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

    if (competenties !== undefined) {
      await supabaseAdmin
        .from('logbook_competencies')
        .delete()
        .eq('logbook_id', id)

      if (competenties.length > 0) {
        const competentieRijen = competenties.map(c => ({
          logbook_id: parseInt(id),
          competence_name: typeof c === 'string' ? c : c.naam,
          selected: true,
          description: typeof c === 'string' ? '' : (c.description || '')
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

// DELETE /api/logboeken/:id — logboek RESETTEN naar niet_ingevuld (student)
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
      .update({
        status: 'niet_ingevuld',
        tasks: null,
        reflection: null,
        learning_points: null,
        uren_gewerkt: 0,
        submitted_at: null
      })
      .eq('id', id)
      .eq('student_id', req.user.id)

    if (error) return res.status(500).json({ error: 'Kon logboek niet resetten' })

    res.json({ message: 'Logboek gereset' })
  } catch (err) {
    console.error('Logboek reset error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router