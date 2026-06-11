import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import docentRoutes from './routes/docent.routes.js'
import dashboardRoutes from './routes/dashboards.routes.js'
import logboekenDocentRoutes from './routes/logboeken-docent.routes.js'
import logboekenRoutes from './routes/logboeken.routes.js'
dotenv.config()

const app = express()

// Security headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet())

// CORS — alleen jullie frontend toelaten
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parser met max size (DoS bescherming)
app.use(express.json({ limit: '10kb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend draait' })
})

// Auth routes
app.use('/api/auth', authRoutes)
app.use('/api/docent', docentRoutes)
app.use('/api/dashboards', dashboardRoutes)
app.use('/api/logboeken/docent', logboekenDocentRoutes)
app.use('/api/logboeken', logboekenRoutes)
// 404 handler — altijd na alle routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint niet gevonden' })
})

// Globale error handler — vangt alle ongevangen errors op
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  // JSON parse errors (zoals corrupt body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Ongeldige JSON in request body' })
  }
  
  // Body te groot
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body te groot' })
  }
  
  // Alle andere errors
  res.status(err.status || 500).json({ 
    error: err.message || 'Interne server fout' 
  })
})

export default app