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

// Helper: voert een delete uit en gooit een duidelijke fout als het misloopt
async function veiligVerwijderen(stap, queryBuilder) {
  const { error } = await queryBuilder
  if (error) {
    throw new Error(`Stap "${stap}" mislukt: ${error.message}`)
  }
}

// Helper: verwijdert alle gekoppelde activiteit/data van een gebruiker, afhankelijk van zijn rol
// Volgorde is cruciaal: altijd eerst de "kinderen" (rijen die naar iets anders verwijzen),
// dan pas de "ouders" (de rijen waar die kinderen naar verwezen).
async function verwijderGekoppeldeData(userId, rol) {
  if (rol === 'student') {
    // 1. Logboek-gerelateerd (kinderen eerst)
    const { data: logboeken } = await supabaseAdmin
      .from('logbooks')
      .select('id')
      .eq('student_id', userId)

    const logboekIds = (logboeken || []).map(l => l.id)
    if (logboekIds.length > 0) {
      await veiligVerwijderen('logbook_competencies', supabaseAdmin.from('logbook_competencies').delete().in('logbook_id', logboekIds))
      await veiligVerwijderen('logbook_reviews', supabaseAdmin.from('logbook_reviews').delete().in('logbook_id', logboekIds))
    }
    await veiligVerwijderen('logbooks', supabaseAdmin.from('logbooks').delete().eq('student_id', userId))

    // 2. Evaluaties en rapporten
    await veiligVerwijderen('tussentijdse_evaluaties', supabaseAdmin.from('tussentijdse_evaluaties').delete().eq('student_id', userId))
    await veiligVerwijderen('student_evaluaties', supabaseAdmin.from('student_evaluaties').delete().eq('student_id', userId))
    await veiligVerwijderen('tussentijdse_rapporten', supabaseAdmin.from('tussentijdse_rapporten').delete().eq('student_id', userId))

    // 3. Stageovereenkomst (verwijst naar stagevoorstel, dus VOOR het stagevoorstel zelf)
    await veiligVerwijderen('stageovereenkomsten', supabaseAdmin.from('stageovereenkomsten').delete().eq('student_id', userId))

    // 4. Stagevoorstel-aanpassingen (verwijzen naar stagevoorstel, dus VOOR het stagevoorstel zelf)
    const { data: voorstellen } = await supabaseAdmin
      .from('stagevoorstellen')
      .select('id')
      .eq('student_id', userId)

    const voorstelIds = (voorstellen || []).map(v => v.id)
    if (voorstelIds.length > 0) {
      await veiligVerwijderen('stagevoorstel_aanpassingen', supabaseAdmin.from('stagevoorstel_aanpassingen').delete().in('stagevoorstel_id', voorstelIds))
    }

    // 5. Nu pas het stagevoorstel zelf
    await veiligVerwijderen('stagevoorstellen', supabaseAdmin.from('stagevoorstellen').delete().eq('student_id', userId))

    // 6. Koppelingen met mentor/docent
    await veiligVerwijderen('mentor_studenten (student)', supabaseAdmin.from('mentor_studenten').delete().eq('student_id', userId))
    await veiligVerwijderen('docent_studenten (student)', supabaseAdmin.from('docent_studenten').delete().eq('student_id', userId))

  } else if (rol === 'mentor') {
    await veiligVerwijderen('logbook_reviews (mentor)', supabaseAdmin.from('logbook_reviews').delete().eq('mentor_id', userId))
    await veiligVerwijderen('tussentijdse_evaluaties (mentor)', supabaseAdmin.from('tussentijdse_evaluaties').delete().eq('mentor_id', userId))
    await veiligVerwijderen('mentor_studenten (mentor)', supabaseAdmin.from('mentor_studenten').delete().eq('mentor_id', userId))

    // Stagevoorstellen niet verwijderen, enkel loskoppelen — de student moet zijn voorstel behouden
    await veiligVerwijderen('stagevoorstellen mentor_id loskoppelen', supabaseAdmin.from('stagevoorstellen').update({ mentor_id: null }).eq('mentor_id', userId))

  } else if (rol === 'docent') {
    await veiligVerwijderen('logbook_reviews (docent)', supabaseAdmin.from('logbook_reviews').delete().eq('docent_id', userId))
    await veiligVerwijderen('tussentijdse_rapporten (docent)', supabaseAdmin.from('tussentijdse_rapporten').delete().eq('docent_id', userId))
    await veiligVerwijderen('docent_studenten (docent)', supabaseAdmin.from('docent_studenten').delete().eq('docent_id', userId))

    await veiligVerwijderen('stagevoorstellen docent_id loskoppelen', supabaseAdmin.from('stagevoorstellen').update({ docent_id: null }).eq('docent_id', userId))
  }
}

// DELETE /api/gebruikers/:id — admin verwijdert account + alle gekoppelde data
router.delete('/:id', authMiddleware, requireRole('administratie'), async (req, res) => {
  try {
    const { id } = req.params

    const { data: profiel } = await supabaseAdmin
      .from('profiles')
      .select('id, rol')
      .eq('id', id)
      .single()

    if (!profiel) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' })
    }

    // Eerst alle gekoppelde activiteit/data opruimen — gooit een duidelijke fout als een stap faalt
    await verwijderGekoppeldeData(id, profiel.rol)

    // Dan het profiel zelf
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileDeleteError) {
      console.error('Profiel verwijderen error:', profileDeleteError)
      return res.status(500).json({ error: 'Kon profiel niet verwijderen: ' + profileDeleteError.message })
    }

    // Tot slot het Auth-account
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (authDeleteError) {
      console.error('Auth account verwijderen error:', authDeleteError)
      return res.status(500).json({ error: 'Profiel verwijderd, maar kon Auth-account niet verwijderen: ' + authDeleteError.message })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Gebruiker verwijderen error:', err)
    res.status(500).json({ error: err.message || 'Server fout' })
  }
})

export default router