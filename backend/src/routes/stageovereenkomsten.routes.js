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

// Berekent het week-nummer van de stage op basis van startdatum
function berekenWeekNummer(datum, startdatum) {
  const start = new Date(startdatum)
  const dag = new Date(datum)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const week = Math.ceil((dag - start) / msPerWeek) + 1
  return week < 1 ? 1 : week
}

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

// Genereert lege logboeken (status niet_ingevuld) voor elke weekdag (ma-vr)
// tussen startdatum en einddatum van de stage. Bestaande logboeken worden niet overschreven.
// Logboeken buiten de periode (van eerdere/foutieve tests) worden eerst opgeruimd.
async function genereerLogboeken(studentId, startdatum, einddatum) {
  try {
    const start = new Date(startdatum)
    const eind = new Date(einddatum)

    if (isNaN(start) || isNaN(eind) || start > eind) {
      console.error('genereerLogboeken: ongeldige periode', startdatum, einddatum)
      return
    }

    // Eerst opruimen: alles buiten de officiële periode hoort hier niet meer
    await ruimOudeLogboekenOp(studentId, startdatum, einddatum)

    // Bestaande logboeken van deze student ophalen om duplicaten te vermijden
    const { data: bestaande } = await supabaseAdmin
      .from('logbooks')
      .select('datum')
      .eq('student_id', studentId)

    const bestaandeDatums = new Set((bestaande || []).map(l => l.datum))

    const nieuweRijen = []
    const cursor = new Date(start)

    while (cursor <= eind) {
      const dagVanWeek = cursor.getDay() // 0 = zondag, 6 = zaterdag
      const isWeekdag = dagVanWeek >= 1 && dagVanWeek <= 5

      if (isWeekdag) {
        const datumStr = cursor.toISOString().split('T')[0]
        if (!bestaandeDatums.has(datumStr)) {
          nieuweRijen.push({
            student_id: studentId,
            datum: datumStr,
            week_number: berekenWeekNummer(datumStr, startdatum),
            status: 'niet_ingevuld'
          })
        }
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    if (nieuweRijen.length > 0) {
      const { error } = await supabaseAdmin
        .from('logbooks')
        .insert(nieuweRijen)

      if (error) {
        console.error('genereerLogboeken: kon logboeken niet aanmaken', error)
      }
    }
  } catch (err) {
    console.error('genereerLogboeken error:', err)
  }
}

// Bouwt de PDF content (gedeeld door preview en finale versie)
function bouwPdfContent(doc, overeenkomst, student, opleidingNaam, { metHandtekeningen }) {
  doc.fontSize(18).font('Helvetica-Bold').text('Stageovereenkomst', { align: 'center' })
  doc.moveDown(1)

  doc.fontSize(10).font('Helvetica').text(
    `Deze overeenkomst wordt afgesloten tussen de student, het stagebedrijf en de hogeschool Erasmushogeschool Brussel (EhB), in het kader van de stage binnen de opleiding ${opleidingNaam || 'onbekend'}.`,
    { align: 'justify' }
  )
  doc.moveDown(1)

  doc.font('Helvetica-Bold').text('1. Partijen')
  doc.font('Helvetica').text(`Student: ${student.voornaam} ${student.achternaam} (${student.email})`)
  doc.text(`Opleiding: ${opleidingNaam || '—'}`)
  doc.text(`Stagebedrijf: ${overeenkomst.bedrijfsnaam}`)
  if (overeenkomst.bedrijf_adres) doc.text(`Adres: ${overeenkomst.bedrijf_adres}`)
  doc.moveDown(1)

  doc.font('Helvetica-Bold').text('2. Periode')
  doc.font('Helvetica').text(
    `De stage loopt van ${formatDatum(overeenkomst.startdatum)} tot ${formatDatum(overeenkomst.einddatum)}.`
  )
  doc.moveDown(1)

  doc.font('Helvetica-Bold').text('3. Opdrachtomschrijving')
  doc.font('Helvetica').text(overeenkomst.opdrachtomschrijving, { align: 'justify' })
  doc.moveDown(1)

  doc.font('Helvetica-Bold').text('4. Algemene voorwaarden')
  doc.font('Helvetica').fontSize(9).text(
    `4.1 De student verbindt zich ertoe de opdrachten uitgevoerd tijdens de stage met zorg en professionaliteit uit te voeren, en de regels en het reglement van het stagebedrijf te respecteren.\n\n` +
    `4.2 Het stagebedrijf verbindt zich ertoe de student een degelijke begeleiding aan te bieden via een aangestelde stagementor, en de student toe te laten relevante taken uit te voeren in functie van het leertraject.\n\n` +
    `4.3 De hogeschool EhB voorziet een begeleidende docent die de student opvolgt via het digitale logboeksysteem en eventuele bezoeken of overlegmomenten met het stagebedrijf.\n\n` +
    `4.4 Alle partijen verklaren zich akkoord met de verwerking van persoonsgegevens in het kader van deze stage, conform de geldende privacywetgeving (AVG/GDPR).\n\n` +
    `4.5 Bij problemen of conflicten tijdens de stage, neemt de student zo snel mogelijk contact op met de begeleidende docent van EhB.`,
    { align: 'justify' }
  )
  doc.moveDown(2)

  doc.fontSize(10).font('Helvetica-Bold').text('5. Ondertekening')
  doc.moveDown(1)

  const startY = doc.y

  doc.font('Helvetica').fontSize(9).text('Handtekening student:', 50, startY)
  if (metHandtekeningen && overeenkomst.student_handtekening) {
    const imgData = overeenkomst.student_handtekening.replace(/^data:image\/png;base64,/, '')
    doc.image(Buffer.from(imgData, 'base64'), 50, startY + 15, { width: 150, height: 60 })
    doc.text(`Datum: ${formatDatum(overeenkomst.student_getekend_op)}`, 50, startY + 80)
  } else {
    doc.rect(50, startY + 15, 150, 60).stroke('#cccccc')
    doc.fontSize(8).fillColor('#999999').text('Nog niet ondertekend', 50, startY + 40, { width: 150, align: 'center' })
    doc.fillColor('#000000')
  }

  doc.fontSize(9).font('Helvetica').text('Handtekening mentor:', 320, startY)
  if (metHandtekeningen && overeenkomst.mentor_handtekening) {
    const imgData = overeenkomst.mentor_handtekening.replace(/^data:image\/png;base64,/, '')
    doc.image(Buffer.from(imgData, 'base64'), 320, startY + 15, { width: 150, height: 60 })
    doc.text(`Datum: ${formatDatum(overeenkomst.mentor_getekend_op)}`, 320, startY + 80)
  } else {
    doc.rect(320, startY + 15, 150, 60).stroke('#cccccc')
    doc.fontSize(8).fillColor('#999999').text('Nog niet ondertekend', 320, startY + 40, { width: 150, align: 'center' })
    doc.fillColor('#000000')
  }
}

// Helper: haalt de opleiding-naam op aan de hand van opleiding_id
async function haalOpleidingNaam(opleidingId) {
  if (!opleidingId) return null
  const { data } = await supabaseAdmin
    .from('opleidingen')
    .select('naam')
    .eq('id', opleidingId)
    .single()
  return data?.naam || null
}

// Helper: genereer PDF buffer (met handtekeningen, voor opslag)
async function genereerPdfBuffer(overeenkomst, student, opleidingNaam) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    bouwPdfContent(doc, overeenkomst, student, opleidingNaam, { metHandtekeningen: true })

    doc.end()
  })
}

