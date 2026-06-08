import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'

dotenv.config()

const app = express()

// CORS — frontend toelaten
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

// Body parser voor JSON requests
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend draait' })
})

// Auth routes
app.use('/api/auth', authRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint niet gevonden' })
})

export default app