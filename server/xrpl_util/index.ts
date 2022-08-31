import { AMMInfoResponse, Wallet, xrpToDrops } from "xrpl";
import { Amount, IssuedCurrencyAmount } from "xrpl/dist/npm/models/common";
import {
    ammInfoByAssets as ammInfoByAssetsUtil,
    ammInfoById as ammInfoByIdUtil,
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
    return response
}

export {
    ammInstanceCreate,
    ammInfoByAssets,
    ammInfoById,
    fundWallet,
    initWallet,
    logBalancesWithIUserList,
}