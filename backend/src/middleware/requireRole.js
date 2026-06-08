// Rol-gebaseerde autorisatie
// Gebruik: router.get('/admin', authMiddleware, requireRole('administratie'), handler)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Niet geauthenticeerd' })
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'Geen toegang voor deze rol',
        jouwRol: req.user.rol,
        vereisteRollen: allowedRoles 
      })
    }

    next()
  }
}