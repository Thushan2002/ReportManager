import 'dotenv/config'

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const nodeEnv = process.env.NODE_ENV ?? 'development'
const isProduction = nodeEnv === 'production'

const requireInProduction = (value, name, devFallback) => {
  if (value) return value
  if (isProduction) {
    throw new Error(`${name} must be set in production`)
  }
  return devFallback
}

export const config = {
  nodeEnv,
  port: toNumber(process.env.PORT, 5000),
  mongoUri: requireInProduction(
    process.env.MONGODB_URI,
    'MONGODB_URI',
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/report_manager'
  ),
  jwtSecret: requireInProduction(
    process.env.JWT_SECRET,
    'JWT_SECRET',
    'development-secret-change-me'
  ),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  clientOrigin: requireInProduction(
    process.env.CLIENT_ORIGIN,
    'CLIENT_ORIGIN',
    'http://localhost:5173'
  )
}