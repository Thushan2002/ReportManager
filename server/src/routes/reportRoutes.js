import { Router } from 'express'
import { create, get, list, remove } from '../controllers/reportController.js'
import { requireAuth } from '../middlewares/auth.js'
import { validationMiddleware } from '../middlewares/validationMiddleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { reportSchema } from '../validations/report.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(list))
router.post('/', validationMiddleware(reportSchema), asyncHandler(create))
router.get('/:id', asyncHandler(get))
router.delete('/:id', asyncHandler(remove))

export default router
