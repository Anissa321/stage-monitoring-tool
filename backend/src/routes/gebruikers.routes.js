import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// GET /api/gebruikers — admin haalt alle gebruikers op
router.get('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, voornaam, achternaam, rol, created_at')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Kon gebruikers niet ophalen' })
    res.json({ gebruikers: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// GET /api/gebruikers/studenten-overzicht — admin ziet alle studenten met hun mentor/docent
router.get('/studenten-overzicht', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { data: studenten, error } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam, email')
      .eq('rol', 'student')
      .order('achternaam', { ascending: true })

    if (error) return res.status(500).json({ error: 'Kon studenten niet ophalen' })

    const { data: mentorKoppelingen } = await supabaseAdmin
      .from('mentor_studenten')
      .select('student_id, mentor_id')

    const { data: docentKoppelingen } = await supabaseAdmin
      .from('docent_studenten')
      .select('student_id, docent_id')

    const { data: mentors } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam, email')
      .eq('rol', 'mentor')

    const { data: docenten } = await supabaseAdmin
      .from('profiles')
      .select('id, voornaam, achternaam, email')
      .eq('rol', 'docent')

    const result = studenten.map(s => {
      const mentorKoppeling = mentorKoppelingen?.find(k => k.student_id === s.id)
      const docentKoppeling = docentKoppelingen?.find(k => k.student_id === s.id)
      const mentor = mentors?.find(m => m.id === mentorKoppeling?.mentor_id)
      const docent = docenten?.find(d => d.id === docentKoppeling?.docent_id)

      return {
        ...s,
        mentor_id: mentor?.id || null,
        mentor_naam: mentor ? `${mentor.voornaam} ${mentor.achternaam}` : null,
        docent_id: docent?.id || null,
        docent_naam: docent ? `${docent.voornaam} ${docent.achternaam}` : null
      }
    })

    res.json({ studenten: result, mentors, docenten })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// PUT /api/gebruikers/koppeling/:studentId — admin wijzigt mentor/docent van student
router.put('/koppeling/:studentId', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { studentId } = req.params
    const { mentor_id, docent_id } = req.body

    if (mentor_id !== undefined) {
      await supabaseAdmin.from('mentor_studenten').delete().eq('student_id', studentId)
      if (mentor_id) {
        await supabaseAdmin.from('mentor_studenten').insert({ mentor_id, student_id: studentId })
      }
    }

    if (docent_id !== undefined) {
      await supabaseAdmin.from('docent_studenten').delete().eq('student_id', studentId)
      if (docent_id) {
        await supabaseAdmin.from('docent_studenten').insert({ docent_id, student_id: studentId })
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// POST /api/gebruikers — admin maakt nieuw account aan
router.post('/', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { email, wachtwoord, voornaam, achternaam, rol } = req.body

    if (!email || !wachtwoord || !voornaam || !achternaam || !rol) {
      return res.status(400).json({ error: 'Alle velden zijn verplicht' })
    }

    const toegestaneRollen = ['mentor', 'docent', 'student', 'stagecommissie', 'administratie']
    if (!toegestaneRollen.includes(rol)) {
      return res.status(400).json({ error: 'Ongeldige rol' })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: wachtwoord,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(400).json({ error: authError.message || 'Kon gebruiker niet aanmaken' })
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        voornaam,
        achternaam,
        rol
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(500).json({ error: 'Kon profiel niet aanmaken' })
    }

    res.json({ gebruiker: { id: authData.user.id, email, voornaam, achternaam, rol } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

// DELETE /api/gebruikers/:id — admin verwijdert account
router.delete('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params

    await supabaseAdmin.from('profiles').delete().eq('id', id)

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) return res.status(500).json({ error: 'Kon gebruiker niet verwijderen' })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server fout' })
  }
})

export default router