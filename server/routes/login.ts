import express from 'express'
import type { Router, Request, Response } from 'express'

const router: Router = express.Router()

router.post('/', (req: Request, res: Response) => {
    // TODO: login using username and password
    const { username, password } = req.body
    console.log(`username: ${username}`)
    console.log(`password: ${password}`)
    res.send(`TODO: login using ${username} and ${password}`)
})

export default router
