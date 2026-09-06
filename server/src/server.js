import app from './app.js'
import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import logger from './utils/logger.js'

const startServer = async () => {
	await connectDatabase()

	const server = app.listen(config.port, () => {
		logger.info(`API listening on port ${config.port}`)
	})

	process.on('uncaughtException', (error) => {
		logger.error('Uncaught exception', error)
		process.exitCode = 1
		server.close()
	})

	process.on('unhandledRejection', (reason) => {
		logger.error('Unhandled promise rejection', reason)
		process.exitCode = 1
		server.close()
	})

	const shutdown = (signal) => {
		logger.info(`${signal} received, shutting down gracefully`)
		server.close(() => {
			logger.info('Server closed')
			process.exit(0)
		})
	}

	process.on('SIGTERM', () => shutdown('SIGTERM'))
	process.on('SIGINT', () => shutdown('SIGINT'))
}

startServer().catch((error) => {
	logger.error('Unable to start API', error)
	process.exitCode = 1
})