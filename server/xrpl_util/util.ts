import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import { Client, validate, xrpToDrops, Wallet, OfferCreateFlags, AccountSetAsfFlags } from 'xrpl'
import { Amount } from 'xrpl/dist/npm/models/common'
import { Transaction } from '../database/models/transaction'
import { IUser } from '../database/models/user'

dotenv.config()

const {
    LOGS_DIR,
    LOCAL_XRPL_SERVER,
    GENESIS_ACCOUNT,
    GENESIS_SECRET,
    XRPL_SERVER,
    AMM_DEVNET_FAUCET_SERVER,
} = process.env

if (process.env.USE_LOCAL_XRPL == undefined) {
    throw Error(`USE_LOCAL_XRPL env variable is undefined`)
}
const useLocalXrplLowercase = process.env.USE_LOCAL_XRPL?.toLowerCase()
if (useLocalXrplLowercase !== 'true' && useLocalXrplLowercase !== 'false') {
    throw Error(`USE_LOCAL_XRPL env variable must be a boolean value`)
}
const USE_LOCAL_XRPL = useLocalXrplLowercase === 'true'

if (LOGS_DIR == undefined) {
    throw Error(`LOGS_DIR env variable is undefined`)
}
if (LOCAL_XRPL_SERVER == undefined) {
    throw Error(`LOCAL_XRPL_SERVER env variable is undefined`)
}
if (GENESIS_ACCOUNT == undefined) {
    throw Error(`GENESIS_ACCOUNT env variable is undefined`)
}
if (GENESIS_SECRET == undefined) {
    throw Error(`GENESIS_SECRET env variable is undefined`)
}
if (XRPL_SERVER == undefined) {
    throw Error(`XRPL_SERVER env variable is undefined`)
}
if (AMM_DEVNET_FAUCET_SERVER == undefined) {
    throw Error(`AMM_DEVNET_FAUCET_SERVER env variable is undefined`)
}

const LOG_FILEPATH = `${LOGS_DIR}/xrpl.txt`

const walletAliasMap = new Map() // wallet address to alias map

const client = new Client(USE_LOCAL_XRPL ? LOCAL_XRPL_SERVER : XRPL_SERVER)

const GENESIS_WALLET = Wallet.fromSeed(GENESIS_SECRET)

async function connectClient() {
    const server = `${USE_LOCAL_XRPL ? 'Local' : 'AMMDevnet'} XRPL`
    console.log(`${server} connecting...`)
    await client.connect()
    console.log(`${server} Connected\n`)
}

async function disconnectClient() {
    const server = `${USE_LOCAL_XRPL ? 'Local' : 'AMMDevnet'} XRPL`
    console.log(`${server} disconnecting...`)
    await client.disconnect()
    console.log(`${server} Disconnected!`)
}

function clearFile() {
    fs.writeFileSync(LOG_FILEPATH, '')
}

function appendToFile(content: string) {
    if (!fs.existsSync(LOGS_DIR as string)){
        fs.mkdirSync(LOGS_DIR as string);
    }    
    fs.appendFileSync(LOG_FILEPATH, content)
    console.log(content)
}

async function autofillAndSubmit(wallet: Wallet, tx: any) {
    const prepared = await client.autofill(tx)
    const signed = wallet.sign(prepared)
    return client.submitAndWait(signed.tx_blob)
}

