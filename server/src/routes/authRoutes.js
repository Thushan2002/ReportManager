import { Router } from 'express'
import { login, register } from '../controllers/authController.js'
import { validationMiddleware } from '../middlewares/validationMiddleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { inviteUserSchema, loginSchema, registrationSchema } from '../validations/auth.js'

const router = Router()

router.post('/register', validationMiddleware(registrationSchema), asyncHandler(register))
router.post('/login', validationMiddleware(loginSchema), asyncHandler(login))
router.post('/invite', validationMiddleware(inviteUserSchema), asyncHandler(login))

export default router
