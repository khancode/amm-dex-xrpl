import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'

const router: Router = express.Router()

router.get('/', async (req: Request, res: Response) => {
    const users: IUser[] = await User.find({})
    res.status(200).send(users)
})

router.get('/:username', async (req: Request, res: Response) => {
    const { username } = req.params

    const user: IUser|null = await User.findOne({ username })
    
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
    } else {
        res.status(200).send(user)
    }
})

export default router
