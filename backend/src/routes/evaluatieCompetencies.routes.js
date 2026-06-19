import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/evaluatie-competenties — haalt competenties op, optioneel gefilterd op opleiding_id
// Gebruik: /api/evaluatie-competenties?opleiding_id=1 (voor rubriek van een specifieke opleiding)
// Zonder query param: alle competenties (gebruikt door admin-overzicht)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { opleiding_id } = req.query

    let query = supabaseAdmin
      .from('evaluatie_competenties')
      .select('*')
      .order('volgorde', { ascending: true })

    if (opleiding_id) {
      query = query.eq('opleiding_id', opleiding_id)
    }

    const { data: competenties, error } = await query

    if (error) {
      console.error('Competenties error:', error)
      return res.status(500).json({ error: 'Kon competenties niet ophalen' })
    }

    const { data: niveaus, error: niveausError } = await supabaseAdmin
      .from('evaluatie_niveaus')
      .select('*')
      .order('volgorde', { ascending: true })

    if (niveausError) {
      console.error('Niveaus error:', niveausError)
      return res.status(500).json({ error: 'Kon niveaus niet ophalen' })
    }

    const result = competenties.map(c => ({
      ...c,
      evaluatie_niveaus: niveaus.filter(n => n.competentie_id === c.id)
    }))

    res.json({ competenties: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/evaluatie-competenties/mijn-opleiding — haalt competenties op voor de opleiding van de ingelogde student
router.get('/mijn-opleiding', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { data: profiel, error: profielError } = await supabaseAdmin
      .from('profiles')
      .select('opleiding_id')
      .eq('id', req.user.id)
      .single()

    if (profielError || !profiel?.opleiding_id) {
      return res.status(404).json({ error: 'Geen opleiding gekoppeld aan dit account' })
    }

    const { data: competenties, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .select('*')
      .eq('opleiding_id', profiel.opleiding_id)
      .order('volgorde', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon competenties niet ophalen' })

    const { data: niveaus } = await supabaseAdmin
      .from('evaluatie_niveaus')
      .select('*')
      .order('volgorde', { ascending: true })

    const result = competenties.map(c => ({
      ...c,
      evaluatie_niveaus: (niveaus || []).filter(n => n.competentie_id === c.id)
    }))

    res.json({ competenties: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/evaluatie-competenties/student/:studentId — haalt competenties op voor de opleiding van een specifieke student (mentor/docent)
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params
    const { rol, id } = req.user

    // Toegangscheck — mentor of docent moet gekoppeld zijn aan de student
    if (rol === 'mentor') {
      const { data: koppeling } = await supabaseAdmin
        .from('mentor_studenten')
        .select('student_id')
        .eq('mentor_id', id)
        .eq('student_id', studentId)
        .maybeSingle()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol === 'docent') {
      const { data: koppeling } = await supabaseAdmin
        .from('docent_studenten')
        .select('student_id')
        .eq('docent_id', id)
        .eq('student_id', studentId)
        .maybeSingle()
      if (!koppeling) return res.status(403).json({ error: 'Geen toegang' })
    } else if (rol !== 'administratie' && id !== studentId) {
      return res.status(403).json({ error: 'Geen toegang' })
    }

    const { data: profiel, error: profielError } = await supabaseAdmin
      .from('profiles')
      .select('opleiding_id')
      .eq('id', studentId)
      .single()

    if (profielError || !profiel?.opleiding_id) {
      return res.status(404).json({ error: 'Geen opleiding gekoppeld aan deze student' })
    }

    const { data: competenties, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .select('*')
      .eq('opleiding_id', profiel.opleiding_id)
      .order('volgorde', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon competenties niet ophalen' })

    const { data: niveaus } = await supabaseAdmin
      .from('evaluatie_niveaus')
      .select('*')
      .order('volgorde', { ascending: true })

    const result = competenties.map(c => ({
      ...c,
      evaluatie_niveaus: (niveaus || []).filter(n => n.competentie_id === c.id)
    }))

    res.json({ competenties: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/evaluatie-competenties/niveau/:id — admin past niveau aan (VOOR /:id)
router.put('/niveau/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params
    const { label, punten, beschrijving, volgorde } = req.body

    const { data, error } = await supabaseAdmin
      .from('evaluatie_niveaus')
      .update({ label, punten, beschrijving, volgorde })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon niveau niet aanpassen' })
    res.json({ niveau: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/evaluatie-competenties — admin voegt competentie toe (nu met opleiding_id)
router.post('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { naam, beschrijving, volgorde, niveaus, opleiding_id } = req.body
    if (!naam) return res.status(400).json({ error: 'Naam is verplicht' })
    if (!opleiding_id) return res.status(400).json({ error: 'Opleiding is verplicht' })

    const { data: competentie, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .insert({ naam, beschrijving, volgorde, opleiding_id })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon competentie niet aanmaken' })

    if (niveaus && niveaus.length > 0) {
      const niveausMetId = niveaus.map(n => ({ ...n, competentie_id: competentie.id }))
      await supabaseAdmin.from('evaluatie_niveaus').insert(niveausMetId)
    }

    res.json({ competentie })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/evaluatie-competenties/:id — admin past competentie aan (nu met opleiding_id)
router.put('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params
    const { naam, beschrijving, volgorde, opleiding_id } = req.body

    const updateData = { naam, beschrijving, volgorde }
    if (opleiding_id !== undefined) updateData.opleiding_id = opleiding_id

    const { data, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon competentie niet aanpassen' })
    res.json({ competentie: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// DELETE /api/evaluatie-competenties/:id — admin verwijdert competentie
router.delete('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .delete()
      .eq('id', id)

    if (error) return res.status(500).json({ error: 'Kon competentie niet verwijderen' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router