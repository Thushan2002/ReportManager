import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

const BEARER_PREFIX = 'Bearer '

export const requireAuth = (request, _response, next) => {
  const header = request.headers.authorization

  if (!header?.startsWith(BEARER_PREFIX)) {
    const error = new Error('Authentication required')
    error.statusCode = 401
    return next(error)
  }

  const token = header.slice(BEARER_PREFIX.length)

  try {
    request.user = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] })
    return next()
  } catch {
    const error = new Error('Invalid or expired token')
    error.statusCode = 401
    return next(error)
  }
}