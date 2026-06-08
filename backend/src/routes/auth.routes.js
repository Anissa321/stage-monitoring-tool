import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout } from '../controllers/auth.controller.js'

const router = Router()

// Rate limiter: max 5 login pogingen per 15 minuten per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    error: 'Te veel login pogingen, probeer over 15 minuten opnieuw' 
  },
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/login', loginLimiter, login)
router.post('/logout', logout)

export default router