async function sendPayment(wallet: Wallet, destination: string, amount: Amount, sendMax?: Amount) {
    const paymentTx = {
        TransactionType: 'Payment',
        Account: wallet.address,
        Amount: amount,
        Destination: destination,
    }
    if (sendMax != null) {
        // @ts-ignore
        paymentTx.SendMax = sendMax
    }
    validate(paymentTx)

    // Write to file
    const formatAmount = typeof amount === 'string' ? `${amount} drops` : `${amount.value} ${amount.currency}`
    const fileContent =
        `Payment:\n` +
        `\t- ${walletAliasMap.get(wallet.address)} sending ${formatAmount} to ${walletAliasMap.get(destination)}\n` +
        `${JSON.stringify(paymentTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: paymentTx.TransactionType,
        payload: paymentTx,
    })
    void txModel.save()

    return autofillAndSubmit(wallet, paymentTx)
}

async function sendIOUPayment(wallet: Wallet, destination: string, currency: string, issuerWallet: Wallet, value: string) {
    return sendPayment(
        wallet,
        destination,
        {
            currency,
            issuer: issuerWallet.address,
            value,
        }
    )
}

interface FundWalletResponse {
    account: {
        xAddress: string
        secret: string
        classicAddress: string
        address: string
    }
    amount: number // Default 10,000 XRP funded
    balance: number
}

async function fundWallet(destination?: string): Promise<FundWalletResponse> {
    if (USE_LOCAL_XRPL) {
        const newWallet = Wallet.generate()
        await sendPayment(GENESIS_WALLET, newWallet.address, xrpToDrops(10000))
        return {
            account: {
                xAddress: newWallet.getXAddress(),
                secret: newWallet.seed!,
                classicAddress: newWallet.classicAddress,
                address: newWallet.address,
            },
            amount: 10000,
            balance: 10000,
        }
    }
    const body = destination != null ? { destination }: null
    const response = await axios.post(AMM_DEVNET_FAUCET_SERVER!, body)
    return response.data
}

async function initWallet(alias: string): Promise<Wallet> {
    const { account } = await fundWallet()
    const wallet = Wallet.fromSecret(account.secret)
    walletAliasMap.set(wallet.address, alias)
    return wallet
}

async function logBalances() {
    const promises: Promise<any>[] = []
    walletAliasMap.forEach((alias, address) => {
        promises.push(new Promise((resolve) => {
            client.getBalances(address).then((balances) => {
                resolve({ alias, address, balances })
            })
        }))
    })
    
    return Promise.all(promises).then((values) => {
        let fileContent = `Balances:\n`
        for (const i in values) {
            const { alias, address, balances } = values[i]
            fileContent += `\t- ${alias}: ${address}\n`
            fileContent += `\t\t${JSON.stringify(balances)}\n\n`
        }

        // Write to file
        appendToFile(fileContent)
    });
}

interface IUserBalance {
    username: string
    address: string
    balances: Array<{
        currency: string
        value: string
        issuer?: string
    }>
}

async function logBalancesWithIUserList(userList: IUser[]): Promise<IUserBalance[]> {
    const promises: Promise<any>[] = []
    for (const i in userList) {
        const user = userList[i]
        const { username, wallet } = user
        promises.push(new Promise((resolve) => {
            client.getBalances(user.wallet.address).then((balances) => {
                resolve({ username, address: wallet.address, balances })
            })
        }))
    }
    
    let balances: IUserBalance[] = []
    await Promise.all(promises).then((values: IUserBalance[]) => {
        balances = values
        let fileContent = `Balances:\n`
        for (const i in values) {
            const { username, address, balances } = values[i]
            fileContent += `\t- ${username}: ${address}\n`
            fileContent += `\t\t${JSON.stringify(balances)}\n\n`
        }

        // Write to file
        appendToFile(fileContent)
    });

    return balances
}

async function initTrustline(liquidityProviderWallet: Wallet, issuerWallet: Wallet, currency: string, limitAmountValue: string) {
    const trustsetTx = {
        TransactionType: 'TrustSet',
        Account: liquidityProviderWallet.address,
        LimitAmount: {
            currency,
            issuer: issuerWallet.address,
            value: limitAmountValue,
        },
    }
    validate(trustsetTx)

    // Write to file
    const fileContent =
        `TrustSet:\n` +
        `\t- Creating trustline from ${walletAliasMap.get(liquidityProviderWallet.address)} to ${walletAliasMap.get(issuerWallet.address)}\n` +
        `${JSON.stringify(trustsetTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: trustsetTx.TransactionType,
        payload: trustsetTx,
    })
    void txModel.save()

    return autofillAndSubmit(liquidityProviderWallet, trustsetTx)
}