// Helper: genereer PDF, upload naar storage, return signed URL
async function genereerEnUploadPdf(overeenkomstId) {
  const { data: overeenkomst } = await supabaseAdmin
    .from('stageovereenkomsten')
    .select('*')
    .eq('id', overeenkomstId)
    .single()

  if (!overeenkomst) return null

  const { data: student } = await supabaseAdmin
    .from('profiles')
    .select('voornaam, achternaam, email')
    .eq('id', overeenkomst.student_id)
    .single()

  const opleidingNaam = await haalOpleidingNaam(overeenkomst.opleiding_id)

  const pdfBuffer = await genereerPdfBuffer(overeenkomst, student, opleidingNaam)
  const filePath = `stageovereenkomsten/${overeenkomst.student_id}.pdf`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('documenten')
    .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) {
    console.error('PDF upload error:', uploadError)
    return null
  }

  const { data: signedUrlData } = await supabaseAdmin.storage
    .from('documenten')
    .createSignedUrl(filePath, 60 * 60 * 24 * 7)

  const pdfUrl = signedUrlData?.signedUrl || null

  await supabaseAdmin
    .from('stageovereenkomsten')
    .update({ pdf_url: pdfUrl })
    .eq('id', overeenkomstId)

  return pdfUrl
}

// Helper: check of user (student of mentor) toegang heeft tot deze overeenkomst
async function heeftToegang(overeenkomst, user) {
  if (user.rol === 'student') {
    return overeenkomst.student_id === user.id
  }
  if (user.rol === 'mentor') {
    const { data: koppelingen } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', user.id)
    const studentIds = koppelingen?.map(k => k.student_id) || []
    return studentIds.includes(overeenkomst.student_id)
  }
  return false
}

