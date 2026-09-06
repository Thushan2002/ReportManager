import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/env.js'
import { requestLogger } from './utils/logger.js'
import apiRoutes from './routes/index.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

if (!config.clientOrigin) {
	throw new Error('config.clientOrigin must be set')
}

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: config.clientOrigin }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(requestLogger)

app.get('/health', (_request, response) => {
	response.json({ status: 'ok', service: 'report-manager-api' })
})

app.use('/api', apiRoutes)
app.use(notFound)
app.use(errorHandler)

export default app