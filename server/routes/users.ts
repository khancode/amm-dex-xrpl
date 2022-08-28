import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { logBalancesWithIUserList } from '../xrpl_util'

const router: Router = express.Router()

router.get('/', async (req: Request, res: Response) => {
    const users: IUser[] = await User.find({})
    res.status(200).send(users)
})

router.get('/balances', async (req: Request, res: Response) => {
    const users: IUser[] = await User.find({})
    const balances = await logBalancesWithIUserList(users)
    res.status(200).send(balances)
})

router.get('/balances/:username', async (req: Request, res: Response) => {
    const { username } = req.params

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const balances = await logBalancesWithIUserList([user])
    res.status(200).send(balances[0])
})

export default router