// GET /api/stageovereenkomsten/:id/preview-pdf — genereert preview PDF on-the-fly, NIET opgeslagen
router.get('/:id/preview-pdf', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const { data: overeenkomst } = await supabaseAdmin
      .from('stageovereenkomsten')
      .select('*')
      .eq('id', id)
      .single()

    if (!overeenkomst) return res.status(404).json({ error: 'Overeenkomst niet gevonden' })

    const toegang = await heeftToegang(overeenkomst, req.user)
    if (!toegang) return res.status(403).json({ error: 'Geen toegang tot deze overeenkomst' })

    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('voornaam, achternaam, email')
      .eq('id', overeenkomst.student_id)
      .single()

    const opleidingNaam = await haalOpleidingNaam(overeenkomst.opleiding_id)

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename="stageovereenkomst-preview.pdf"')

    doc.pipe(res)
    bouwPdfContent(doc, overeenkomst, student, opleidingNaam, { metHandtekeningen: false })
    doc.end()
  } catch (err) {
    console.error('Preview PDF error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/stageovereenkomsten/mijn — student haalt eigen overeenkomst op (maakt aan indien nodig)
router.get('/mijn', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: bestaand, error: zoekError } = await supabaseAdmin
      .from('stageovereenkomsten')
      .select('*')
      .eq('student_id', req.user.id)
      .single()

    if (bestaand) {
      return res.json({ overeenkomst: bestaand })
    }

    if (zoekError && zoekError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Kon overeenkomst niet ophalen' })
    }

    const { data: voorstel, error: voorstelError } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('status', 'goedgekeurd')
      .single()

    if (voorstelError || !voorstel) {
      return res.json({ overeenkomst: null, error: 'Geen goedgekeurd stagevoorstel gevonden' })
    }

    const { data: nieuw, error: insertError } = await supabaseAdmin
      .from('stageovereenkomsten')
      .insert({
        student_id: req.user.id,
        stagevoorstel_id: voorstel.id,
        bedrijfsnaam: voorstel.bedrijfsnaam,
        bedrijf_adres: voorstel.bedrijf_adres,
        opdrachtomschrijving: voorstel.opdrachtomschrijving,
        startdatum: voorstel.startdatum,
        einddatum: voorstel.einddatum,
        opleiding_id: voorstel.opleiding_id,
        status: 'open'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Overeenkomst aanmaken error:', insertError)
      return res.status(500).json({ error: 'Kon overeenkomst niet aanmaken' })
    }

    res.json({ overeenkomst: nieuw })
  } catch (err) {
    console.error('Overeenkomst ophalen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/stageovereenkomsten/:id/tekenen-student — student tekent
router.put('/:id/tekenen-student', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params
    const { handtekening } = req.body

    if (!handtekening) return res.status(400).json({ error: 'Handtekening is verplicht' })

    const { data: bestaand } = await supabaseAdmin
      .from('stageovereenkomsten')
      .select('id, student_id, mentor_handtekening, startdatum, einddatum')
      .eq('id', id)
      .eq('student_id', req.user.id)
      .single()

    if (!bestaand) return res.status(404).json({ error: 'Overeenkomst niet gevonden' })

    const nieuweStatus = bestaand.mentor_handtekening ? 'volledig_getekend' : 'student_getekend'

    const { data, error } = await supabaseAdmin
      .from('stageovereenkomsten')
      .update({
        student_handtekening: handtekening,
        student_getekend_op: new Date().toISOString(),
        status: nieuweStatus
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon handtekening niet opslaan' })

    let pdfUrl = data.pdf_url
    if (nieuweStatus === 'volledig_getekend') {
      pdfUrl = await genereerEnUploadPdf(id)
      await genereerLogboeken(bestaand.student_id, bestaand.startdatum, bestaand.einddatum)
    }

    res.json({ overeenkomst: { ...data, pdf_url: pdfUrl } })
  } catch (err) {
    console.error('Student tekenen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/stageovereenkomsten/mentor — mentor haalt overeenkomst(en) van zijn studenten op
router.get('/mentor', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { data: koppelingen } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    const studentIds = koppelingen.map(k => k.student_id)
    if (studentIds.length === 0) return res.json({ overeenkomsten: [] })

    const { data, error } = await supabaseAdmin
      .from('stageovereenkomsten')
      .select('*')
      .in('student_id', studentIds)

    if (error) return res.status(500).json({ error: 'Kon overeenkomsten niet ophalen' })

    const { data: studenten } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam')
      .in('id', studentIds)

    const overeenkomstenMetNaam = data.map(o => {
      const student = studenten?.find(s => s.id === o.student_id)
      return {
        ...o,
        student_naam: student ? `${student.voornaam} ${student.achternaam}` : 'Onbekend'
      }
    })

    res.json({ overeenkomsten: overeenkomstenMetNaam })
  } catch (err) {
    console.error('Mentor overeenkomsten error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/stageovereenkomsten/:id/tekenen-mentor — mentor tekent
router.put('/:id/tekenen-mentor', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params
    const { handtekening } = req.body

    if (!handtekening) return res.status(400).json({ error: 'Handtekening is verplicht' })

    const { data: koppelingen } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id')
      .eq('mentor_id', req.user.id)

    const studentIds = koppelingen.map(k => k.student_id)

    const { data: bestaand } = await supabaseAdmin
      .from('stageovereenkomsten')
      .select('id, student_id, student_handtekening, startdatum, einddatum')
      .eq('id', id)
      .single()

    if (!bestaand) return res.status(404).json({ error: 'Overeenkomst niet gevonden' })
    if (!studentIds.includes(bestaand.student_id)) {
      return res.status(403).json({ error: 'Deze overeenkomst hoort niet bij jouw student' })
    }

    const nieuweStatus = bestaand.student_handtekening ? 'volledig_getekend' : 'mentor_getekend'

    const { data, error } = await supabaseAdmin
      .from('stageovereenkomsten')
      .update({
        mentor_handtekening: handtekening,
        mentor_getekend_op: new Date().toISOString(),
        status: nieuweStatus
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon handtekening niet opslaan' })

    let pdfUrl = data.pdf_url
    if (nieuweStatus === 'volledig_getekend') {
      pdfUrl = await genereerEnUploadPdf(id)
      await genereerLogboeken(bestaand.student_id, bestaand.startdatum, bestaand.einddatum)
    }

    res.json({ overeenkomst: { ...data, pdf_url: pdfUrl } })
  } catch (err) {
    console.error('Mentor tekenen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/stageovereenkomsten/:id/start-stage — student start zijn stage (enkel mogelijk als volledig ondertekend)
router.put('/:id/start-stage', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params

    const { data: bestaand } = await supabaseAdmin
      .from('stageovereenkomsten')
      .select('id, student_id, status, stage_gestart')
      .eq('id', id)
      .eq('student_id', req.user.id)
      .single()

    if (!bestaand) return res.status(404).json({ error: 'Overeenkomst niet gevonden' })

    if (bestaand.status !== 'volledig_getekend') {
      return res.status(400).json({ error: 'De overeenkomst moet eerst volledig ondertekend zijn door zowel student als mentor' })
    }

    if (bestaand.stage_gestart) {
      return res.json({ overeenkomst: bestaand, message: 'Stage was al gestart' })
    }

    const { data, error } = await supabaseAdmin
      .from('stageovereenkomsten')
      .update({ stage_gestart: true })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon stage niet starten' })

    res.json({ overeenkomst: data })
  } catch (err) {
    console.error('Start stage error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router