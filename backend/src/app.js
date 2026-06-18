import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboards.routes.js'
import logboekenRoutes from './routes/logboeken.routes.js'
import stagevoorstellenRoutes from './routes/stagevoorstellen.routes.js'
import stageovereenkomstenRoutes from './routes/stageovereenkomsten.routes.js'
import tussentijdseEvaluatiesRoutes from './routes/tussentijdseEvaluaties.routes.js'
import evaluatieCompetentiesRoutes from './routes/evaluatieCompetencies.routes.js'
import gebruikersRoutes from './routes/gebruikers.routes.js'

dotenv.config()

const app = express()

app.use(helmet())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10kb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend draait' })
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboards', dashboardRoutes)
app.use('/api/logboeken', logboekenRoutes)
app.use('/api/stagevoorstellen', stagevoorstellenRoutes)
app.use('/api/stageovereenkomsten', stageovereenkomstenRoutes)
app.use('/api/tussentijdse-evaluaties', tussentijdseEvaluatiesRoutes)
app.use('/api/evaluatie-competenties', evaluatieCompetentiesRoutes)
app.use('/api/gebruikers', gebruikersRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint niet gevonden' })
})

app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Ongeldige JSON in request body' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body te groot' })
  }
  res.status(err.status || 500).json({ 
    error: err.message || 'Interne server fout' 
  })
})

export default app