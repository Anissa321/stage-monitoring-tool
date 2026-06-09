import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/requireRole.js'


const router = Router()

// GET /api/docent/dashboard
// Alleen toegankelijk voor docenten
router.get(
  '/dashboard',
  authMiddleware,
  requireRole('docent'),
  (req, res) => {
    res.json({
      message: 'Welkom op het docent dashboard',
      docent: req.user
    })
  }
)

export default router