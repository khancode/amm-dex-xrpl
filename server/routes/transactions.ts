import express from 'express'
import type { Router, Request, Response } from 'express'
import { ITransaction, Transaction } from '../database/models/transaction'

const router: Router = express.Router()

router.get('/', async (req: Request, res: Response) => {
    const transactions: ITransaction[] = await Transaction.find()
    res.status(200).json(transactions)
})

router.get('/:transactionType', async (req: Request, res: Response) => {
    const { transactionType } = req.params
    const transactions: ITransaction[] = await Transaction.find({ transactionType })
    res.status(200).json(transactions)
})

export default router
