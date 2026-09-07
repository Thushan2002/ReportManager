import {Router} from 'express'
import {create, get, list, metrics, pulse, remove, review, submit, update} from '../controllers/reportController.js'
import {requireAuth} from '../middlewares/auth.js'
import {validationMiddleware} from '../middlewares/validationMiddleware.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {reportSchema, reviewSchema} from '../validations/report.js'
import {requireRole} from '../middlewares/requireRole.js'
import {ROLES} from '../constants/roles.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(list))
router.get('/metrics', requireRole(ROLES.ADMIN), asyncHandler(metrics))
router.get('/pulse', requireRole(ROLES.ADMIN), asyncHandler(pulse))
router.post('/', validationMiddleware(reportSchema), asyncHandler(create))
router.get('/:id', asyncHandler(get))
router.patch('/:id', validationMiddleware(reportSchema), asyncHandler(update))
router.post('/:id/submit', asyncHandler(submit))
router.post('/:id/review', requireRole(ROLES.ADMIN), validationMiddleware(reviewSchema), asyncHandler(review))
router.delete('/:id', asyncHandler(remove))

export default router