async function offerCreate(wallet: Wallet, takerGets: Amount, takerPays: Amount) {
    const offerCreateTx = {
        TransactionType: 'OfferCreate',
        Account: wallet.address,
        TakerGets: takerGets,
        TakerPays: takerPays,
        Flags: OfferCreateFlags.tfSell
    }
    validate(offerCreateTx)

    // Write to file
    const formatTakerGets = typeof takerGets === 'string' ? `${takerGets} drops` : `${takerGets.value} ${takerGets.currency}`
    const formatTakerPays = typeof takerPays === 'string' ? `${takerPays} drops` : `${takerPays.value} ${takerPays.currency}`
    const fileContent =
        `OfferCreate:\n` +
        `\t- ${walletAliasMap.get(wallet.address)} - taker gets ${formatTakerGets} pays ${formatTakerPays}\n` +
        `${JSON.stringify(offerCreateTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: offerCreateTx.TransactionType,
        payload: offerCreateTx,
    })
    void txModel.save()

    return autofillAndSubmit(wallet, offerCreateTx)
}

async function accountOffers(account: string) {
    const request = {
        command: 'account_offers',
        account,
    }
    const response = await client.request(request)

    // Write to file
    const fileContent =
        `account_offers:\n` +
        `\t- account: ${account}\n` +
        `${JSON.stringify(response, null, 4)}\n\n`
    appendToFile(fileContent)

    return response
}

async function setupWalletsForAMM(gwAlias=`gateway`, lpAlias=`liquidityProvider`, currencies: string[]) {
    // 1. Init and fund gateway and liquidity provider with XRP
    const gateway = await initWallet(gwAlias)
    const liquidityProvider = await initWallet(lpAlias)

    // 2. Create Trustline(s) and fund liquidity provider with issued currencies
    for (const i in currencies) {
        const currency = currencies[i]
        await initTrustline(liquidityProvider, gateway, currency, '5000')
        await sendIOUPayment(gateway, liquidityProvider.address, currency, gateway, '1000')
    }

    return {
        gateway,
        liquidityProvider,
    }
}

async function ammInfoByAssets(asset1: Amount, asset2: Amount) {
    const request = {
        command: 'amm_info',
        asset1,
        asset2,
    }
    const response = await client.request(request)

    // Write to file
    const fileContent =
        `amm_info:\n` +
        `\t- asset1: ${asset1}\n` +
        `\t- asset2: ${JSON.stringify(asset2, null, 4)}\n` +
        `${JSON.stringify(response, null, 4)}\n\n`
    appendToFile(fileContent)

    return response
}

async function ammInfoById(amm_id: string) {
    const request = {
        command: 'amm_info',
        amm_id,
    }
    const response = await client.request(request)

    // Write to file
    const fileContent =
        `amm_info:\n` +
        `\t- amm_id: ${amm_id}\n` +
        `${JSON.stringify(response, null, 4)}\n\n`
    appendToFile(fileContent)

    return response
}

async function submitAmmInstanceCreate(liquidityProvider: Wallet, asset1: Amount, asset2: Amount, tradingFee: number) {
    const ammInstanceCreateTx = {
        TransactionType: 'AMMInstanceCreate',
        Account: liquidityProvider.address,
        Asset1: asset1,
        Asset2: asset2,
        TradingFee: tradingFee,
    }
    validate(ammInstanceCreateTx)

    // Write to file
    const fileContent =
        `AMMInstanceCreate:\n` +
        `\t- Account: ${walletAliasMap.get(liquidityProvider.address)}\n` +
        `${JSON.stringify(ammInstanceCreateTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammInstanceCreateTx.TransactionType,
        payload: ammInstanceCreateTx,
    })
    void txModel.save()

    return autofillAndSubmit(liquidityProvider, ammInstanceCreateTx)
}

