import express from 'express'
import type { Router, Request, Response } from 'express'
const router: Router = express.Router()

router.get('/', (req: Request, res: Response) => {
    res.send('TypeScript + Express server!')
})

router.get('/amm/:id', (req: Request, res: Response) => {
    const ammId = req.params.id
    res.json({ ammId })
})

router.post('/amm', (req: Request, res: Response) => {
    res.send('POST /amm success')
    console.log(req.body)
})

export default router
