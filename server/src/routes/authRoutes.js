import { Router } from 'express'
import { currentUser, invite, login, logout, register } from '../controllers/authController.js'
import { requireAuth } from '../middlewares/auth.js'
import { requireRole } from '../middlewares/requireRole.js'
import { validationMiddleware } from '../middlewares/validationMiddleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ROLES } from '../constants/roles.js'
import { inviteUserSchema, loginSchema, registrationSchema } from '../validations/auth.js'

const router = Router()

router.post('/register', validationMiddleware(registrationSchema), asyncHandler(register))
router.post('/login', validationMiddleware(loginSchema), asyncHandler(login))
router.post('/logout', logout)
router.get('/me', requireAuth, asyncHandler(currentUser))
router.post('/invite', requireAuth, requireRole(ROLES.ADMIN), validationMiddleware(inviteUserSchema), asyncHandler(invite))

export default router
