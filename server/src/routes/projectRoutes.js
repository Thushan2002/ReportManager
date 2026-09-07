import {Router} from 'express'
import {create, list, remove, update} from '../controllers/projectController.js'
import {requireAuth} from '../middlewares/auth.js'
import {requireRole} from '../middlewares/requireRole.js'
import {ROLES} from '../constants/roles.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {validationMiddleware} from '../middlewares/validationMiddleware.js'
import Joi from 'joi'

const projectSchema = Joi.object({name: Joi.string().trim().required(), description: Joi.string().allow(''), members: Joi.array().items(Joi.string())})
const router = Router()
router.use(requireAuth)
router.get('/', asyncHandler(list))
router.post('/', requireRole(ROLES.ADMIN), validationMiddleware(projectSchema), asyncHandler(create))
router.patch('/:id', requireRole(ROLES.ADMIN), validationMiddleware(projectSchema), asyncHandler(update))
router.delete('/:id', requireRole(ROLES.ADMIN), asyncHandler(remove))

export default router