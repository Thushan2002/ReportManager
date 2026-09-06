import { Router } from 'express'
import { create, get, list, remove } from '../controllers/reportController.js'
import { requireAuth } from '../middlewares/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(list))
router.post('/', asyncHandler(create))
router.get('/:id', asyncHandler(get))
router.delete('/:id', asyncHandler(remove))

export default router
