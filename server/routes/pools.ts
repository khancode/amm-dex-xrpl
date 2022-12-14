import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { ammDeposit, ammInfoByAssets, ammInfoById, ammInstanceCreate, ammWithdraw, logBalancesWithIUserList } from '../xrpl_util'
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

router.get('/balances', async (req: Request, res: Response) => {
    const pools: IPool[] = await Pool.find({})

    const AMMIDList = pools.map((pool) => pool.AMMID)

    const promises = []
    for (const i in AMMIDList) {
        const AMMID = AMMIDList[i]
        promises.push(new Promise((resolve) => {
            ammInfoById(AMMID).then((ammInfoResponse) => {
                resolve({ ...ammInfoResponse.result, AMMID })
            })
        }))
    }
    
    Promise.all(promises).then((ammInfoResultList) => {
        res.status(200).send(ammInfoResultList)
    })
})

router.get('/balances/include/:username', async (req: Request, res: Response) => {
    const { username } = req.params

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const userBalanceList = await logBalancesWithIUserList([user])
    const { balances } = userBalanceList[0]
    const currencyIssuerList = []
    for (const i in balances) {
        const { currency, issuer } = balances[i]
        currencyIssuerList.push({
            currency,
            issuer
        })
    }

    const pools = await Pool.find({ 'LPToken': { $in: currencyIssuerList } });

    const AMMIDList = pools.map((pool) => pool.AMMID)

    const promises = []
    for (const i in AMMIDList) {
        const AMMID = AMMIDList[i]
        promises.push(new Promise((resolve) => {
            ammInfoById(AMMID).then((ammInfoResponse) => {
                resolve({ ...ammInfoResponse.result, AMMID })
            })
        }))
    }
    
    Promise.all(promises).then((ammInfoResultList) => {
        res.status(200).send(ammInfoResultList)
    })
})

router.get('/balances/exclude/:username', async (req: Request, res: Response) => {
    const { username } = req.params

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const userBalanceList = await logBalancesWithIUserList([user])
    const { balances } = userBalanceList[0]
    const currencyIssuerList = []
    for (const i in balances) {
        const { currency, issuer } = balances[i]
        currencyIssuerList.push({
            currency,
            issuer
        })
    }

    const pools = await Pool.find({ 'LPToken': { $nin: currencyIssuerList } });

    const AMMIDList = pools.map((pool) => pool.AMMID)

    const promises = []
    for (const i in AMMIDList) {
        const AMMID = AMMIDList[i]
        promises.push(new Promise((resolve) => {
            ammInfoById(AMMID).then((ammInfoResponse) => {
                resolve({ ...ammInfoResponse.result, AMMID })
            })
        }))
    }
    
    Promise.all(promises).then((ammInfoResultList) => {
        res.status(200).send(ammInfoResultList)
    })
})

router.post('/deposit', async (req: Request, res: Response) => {
    const { username, ammId, lptoken, asset1, asset2, epriceValue } = req.body

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const result = await ammDeposit(
        user.wallet.seed,
        ammId,
        lptoken,
        asset1,
        asset2,
        epriceValue,
    )

    const txResult = result.meta.TransactionResult
    if (txResult !== `tesSUCCESS`) {
        res.status(404).send({ error: txResult })
        return
    }

    res.status(201).send(result)
})

router.post('/withdraw', async (req: Request, res: Response) => {
    const { username, ammId, lptoken, asset1, asset2, epriceValue } = req.body

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const result = await ammWithdraw(
        user.wallet.seed,
        ammId,
        lptoken,
        asset1,
        asset2,
        epriceValue,
    )

    const txResult = result.meta.TransactionResult
    if (txResult !== `tesSUCCESS`) {
        res.status(404).send({ error: txResult })
        return
    }

    res.status(201).send(result)
})

router.post('/search/lptokencurrencyissuerlist', async (req: Request, res: Response) => {
    const { LPTokenCurrencyIssuerList } = req.body
    const pools = await Pool.find({ 'LPToken': { $in: LPTokenCurrencyIssuerList } });
    res.status(200).send(pools)
})

export default router
