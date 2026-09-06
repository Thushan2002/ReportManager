import logger from '../utils/logger.js'

export const errorHandler = (error, _request, response, next) => {
  logger.error(error)

  if (response.headersSent) {
    return next(error)
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500

  response.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : error.message
  })
}