import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

export const requireAuth = (request, _response, next) => {
  const token = request.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    const error = new Error('Authentication required')
    error.statusCode = 401
    return next(error)
  }

  try {
    request.user = jwt.verify(token, config.jwtSecret)
    return next()
  } catch {
    const error = new Error('Invalid or expired token')
    error.statusCode = 401
    return next(error)
  }
}
