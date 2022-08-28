import express from 'express'
import type { Router, Request, Response } from 'express'

import { IUser, User } from '../database/models/user'
import { initWallet } from '../xrpl_util'
import type { Wallet } from 'xrpl'

const router: Router = express.Router()

router.post('/', async (req: Request, res: Response) => {
    const { username, password } = req.body

    let user: IUser|null = await User.findOne({ username, password})
    
    // For demo purposes, create the account if it doesn't exist.
    if (user == null) {
        const wallet: Wallet = await initWallet(username)
        const newUser = new User({
            username,
            password,
            wallet: {
                address: wallet.address,
                seed: wallet.seed,
            },
        })
        await newUser.save()
        res.status(201).json({
            success: 'account created and login approved',
            user: newUser,
        })
    } else {
        res.status(200).json({
            success: 'login approved',
            user,
        })
    }
})

export default router
