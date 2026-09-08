import {Router} from 'express'
import {ask} from '../controllers/managerChatController.js'
import {requireAuth} from '../middlewares/auth.js'
import {requireRole} from '../middlewares/requireRole.js'
import {validationMiddleware} from '../middlewares/validationMiddleware.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ROLES} from '../constants/roles.js'
import {managerChatSchema} from '../validations/managerChat.js'

const router = Router()

router.use(requireAuth, requireRole(ROLES.ADMIN))
router.post('/', validationMiddleware(managerChatSchema), asyncHandler(ask))

export default router