import 'dotenv/config.js'

import express from 'express'

import apiRoutes from './routes/api/api.js'

const app = express()

/* SETTINGS */

app.set('host', process.env.NODE_HOST || '127.0.0.1')
app.set('port', process.env.NODE_PORT || 3000)
app.set('env', process.env.NODE_ENV || 'development')

/* MIDDLEWARE */

app.use(express.json())

/* ROUTES */

// API Routes
app.use('/api', apiRoutes)

export default app