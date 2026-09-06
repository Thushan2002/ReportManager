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

export const requestLogger = (request, _response, next) => {
  logger.info(`${request.method} ${request.originalUrl}`)
  next()
}

export default logger
