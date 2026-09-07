import {Router} from 'express'
import {list, getStats, update, remove, updatePassword, updateOwnProfile} from '../controllers/userController.js'
import {requireAuth} from '../middlewares/auth.js'
import {requireRole} from '../middlewares/requireRole.js'
import {ROLES} from '../constants/roles.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {validationMiddleware} from '../middlewares/validationMiddleware.js'
import Joi from 'joi'

const updateUserSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  role: Joi.number().valid(...Object.values(ROLES))
}).min(1)

const passwordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
})

const profileSchema = Joi.object({
  name: Joi.string().trim().required()
})

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(list))
router.get('/:id/stats', asyncHandler(getStats))
router.patch('/profile/info', validationMiddleware(profileSchema), asyncHandler(updateOwnProfile))
router.patch('/profile/password', validationMiddleware(passwordSchema), asyncHandler(updatePassword))
router.patch('/:id', requireRole(ROLES.ADMIN), validationMiddleware(updateUserSchema), asyncHandler(update))
router.delete('/:id', requireRole(ROLES.ADMIN), asyncHandler(remove))

export default router
