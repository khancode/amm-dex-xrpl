import express from 'express'
import type { Router, Request, Response } from 'express'

import { IUser, User } from '../database/models/user'
import { ammInfoByAssets, ammInfoById, fundWallet } from '../xrpl_util'

const router: Router = express.Router()

router.post('/fundwallet/:username', async (req: Request, res: Response) => {
  const { username } = req.params

  let user: IUser|null = await User.findOne({ username })
  if (user == null) {
    res.status(404).send({ error: `${username} user not found. First, create an account using POST /login` })
  } else {
    const walletFunded = await fundWallet(user?.wallet.address)
    res.status(200).send(walletFunded)
  }
})

router.post('/ammInfoByAssets', async (req: Request, res: Response) => {
  const { Asset1, Asset2 } = req.body
  const ammInfoResponse = await ammInfoByAssets(Asset1, Asset2)
  res.status(200).send(ammInfoResponse)
})

router.post('/ammInfoById', async (req: Request, res: Response) => {
  const { amm_id } = req.body
  const ammInfoResponse = await ammInfoById(amm_id)
  res.status(200).send(ammInfoResponse)
})


export default router
