import { Router } from 'express'

import { search } from '../controllers/searchController'
import { getAuthenticatedUser } from '../middlewares/auth'

const router = Router()

router.get('/', getAuthenticatedUser, search)

export default router
