
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/evaluatie-competenties — iedereen mag ophalen
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: competenties, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .select('*')
      .order('volgorde', { ascending: true })

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

// POST /api/evaluatie-competenties — admin voegt competentie toe
router.post('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { naam, beschrijving, volgorde, niveaus } = req.body
    if (!naam) return res.status(400).json({ error: 'Naam is verplicht' })

    const { data: competentie, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .insert({ naam, beschrijving, volgorde })
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

// PUT /api/evaluatie-competenties/:id — admin past competentie aan
router.put('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params
    const { naam, beschrijving, volgorde } = req.body

    const { data, error } = await supabaseAdmin
      .from('evaluatie_competenties')
      .update({ naam, beschrijving, volgorde })
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