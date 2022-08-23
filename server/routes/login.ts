import express from 'express'
import type { Router, Request, Response } from 'express'

import { IUser, User } from '../database/models/user'

const router: Router = express.Router()

router.post('/', async (req: Request, res: Response) => {
    const { username, password } = req.body

    let user: IUser|null = await User.findOne({ username, password})
    
    // For demo purposes, create the account if it doesn't exist.
    if (user == null) {
        const newUser = new User({
            username,
            password,
            wallet: {
                address: 'wallet_address',
                seed: 'wallet_seed',
            },
        })
        newUser.save()
        res.status(201).json({ success: 'account created and login approved'})
    } else {
        res.status(200).json({ success: 'login approved'})
    }
})

export default router
