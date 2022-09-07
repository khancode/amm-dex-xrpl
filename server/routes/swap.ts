import express from 'express'
import type { Router, Request, Response } from 'express'
import { IUser, User } from '../database/models/user'
import { ammDeposit, ammInfoById, ammWithdraw, offerCreate, paymentSwap } from '../xrpl_util'
import { Swap } from '../database/models/swap'
import { Pool } from '../database/models/pool'
import { AMMInfoResponse } from 'xrpl'
import { IssuedCurrencyAmount } from 'xrpl/dist/npm/models/common'

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

router.post('/spotprice', async (req: Request, res: Response) => {
    const { swapAsset, withAsset } = req.body

    const pools = await Pool.find({});

    const AMMIDList = pools.map((pool) => pool.AMMID)

    const promises: Promise<{
        ammInfoResponse: AMMInfoResponse
        AMMID: string
    }>[] = []
    for (const i in AMMIDList) {
        const AMMID = AMMIDList[i]
        promises.push(
            ammInfoById(AMMID).then((ammInfoResponse) => {
                return { ammInfoResponse, AMMID }
            })
        )
    }
    
    const ammInfoResponseAMMIDList = await Promise.all(promises)

    const ammInfoResponseAMMID = ammInfoResponseAMMIDList.find(({ ammInfoResponse, AMMID }) => {
        const { Asset1, Asset2 } = ammInfoResponse.result
        const asset1IssuedCurrency: IssuedCurrencyAmount =
            typeof Asset1 === `string` ? { currency: `XRP`, issuer: ``, value: Asset1 } : Asset1
        const asset2IssuedCurrency: IssuedCurrencyAmount =
            typeof Asset2 === `string` ? { currency: `XRP`, issuer: ``, value: Asset2 } : Asset2
        return (
            (asset1IssuedCurrency.currency === swapAsset.currency && asset2IssuedCurrency.currency === withAsset.currency)
            || (asset1IssuedCurrency.currency === withAsset.currency && asset2IssuedCurrency.currency === swapAsset.currency)
        )
    })

    if (ammInfoResponseAMMID == null) {
        res.status(404).json({ error: `No AMM instance available for currency swap.`})
        return
    }

    const { ammInfoResponse, AMMID } = ammInfoResponseAMMID
    const { Asset1, Asset2, TradingFee } = ammInfoResponse.result

    const swapAssetSelected = swapAsset.currency === (typeof Asset1 === `string` ? `XRP` : Asset1.currency) ? Asset1 : Asset2
    const withAssetSelected = swapAssetSelected === Asset1 ? Asset2 : Asset1

    const Ra = Number(typeof swapAssetSelected === `string` ? swapAssetSelected : swapAssetSelected.value)
    const Rb = Number(typeof withAssetSelected === `string` ? withAssetSelected : withAssetSelected.value)
    const totalBalance = Ra + Rb
    const Wa = Ra / totalBalance
    const Wb = Rb / totalBalance
    const tradingFeePercentage = TradingFee * .001 * .01

    const spotPrice = ((Rb^Wb) / (Ra^Wa)) * (1 / (1 - tradingFeePercentage))
    const exchangeRate =
        `1 ${typeof swapAssetSelected === `string` ? `XRP` : swapAssetSelected.currency} = ${spotPrice} ${typeof withAssetSelected === `string` ? `XRP` : withAssetSelected.currency}`

    res.status(200).json({
        spotPrice,
        exchangeRate,
        poolBalance: { ...ammInfoResponse.result, AMMID },
    })
})

router.post('/depositwithdraw', async (req: Request, res: Response) => {
    const { username, AMMID, swapAsset, withAsset } = req.body

    const user: IUser|null = await User.findOne({ username })
    if (user == null) {
        res.status(404).send({ error: `${username} not found`})
        return
    }

    const omitAsset = { currency: ``, issuer: ``, value: `` }

    const depositResult = await ammDeposit(
        user.wallet.seed,
        AMMID,
        omitAsset,
        swapAsset,
        omitAsset,
        ``
    )

    const depositTxResult = depositResult.meta.TransactionResult
    if (depositTxResult !== `tesSUCCESS`) {
        res.status(400).send({ error: depositTxResult })
        return
    }

    const slippagePercentage = 0.05
    const updateWithAsset = { ...withAsset }
    updateWithAsset.value = updateWithAsset.value * (1 - slippagePercentage)

    const withdrawResult = await ammWithdraw(
        user.wallet.seed,
        AMMID,
        omitAsset,
        withAsset,
        omitAsset,
        ``
    )

    const withdrawTxResult = withdrawResult.meta.TransactionResult
    if (withdrawTxResult !== `tesSUCCESS`) {
        res.status(400).send({ error: withdrawTxResult })
        return
    }

    // const swap = new Swap({
    //     date: new Date(),
    //     username,
    //     takerPays: swapAsset,
    //     takerGets: withAsset,
    // })
    // await swap.save()

    res.status(200).send({
        depositResult,
        withdrawResult,
    })
})

export default router
