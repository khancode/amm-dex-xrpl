import express from 'express'
import type { Router, Request, Response } from 'express'

const router: Router = express.Router()

router.get('/', (req: Request, res: Response) => {
    // TODO: fetch all transactions
    res.send('TODO: fetch all transactions')
})

export default router