async function submitAmmDepositWithLPToken(liquidityProvider: Wallet, ammId: string, lpToken: Amount) {
    const ammDepositTx = {
        TransactionType: 'AMMDeposit',
        Account: liquidityProvider.address,
        AMMID: ammId,
        LPToken: lpToken,
    }
    validate(ammDepositTx)

    // Write to file
    const fileContent =
        `AMMDeposit:\n` +
        `\t- Account: ${walletAliasMap.get(liquidityProvider.address)}\n` +
        `\t- LPToken: ${JSON.stringify(lpToken, null, 4)}\n` +
        `${JSON.stringify(ammDepositTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammDepositTx.TransactionType,
        payload: ammDepositTx,
    })
    void txModel.save()

    return autofillAndSubmit(liquidityProvider, ammDepositTx)
}

async function submitAmmDepositWithAsset1In(liquidityProvider: Wallet, ammId: string, asset1In: Amount) {
    const ammDepositTx = {
        TransactionType: 'AMMDeposit',
        Account: liquidityProvider.address,
        AMMID: ammId,
        Asset1In: asset1In,
    }
    validate(ammDepositTx)

    // Write to file
    const fileContent =
        `AMMDeposit:\n` +
        `\t- Account: ${walletAliasMap.get(liquidityProvider.address)}\n` +
        `\t- Asset1In: ${typeof asset1In === 'string' ? asset1In : JSON.stringify(asset1In, null, 4)}\n` +
        `${JSON.stringify(ammDepositTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammDepositTx.TransactionType,
        payload: ammDepositTx,
    })
    void txModel.save()

    return autofillAndSubmit(liquidityProvider, ammDepositTx)
}

async function submitAmmDepositWithAsset1InAndAsset2In(liquidityProvider: Wallet, ammId: string, asset1In: Amount, asset2In: Amount) {
    const ammDepositTx = {
        TransactionType: 'AMMDeposit',
        Account: liquidityProvider.address,
        AMMID: ammId,
        Asset1In: asset1In,
        Asset2In: asset2In,
    }
    validate(ammDepositTx)

    // Write to file
    const fileContent =
        `AMMDeposit:\n` +
        `\t- Account: ${walletAliasMap.get(liquidityProvider.address)}\n` +
        `\t- Asset1In: ${typeof asset1In === 'string' ? asset1In : JSON.stringify(asset1In, null, 4)}\n` +
        `\t- Asset2In: ${typeof asset2In === 'string' ? asset2In : JSON.stringify(asset2In, null, 4)}\n` +
        `${JSON.stringify(ammDepositTx, null, 4)}\n\n`
    appendToFile(fileContent)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammDepositTx.TransactionType,
        payload: ammDepositTx,
    })
    void txModel.save()

    return autofillAndSubmit(liquidityProvider, ammDepositTx)
}

async function enableRippling(wallet: Wallet) {
    const accountSet = {
        TransactionType: 'AccountSet',
        Account: wallet.address,
        SetFlag: AccountSetAsfFlags.asfDefaultRipple,
    }
    validate(accountSet)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: accountSet.TransactionType,
        payload: accountSet,
    })
    void txModel.save()

    return autofillAndSubmit(wallet, accountSet)
}

async function submitAmmVote(wallet: Wallet, AMMID: string, FeeVal: number) {
    const ammVoteTx = {
        TransactionType: 'AMMVote',
        Account: wallet.address,
        AMMID,
        FeeVal,
    }
    validate(ammVoteTx)

    // Write to MongoDB
    const txModel = new Transaction({
        date: new Date(),
        transactionType: ammVoteTx.TransactionType,
        payload: ammVoteTx,
    })
    void txModel.save()

    return autofillAndSubmit(wallet, ammVoteTx)
}

export {
    accountOffers,
    autofillAndSubmit,
    appendToFile,
    ammInfoByAssets,
    ammInfoById,
    clearFile,
    connectClient,
    disconnectClient,
    enableRippling,
    fundWallet,
    initTrustline,
    initWallet,
    logBalances,
    logBalancesWithIUserList,
    offerCreate,
    sendPayment,
    sendIOUPayment,
    setupWalletsForAMM,
    submitAmmDepositWithLPToken,
    submitAmmDepositWithAsset1In,
    submitAmmDepositWithAsset1InAndAsset2In,
    submitAmmInstanceCreate,
    submitAmmVote,
    walletAliasMap,
}
