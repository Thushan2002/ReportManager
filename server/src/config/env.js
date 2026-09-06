import 'dotenv/config'

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
}
