export async function login(req, res) {
  try {
    const { email, password } = req.body

    // Input validatie
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email en wachtwoord zijn verplicht' 
      })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        error: 'Email en wachtwoord moeten strings zijn' 
      })
    }

    // TODO: Supabase authenticatie wordt toegevoegd in checkbox 2
    res.json({
      message: 'Login endpoint werkt',
      ontvangen: { email }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server fout' })
  }
}