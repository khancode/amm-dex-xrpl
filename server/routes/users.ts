import express from 'express'
import type { Router, Request, Response } from 'express'

const router: Router = express.Router()

router.get('/', (req: Request, res: Response) => {
    // TODO: fetch all users
    res.send('TODO: fetch all users')
})

router.get('/:username', (req: Request, res: Response) => {
    // TODO: fetch user using username
    const { username } = req.body
    console.log(`username: ${username}`)
    res.send(`TODO: fetch user using ${username}`)
})

export default router
