import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

// GET /api/dashboards/mentor (US-07)
// Alleen toegankelijk voor gebruikers met rol 'mentor'
router.get('/mentor', authMiddleware, requireRole('mentor'), (req, res) => {
  res.json({
    message: 'Welkom op het mentor dashboard',
    user: req.user
  })
})

export default router