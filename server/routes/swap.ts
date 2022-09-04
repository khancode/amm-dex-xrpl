import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { offerCreate, paymentSwap } from '../xrpl_util'
import { Swap } from '../database/models/swap'

const router: Router = express.Router()

router.post('/', async (req: Request, res: Response) => {
    const { username, swapAsset, withAsset } = req.body

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    // BUG: Neither offerCreate doesn't work for currency swap
    // const result = await offerCreate(
    //     user.wallet.seed,
    //     swapAsset,
    //     withAsset,
    // )
    // BUG: paymentSwap doesn't consistently work
    const result = await paymentSwap(
        user.wallet.seed,
        swapAsset,
        withAsset,
    )

    const txResult = result.meta.TransactionResult
    if (txResult !== `tesSUCCESS`) {
        res.status(400).send({ error: txResult })
        return
    }

    const swap = new Swap({
        date: new Date(),
        username,
        takerPays: swapAsset,
        takerGets: withAsset,
    })
    await swap.save()

    res.status(200).send(result)
})

export default router
