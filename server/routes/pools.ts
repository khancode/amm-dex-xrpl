import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { ammInfoByAssets, ammInstanceCreate, logBalancesWithIUserList } from '../xrpl_util'
import { IPool, Pool } from '../database/models/pool'

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

    // value isn't used to identify Assets or LPToken, so omit them
    const Asset1OmitValue = typeof Asset1 === 'string'
        ? Asset1
        : {
            currency: Asset1.currency,
            issuer: Asset1.issuer
        }
    const Asset2OmitValue = typeof Asset2 === 'string'
        ? Asset2
        : {
            currency: Asset2.currency,
            issuer: Asset2.issuer
        }
    const LPTokenOmitValue = typeof LPToken === 'string'
        ? LPToken
        : {
            currency: LPToken.currency,
            issuer: LPToken.issuer
        }

    const pool = new Pool({
        AMMAccount,
        AMMID,
        Asset1: Asset1OmitValue,
        Asset2: Asset2OmitValue,
        LPToken: LPTokenOmitValue,
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
    const pools: IPool[] = await Pool.find({})
    res.status(200).send(pools)
})

router.get('/:username', async (req: Request, res: Response) => {
    const { username } = req.params

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const userBalanceList = await logBalancesWithIUserList([user])
    const { balances } = userBalanceList[0]
    const iouCurrencyIssuerList = []
    for (const i in balances) {
        const { currency, issuer } = balances[i]
        iouCurrencyIssuerList.push({
            currency,
            issuer
        })
    }

    const pools = await Pool.find({ 'LPToken': { $in: iouCurrencyIssuerList } });

    res.status(200).send(pools)
})

router.post('/search/lptokencurrencyissuerlist', async (req: Request, res: Response) => {
    const { LPTokenCurrencyIssuerList } = req.body
    const pools = await Pool.find({ 'LPToken': { $in: LPTokenCurrencyIssuerList } });
    res.status(200).send(pools)
})

export default router
