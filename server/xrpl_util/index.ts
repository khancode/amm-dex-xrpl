import { AMMInfoResponse, validate, Wallet, xrpToDrops } from "xrpl";
import { Amount, IssuedCurrencyAmount } from "xrpl/dist/npm/models/common";
import { Transaction } from "../database/models/transaction";
import {
    ammInfoByAssets as ammInfoByAssetsUtil,
    ammInfoById as ammInfoByIdUtil,
    autofillAndSubmit,
    connectClient,
    fundWallet,
    initWallet,
    logBalancesWithIUserList,
    submitAmmInstanceCreate,
} from "./util";

const XRP = 'XRP'

void connectClient()

const convertToXRPLAsset = (asset: IssuedCurrencyAmount): Amount => {
    return asset.currency === XRP ? xrpToDrops(asset.value) : asset
}

interface AMMInstanceCreateResponse {
    Account: string
    Asset1: string
    Asset2: string
    TradingFee: number
    Fee: string
    Flags: number
}

interface AMMDepositResponse {
    AMMID: string
    Account: string
    LPToken?: IssuedCurrencyAmount
    Asset1In?: Amount
    Asset2In?: Amount
    EPrice?: Amount
    Fee: string
    Flags: number
    LastLedgerSequence: number
    Sequence: number
    SigningPubKey: string
    TransactionType: 'AMMDeposit'
    TxnSignature: string
    date: number
    hash: string
    inLedger: number
    ledger_index: number
    meta: {
        AffectedNodes: [any],
        TransactionIndex: number
        TransactionResult: 'tesSUCCESS' | string
    },
    validated: boolean
}

interface AMMWithdrawResponse {
    AMMID: string
    Account: string
    LPToken?: IssuedCurrencyAmount
    Asset1Out?: Amount
    Asset2Out?: Amount
    EPrice?: Amount
    Fee: string
    Flags: number
    LastLedgerSequence: number
    Sequence: number
    SigningPubKey: string
    TransactionType: 'AMMDeposit'
    TxnSignature: string
    date: number
    hash: string
    inLedger: number
    ledger_index: number
    meta: {
        AffectedNodes: [any],
        TransactionIndex: number
        TransactionResult: 'tesSUCCESS' | string
    },
    validated: boolean
}

const ammInstanceCreate = async (
    seed: string,
    asset1: IssuedCurrencyAmount,
    asset2: IssuedCurrencyAmount,
    tradingFee: number
): Promise<AMMInstanceCreateResponse> => {
    const liquidityProvider = Wallet.fromSeed(seed)
    const xrplAsset1 = convertToXRPLAsset(asset1)
    const xrplAsset2 = convertToXRPLAsset(asset2)
    const response = await submitAmmInstanceCreate(liquidityProvider, xrplAsset1, xrplAsset2, tradingFee)
    // @ts-ignore
    const { Account, Asset1, Asset2, TradingFee, Flags } = response.result
    return {
        Account, 
        Asset1, 
        Asset2, 
        TradingFee, 
        // @ts-ignore
        Flags: Flags!,
    }
}

const ammInfoByAssets = async (
    asset1: Amount,
    asset2: Amount,
): Promise<AMMInfoResponse> => {
    const response = (await ammInfoByAssetsUtil(asset1, asset2)) as AMMInfoResponse
    return response
}

const ammInfoById = async (
    amm_id: string,
): Promise<AMMInfoResponse> => {
    const response = (await ammInfoByIdUtil(amm_id)) as AMMInfoResponse
    console.log(response)
    return response
}

const ammDeposit = async (
    seed: string,
    ammId: string,
    lptoken: IssuedCurrencyAmount,
    asset1: IssuedCurrencyAmount,
    asset2: IssuedCurrencyAmount,
    epriceValue: string,
): Promise<AMMDepositResponse> => {
    const liquidityProvider = Wallet.fromSeed(seed)

    const ammDepositTx = {
        TransactionType: 'AMMDeposit',
        Account: liquidityProvider.address,
        AMMID: ammId,
    }

    if (lptoken.currency !== '') {
        // @ts-ignore
        ammDepositTx.LPToken = lptoken
    }
    if (asset1.currency !== '') {
        // @ts-ignore
        ammDepositTx.Asset1In = convertToXRPLAsset(asset1)
    }
    if (asset2.currency !== '') {
        // @ts-ignore
        ammDepositTx.Asset2In = convertToXRPLAsset(asset2)
    }
    // TODO: Resolve EPrice validation bug in xrpl.js
    if (epriceValue !== '') {
        // @ts-ignore
        ammDepositTx.EPrice = typeof ammDepositTx.Asset1In === 'string' ? epriceValue : {
            // @ts-ignore
            ...ammDepositTx.Asset1In,
            value: epriceValue,
        }
    }
    
    try {
        validate(ammDepositTx)
    } catch (e) {
        return {
            // @ts-ignore
            meta: {
                TransactionResult: `Invalid Transaction: AMMDeposit`,
            }
        }
    }

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammDepositTx.TransactionType,
        payload: ammDepositTx,
    })
    void txModel.save()

    const response = await autofillAndSubmit(liquidityProvider, ammDepositTx)
    return response.result as AMMDepositResponse
}

const ammWithdraw = async (
    seed: string,
    ammId: string,
    lptoken: IssuedCurrencyAmount,
    asset1: IssuedCurrencyAmount,
    asset2: IssuedCurrencyAmount,
    epriceValue: string,
): Promise<AMMWithdrawResponse> => {
    const liquidityProvider = Wallet.fromSeed(seed)

    const ammWithdrawTx = {
        TransactionType: 'AMMWithdraw',
        Account: liquidityProvider.address,
        AMMID: ammId,
    }

    if (lptoken.currency !== '') {
        // @ts-ignore
        ammWithdrawTx.LPToken = lptoken
    }
    if (asset1.currency !== '') {
        // @ts-ignore
        ammWithdrawTx.Asset1Out = convertToXRPLAsset(asset1)
    }
    if (asset2.currency !== '') {
        // @ts-ignore
        ammWithdrawTx.Asset2Out = convertToXRPLAsset(asset2)
    }
    // TODO: Resolve EPrice validation bug in xrpl.js
    if (epriceValue !== '') {
        // @ts-ignore
        ammWithdrawTx.EPrice = typeof ammWithdrawTx.Asset1Out === 'string' ? epriceValue : {
            // @ts-ignore
            ...ammWithdrawTx.Asset1Out,
            value: epriceValue,
        }
    }
    
    try {
        validate(ammWithdrawTx)
    } catch (e) {
        return {
            // @ts-ignore
            meta: {
                TransactionResult: `Invalid Transaction: AMMWithdraw`,
            }
        }
    }

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammWithdrawTx.TransactionType,
        payload: ammWithdrawTx,
    })
    void txModel.save()

    const response = await autofillAndSubmit(liquidityProvider, ammWithdrawTx)
    return response.result as AMMWithdrawResponse
}

export {
    ammDeposit,
    ammInstanceCreate,
    ammInfoByAssets,
    ammInfoById,
    ammWithdraw,
    fundWallet,
    initWallet,
    logBalancesWithIUserList,
}