import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, me } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:  100,
  message: { 
    error: 'Te veel login pogingen, probeer over 15 minuten opnieuw' 
  },
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/login', login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, me)

export default router