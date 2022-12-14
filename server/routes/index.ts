import express from 'express'
import type { Router } from 'express'

import pools from './pools'
import login from './login'
import transactions from './transactions'
import users from './users'
import ammdevnet from './ammdevnet'
import setupdata from './setupdata'
import swap from './swap'
import vote from './vote'

const router: Router = express.Router()

router.use('/login', login)
router.use('/pools', pools)
router.use('/transactions', transactions)
router.use('/users', users)
router.use('/setupdata', setupdata)
router.use('/ammdevnet', ammdevnet)
router.use('/swap', swap)
router.use('/vote', vote)

export default router
