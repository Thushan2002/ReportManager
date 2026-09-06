import mongoose from 'mongoose'
import { config } from './env.js'
import logger from '../utils/logger.js'

export const connectDatabase = async () => {
  if (!config.mongoUri) {
    logger.warn('MONGODB_URI is not configured; starting without a database connection')
    return
  }

  await mongoose.connect(config.mongoUri)
  logger.info('Connected to MongoDB')
}
