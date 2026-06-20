import { Router } from 'express'
import PDFDocument from 'pdfkit'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

function formatDatum(datum) {
  if (!datum) return '—'
  return new Date(datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

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

// GET /api/tussentijdse-rapporten/student/:studentId/pdf — genereert downloadbare PDF van het rapport
router.get('/student/:studentId/pdf', authMiddleware, async (req, res) => {
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

    const { data: rapport, error: rapportError } = await supabaseAdmin
      .from('tussentijdse_rapporten')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()

    if (rapportError || !rapport) {
      return res.status(404).json({ error: 'Nog geen tussentijds rapport beschikbaar voor deze student' })
    }

    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('voornaam, achternaam, opleiding_id')
      .eq('id', studentId)
      .single()

    const { data: docent } = await supabaseAdmin
      .from('profiles')
      .select('voornaam, achternaam')
      .eq('id', rapport.docent_id)
      .single()

    const { data: competenties } = await supabaseAdmin
      .from('evaluatie_competenties')
      .select('*')
      .eq('opleiding_id', student?.opleiding_id)
      .order('volgorde', { ascending: true })

    const { data: niveaus } = await supabaseAdmin
      .from('evaluatie_niveaus')
      .select('*')

    const scoreVelden = [
      'communicatie_score',
      'probleemoplossing_score',
      'teamwork_score',
      'vaktechnisch_score'
    ]

    const rijen = (competenties || []).map((c, i) => {
      const compNiveaus = (niveaus || []).filter(n => n.competentie_id === c.id)
      const maxPunten = compNiveaus.length > 0 ? Math.max(...compNiveaus.map(n => n.punten)) : 0
      const behaald = rapport[scoreVelden[i]] || 0
      return {
        naam: c.naam,
        maxPunten,
        behaald
      }
    })

    const totaal = rapport.totaal_score || 0

    let statusLabel = 'Onvoldoende — opvolging nodig'
    if (totaal >= 80) statusLabel = 'Uitstekend'
    else if (totaal >= 65) statusLabel = 'Goed — op schema'
    else if (totaal >= 50) statusLabel = 'Voldoende — aandachtspunten aanwezig'

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="tussentijds-rapport-${studentId}.pdf"`)
    doc.pipe(res)

    doc.fontSize(20).font('Helvetica-Bold').text('Tussentijds rapport', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica').fillColor('#666666').text(
      `${student?.voornaam || ''} ${student?.achternaam || ''}`,
      { align: 'center' }
    )
    doc.fillColor('#000000')
    doc.moveDown(1.5)

    doc.fontSize(13).font('Helvetica-Bold').text(`Totaalscore: ${totaal} / 100`)
    doc.fontSize(11).font('Helvetica').text(`Beoordeling: ${statusLabel}`)
    doc.fontSize(10).fillColor('#666666').text(`Beoordeeld door: ${docent?.voornaam || ''} ${docent?.achternaam || ''}`)
    doc.fillColor('#000000')
    doc.moveDown(1.5)

    doc.fontSize(13).font('Helvetica-Bold').text('Competentiescores')
    doc.moveDown(0.5)

    const startX = 50
    let y = doc.y
    doc.fontSize(9).font('Helvetica-Bold')
    doc.text('Competentie', startX, y, { width: 220 })
    doc.text('Gewicht', startX + 220, y, { width: 80 })
    doc.text('Score', startX + 300, y, { width: 100 })
    doc.moveDown(0.5)
    doc.moveTo(startX, doc.y).lineTo(545, doc.y).stroke('#cccccc')
    doc.moveDown(0.3)

    doc.font('Helvetica').fontSize(9)
    rijen.forEach(r => {
      y = doc.y
      doc.text(r.naam, startX, y, { width: 220 })
      doc.text(`${r.maxPunten}%`, startX + 220, y, { width: 80 })
      doc.text(`${r.behaald} / ${r.maxPunten}`, startX + 300, y, { width: 100 })
      doc.moveDown(0.6)
    })

    doc.moveDown(0.5)
    doc.moveTo(startX, doc.y).lineTo(545, doc.y).stroke('#cccccc')
    doc.moveDown(0.5)
    doc.font('Helvetica-Bold').text(`Totaal: ${totaal} / 100`, startX)
    doc.moveDown(1.5)

    doc.fontSize(13).font('Helvetica-Bold').text('Algemene feedback')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(rapport.algemene_feedback || '—', { align: 'justify' })

    doc.end()
  } catch (err) {
    console.error('Tussentijds rapport PDF error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router