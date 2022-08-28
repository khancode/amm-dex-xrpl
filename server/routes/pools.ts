import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { ammInfoByAssets, ammInstanceCreate } from '../xrpl_util'
import { Pool } from '../database/models/pool'

const router: Router = express.Router()

router.post('/', async (req: Request, res: Response) => {
    const { username, asset1, asset2, tradingFee } = req.body

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const response = await ammInstanceCreate(
        user.wallet.seed,
        asset1,
        asset2,
        tradingFee,
    )

    const ammInfoResponse = await ammInfoByAssets(response.Asset1, response.Asset2)
    const { AMMAccount, AMMID, Asset1, Asset2, LPToken } = ammInfoResponse.result

    const pool = new Pool({
        AMMAccount,
        AMMID,
        Asset1,
        Asset2,
        LPToken,
    })
    await pool.save()

    res.status(201).send({ 
        AMMAccount,
        AMMID,
        Asset1,
        Asset2,
        LPToken,
     })
})

router.get('/', async (req: Request, res: Response) => {
    const pools: IUser[] = await Pool.find({})
    res.status(200).send(pools)
})

router.get('/:id', (req: Request, res: Response) => {
    // TODO: fetch liquidity pool using id
    res.send('TODO: fetch liquidity pool using id')
})

export default router
