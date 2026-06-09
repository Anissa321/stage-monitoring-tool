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
// GET /api/dashboards/commissie (US-10)
router.get('/commissie', authMiddleware, requireRole('stagecommissie'), (req, res) => {
  res.json({
    message: 'Welkom op het stagecommissie dashboard',
    user: req.user
  })
})
// GET /api/dashboards/administratie (US-12)
router.get('/administratie', authMiddleware, requireRole('administratie'), (req, res) => {
  res.json({
    message: 'Welkom op het administratie dashboard',
    user: req.user
  })
})
export default router