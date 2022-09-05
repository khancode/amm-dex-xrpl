import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { ammVote } from '../xrpl_util'

const router: Router = express.Router()

router.post('/', async (req: Request, res: Response) => {
    const { username, AMMID, FeeVal } = req.body

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const result = await ammVote(user.wallet.seed, AMMID, FeeVal)

    const txResult = result.meta.TransactionResult
    if (txResult !== `tesSUCCESS`) {
        res.status(400).send({ error: txResult })
        return
    }

    res.status(200).send(result)
})

export default router
