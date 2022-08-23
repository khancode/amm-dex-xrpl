import express from 'express'
import type { Router, Request, Response } from 'express'

const router: Router = express.Router()

router.post('/', (req: Request, res: Response) => {
    // TODO: create a new liquidity pool
    res.send('TODO: create a new liquidity pool')
})

router.get('/', (req: Request, res: Response) => {
    // TODO: fetch all liquidity pools
    res.send('TODO: fetch all liquidity pools')
})

router.get('/:id', (req: Request, res: Response) => {
    // TODO: fetch liquidity pool using id
    res.send('TODO: fetch liquidity pool using id')
})

export default router
