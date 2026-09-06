import app from './app.js'
import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import logger from './utils/logger.js'

const startServer = async () => {
	await connectDatabase()

	app.listen(config.port, () => {
		logger.info(`API listening on port ${config.port}`)
	})
}

startServer().catch((error) => {
	logger.error('Unable to start API', error)
	process.exitCode = 1
})
