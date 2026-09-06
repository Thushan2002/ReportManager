import { Router } from 'express'
import authRoutes from './authRoutes.js'
import reportRoutes from './reportRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/reports', reportRoutes)

export default router
