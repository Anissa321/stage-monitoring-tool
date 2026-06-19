import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/opleidingen — iedereen ingelogd mag ophalen (nodig voor dropdowns)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('opleidingen')
      .select('*')
      .order('naam', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon opleidingen niet ophalen' })
    res.json({ opleidingen: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/opleidingen — admin voegt opleiding toe
router.post('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { naam } = req.body
    if (!naam) return res.status(400).json({ error: 'Naam is verplicht' })

    const { data, error } = await supabaseAdmin
      .from('opleidingen')
      .insert({ naam })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon opleiding niet aanmaken' })
    res.json({ opleiding: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/opleidingen/:id — admin past opleiding aan
router.put('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params
    const { naam } = req.body

    const { data, error } = await supabaseAdmin
      .from('opleidingen')
      .update({ naam })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon opleiding niet aanpassen' })
    res.json({ opleiding: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// DELETE /api/opleidingen/:id — admin verwijdert opleiding
router.delete('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params

    // Check of er nog studenten of competenties aan gekoppeld zijn
    const { data: studenten } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('opleiding_id', id)
      .limit(1)

    if (studenten && studenten.length > 0) {
      return res.status(400).json({ error: 'Kan opleiding niet verwijderen: er zijn nog studenten aan gekoppeld' })
    }

    const { error } = await supabaseAdmin
      .from('opleidingen')
      .delete()
      .eq('id', id)

    if (error) return res.status(500).json({ error: 'Kon opleiding niet verwijderen' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router