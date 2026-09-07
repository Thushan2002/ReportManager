import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { getSessionToken } from '../utils/session.js'

const BEARER_PREFIX = 'Bearer '

export const requireAuth = (request, _response, next) => {
  const header = request.headers.authorization
  const bearerToken = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : null
  const token = bearerToken || getSessionToken(request)

  if (!token) {
    const error = new Error('Authentication required')
    error.statusCode = 401
    return next(error)
  }

  try {
    request.user = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] })
    return next()
  } catch {
    const error = new Error('Invalid or expired token')
    error.statusCode = 401
    return next(error)
  }
}