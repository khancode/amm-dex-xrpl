import express from 'express'
import type { Router, Request, Response } from 'express'
import { step1_setupWalletsForAMM } from '../prep_scripts/step1_setupWalletsForAMM'
import { matrix_setupAMM } from '../prep_scripts/matrix_setup'

const router: Router = express.Router()

router.post('/setupwalletsforamm', async (req: Request, res: Response) => {
    const response = await step1_setupWalletsForAMM()
    res.send(response)
})

router.post('/matrixsetup', async (req: Request, res: Response) => {
    const response = await matrix_setupAMM()
    res.send(response)
})

export default router
