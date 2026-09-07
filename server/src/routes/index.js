import {Router} from 'express'
import authRoutes from './authRoutes.js'
import reportRoutes from './reportRoutes.js'
import projectRoutes from './projectRoutes.js'
import userRoutes from './userRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/reports', reportRoutes)
router.use('/projects', projectRoutes)
router.use('/users', userRoutes)

export default router

