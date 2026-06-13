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
      bedrijfsnaam, bedrijf_adres,
      opdrachtomschrijving, startdatum, einddatum, sector, deadline
    } = req.body

    if (!bedrijfsnaam || !opdrachtomschrijving) {
      return res.status(400).json({ error: 'Bedrijfsnaam en opdrachtomschrijving zijn verplicht' })
    }

    const insertData = {
      student_id: req.user.id,
      bedrijfsnaam,
      bedrijf_adres: bedrijf_adres || null,
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
      bedrijfsnaam, bedrijf_adres,
      opdrachtomschrijving, startdatum, einddatum, sector, deadline
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
    const { status, feedback_aanpassen, feedback_positief, mentor_naam, mentor_mail } = req.body

    if (!status || !['goedgekeurd', 'afgekeurd', 'aanpassen'].includes(status)) {
      return res.status(400).json({ error: 'Status moet goedgekeurd, afgekeurd of aanpassen zijn' })
    }

    if (status === 'goedgekeurd' && (!mentor_naam || !mentor_mail)) {
      return res.status(400).json({ error: 'Mentor naam en email zijn verplicht bij goedkeuring' })
    }

    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')
      .update({ status, feedback_aanpassen, feedback_positief, mentor_naam, mentor_mail })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase beoordelen error:', error)
      return res.status(500).json({ error: 'Kon stagevoorstel niet beoordelen' })
    }

    let mentorCredentials = null

    if (status === 'goedgekeurd') {
      const wachtwoord = 'Mentor' + Math.random().toString(36).slice(-6) + '!'

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: mentor_mail,
        password: wachtwoord,
        email_confirm: true
      })

      if (authError) {
        console.error('Mentor account aanmaken error:', authError)
        return res.status(500).json({ error: 'Kon mentor account niet aanmaken: ' + authError.message })
      }

      const naamDelen = mentor_naam.trim().split(' ')
      const voornaam = naamDelen[0]
      const achternaam = naamDelen.slice(1).join(' ') || ''

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          voornaam,
          achternaam,
          rol: 'mentor',
          email: mentor_mail
        })

      if (profileError) {
        console.error('Mentor profiel aanmaken error:', profileError)
      }

      await supabaseAdmin
        .from('stagevoorstellen')
        .update({ mentor_id: authData.user.id })
        .eq('id', id)

      // Koppel mentor aan student
      const { error: koppelError } = await supabaseAdmin
        .from('mentor_studenten')
        .insert({
          mentor_id: authData.user.id,
          student_id: data.student_id
        })

      if (koppelError) {
        console.error('Mentor-student koppeling error:', koppelError)
      }

      mentorCredentials = {
        email: mentor_mail,
        wachtwoord
      }
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

    res.json({ stagevoorstel: data, mentorCredentials })
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

// DELETE /api/stagevoorstellen/:id — student verwijdert voorstel (demo reset)
router.delete('/:id', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('stagevoorstellen')
      .delete()
      .eq('id', id)
      .eq('student_id', req.user.id)

    if (error) return res.status(500).json({ error: 'Kon stagevoorstel niet verwijderen' })

    res.json({ message: 'Stagevoorstel verwijderd' })
  } catch (err) {
    console.error('Stagevoorstel verwijderen error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/stagevoorstellen/:id/reset — reset status naar ingediend (demo)
router.put('/:id/reset', authMiddleware, requireRole('student'), async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('stagevoorstellen')
      .update({ 
        status: 'ingediend', 
        feedback_aanpassen: null, 
        feedback_positief: null,
        mentor_naam: null,
        mentor_mail: null,
        mentor_id: null
      })
      .eq('id', id)
      .eq('student_id', req.user.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Kon status niet resetten' })

    // Verwijder mentor-student koppeling
    await supabaseAdmin
      .from('mentor_studenten')
      .delete()
      .eq('student_id', req.user.id)

    res.json({ stagevoorstel: data })
  } catch (err) {
    console.error('Reset error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router