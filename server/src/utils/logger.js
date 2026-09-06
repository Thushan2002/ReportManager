import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
})

export const requestLogger = (request, response, next) => {
  const start = Date.now()

  const path = request.originalUrl.split('?')[0]

  response.on('finish', () => {
    const durationMs = Date.now() - start
    logger.info(`${request.method} ${path} ${response.statusCode} ${durationMs}ms`)
  })

  next()
}

export default logger