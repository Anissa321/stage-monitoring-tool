import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/stagevoorstellen/mijn — student ziet eigen voorstel
router.get('/mijn', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('*')
      .eq('student_id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Kon stagevoorstel niet ophalen' })
    }

    res.json({ stagevoorstel: data || null })
  } catch (err) {
    console.error('Stagevoorstel ophalen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/stagevoorstellen — student dient voorstel in
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const {
      bedrijfsnaam, bedrijf_adres, mentor_naam, mentor_mail,
      opdrachtomschrijving, startdatum, einddatum, sector, deadline, docent_naam
    } = req.body

    if (!bedrijfsnaam || !opdrachtomschrijving) {
      return res.status(400).json({ error: 'Bedrijfsnaam en opdrachtomschrijving zijn verplicht' })
    }

    const insertData = {
      student_id: req.user.id,
      bedrijfsnaam,
      bedrijf_adres: bedrijf_adres || null,
      mentor_naam: mentor_naam || null,
      mentor_mail: mentor_mail || null,
      opdrachtomschrijving,
      startdatum: startdatum || null,
      einddatum: einddatum || null,
      sector: sector || null,
      status: 'ingediend',
      indieningsdatum: new Date().toISOString()
    }

    if (deadline) insertData.deadline = deadline

    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')

      .insert({
        student_id: req.user.id,
        bedrijfsnaam,
        bedrijf_adres,
        mentor_naam,
        mentor_mail,
        docent_naam,
        opdrachtomschrijving,
        startdatum,
        einddatum,
        sector,
        deadline,
        status: 'ingediend',
        indieningsdatum: new Date().toISOString()
      })

      .insert(insertData)

      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: 'Kon stagevoorstel niet aanmaken' })
    }

    res.status(201).json({ stagevoorstel: data })
  } catch (err) {
    console.error('Stagevoorstel aanmaken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/stagevoorstellen/:id — student past voorstel aan
router.put('/:id', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params
    const {
      bedrijfsnaam, bedrijf_adres, mentor_naam, mentor_mail,
      opdrachtomschrijving, startdatum, einddatum, sector, deadline, docent_naam
    } = req.body

    const { data: bestaand } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('id, status, student_id')
      .eq('id', id)
      .eq('student_id', req.user.id)
      .single()

    if (!bestaand) return res.status(404).json({ error: 'Stagevoorstel niet gevonden' })
    if (bestaand.status === 'goedgekeurd') {
      return res.status(403).json({ error: 'Goedgekeurd stagevoorstel kan niet meer bewerkt worden' })
    }

    const updateData = {
      bedrijfsnaam,
      bedrijf_adres: bedrijf_adres || null,
      mentor_naam: mentor_naam || null,
      mentor_mail: mentor_mail || null,
      opdrachtomschrijving,
      startdatum: startdatum || null,
      einddatum: einddatum || null,
      sector: sector || null,
      status: 'ingediend',
      indieningsdatum: new Date().toISOString()
    }

    if (deadline) updateData.deadline = deadline

    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')

      .update({
        bedrijfsnaam,
        bedrijf_adres,
        mentor_naam,
        mentor_mail,
        docent_naam,
        opdrachtomschrijving,
        startdatum,
        einddatum,
        sector,
        deadline,
        status: 'ingediend',
        indieningsdatum: new Date().toISOString()
      })

      .update(updateData)

      .eq('id', id)
      .eq('student_id', req.user.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return res.status(500).json({ error: 'Kon stagevoorstel niet bewerken' })
    }

    res.json({ stagevoorstel: data })
  } catch (err) {
    console.error('Stagevoorstel bewerken error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/stagevoorstellen/commissie — stagecommissie ziet alle voorstellen
router.get('/commissie', authMiddleware, requireRole('stagecommissie'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('*')
      .order('indieningsdatum', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon stagevoorstellen niet ophalen' })

    const studentIds = data.map(s => s.student_id).filter(Boolean)
    let studentNamen = {}
    if (studentIds.length > 0) {
      const { data: studenten } = await supabaseAdmin
        .from('profiles')
        .select('id, voornaam, achternaam')
        .in('id', studentIds)
      studenten?.forEach(s => {
        studentNamen[s.id] = `${s.voornaam} ${s.achternaam}`
      })
    }

    const voorstellenMetNaam = data.map(v => ({
      ...v,
      student_naam: studentNamen[v.student_id] || 'Onbekend'
    }))

    res.json({ stagevoorstellen: voorstellenMetNaam })
  } catch (err) {
    console.error('Commissie stagevoorstellen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/stagevoorstellen/:id/beoordelen — stagecommissie beoordeelt voorstel
router.put('/:id/beoordelen', authMiddleware, requireRole('stagecommissie'), async (req, res) => {
  try {
    const { id } = req.params
    const { status, feedback_aanpassen, feedback_positief } = req.body

    if (!status || !['goedgekeurd', 'afgekeurd', 'aanpassen'].includes(status)) {
      return res.status(400).json({ error: 'Status moet goedgekeurd, afgekeurd of aanpassen zijn' })
    }

    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')
      .update({ status, feedback_aanpassen, feedback_positief })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase beoordelen error:', error)
      return res.status(500).json({ error: 'Kon stagevoorstel niet beoordelen' })
    }

    if (status === 'aanpassen' && feedback_aanpassen) {
      await supabaseAdmin
        .from('stagevoorstel_aanpassingen')
        .insert({
          stagevoorstel_id: parseInt(id),
          beschrijving: feedback_aanpassen,
          afgerond: false
        })
    }

    res.json({ stagevoorstel: data })
  } catch (err) {
    console.error('Stagevoorstel beoordelen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/stagevoorstellen/:id/aanpassingen — aanpassingen ophalen
router.get('/:id/aanpassingen', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('stagevoorstel_aanpassingen')
      .select('*')
      .eq('stagevoorstel_id', id)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon aanpassingen niet ophalen' })

    res.json({ aanpassingen: data })
  } catch (err) {
    console.error('Aanpassingen ophalen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router