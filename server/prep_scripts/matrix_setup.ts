import mongoose from "mongoose";
import { Wallet } from "xrpl";
import { IPool, Pool } from "../database/models/pool";
import { IUser, User } from "../database/models/user"
import { ammInfoByAssets, ammInstanceCreate } from "../xrpl_util";
import { enableRippling, initTrustline, initWallet, logBalancesWithIUserList, sendIOUPayment, setupWalletsForAMM } from "../xrpl_util/util"
import { ICO, ICOS, MATRIX_POOL, MATRIX_USER, POOLS, USERS } from "./matrix_data";


const dropDatabase = async (): Promise<any> => {
  return mongoose.connection.dropDatabase();
}

const step0_matrix_setup_ICOs = async (icos: ICO[]): Promise<IUser[]> => {
  const walletPromises: Promise<{ username: string, wallet: Wallet }>[] = []
  for (const i in icos) {
    const currency = icos[i]
    const username = `${currency}_ICO`
    walletPromises.push(initWallet(username).then((wallet) => {
      return {
        username,
        wallet,
      }
    }))
  }

  const initWalletResults = await Promise.all(walletPromises)
  const accountSetPromises: Promise<any>[] = []
  for (const i in initWalletResults) {
    const { username, wallet } = initWalletResults[i]
    accountSetPromises.push(enableRippling(wallet))
  }
  await Promise.all(accountSetPromises)

  const icoUserPromises: Promise<IUser>[] = []
  for (const i in initWalletResults) {
    const { username, wallet } = initWalletResults[i]
    const newUser = new User({
      username,
      password: username,
      wallet: {
        address: wallet.address,
        seed: wallet.seed!,
      }
    })
    icoUserPromises.push(newUser.save())
  }

  return Promise.all(icoUserPromises)
}

const step1_matrix_setup_wallets = async (users: MATRIX_USER[], icoUsers: IUser[]): Promise<IUser[]> => {
  const usersWithWallets: IUser[] = []
  const userModelPromises: Promise<IUser>[] = []
  for (const i in users) {
    const { username, password, currencies } = users[i]

    const liquidityProvider = await initWallet(username)
    for (const j in currencies) {
      const currency = currencies[j]
      const icoUser = icoUsers.find((icoUser) => icoUser.username.split(`_`)[0] === currency)
      if (icoUser === undefined) {
        throw Error(`icoUser not found: ${icoUser}`)
      }
      const icoWallet = Wallet.fromSeed(icoUser?.wallet.seed)
      const icoValue = `10000`
      await initTrustline(liquidityProvider, icoWallet, currency, icoValue)
      await sendIOUPayment(icoWallet, liquidityProvider.address, currency, icoWallet, icoValue)
    }

    const liquidityProviderIUser = {
      username,
      password,
      wallet: {
        address: liquidityProvider.address,
        seed: liquidityProvider.seed!,
      }
    }
    usersWithWallets.push(liquidityProviderIUser)

    const liquidityProviderUser = new User(liquidityProviderIUser)
    userModelPromises.push(liquidityProviderUser.save())
  }

  return Promise.all(userModelPromises)
}

const step2_matrix_createpoolsAMM = async (users: IUser[], pools: MATRIX_POOL[]): Promise<IPool[]> => {
  const userBalances = await logBalancesWithIUserList(users)

  const promises = []
  for (const i in pools) {
    const { username, asset1, asset2, tradingFee } = pools[i]
    const { wallet } = users.find((user) => user.username === username)!
    const asset1Param = {
      ...asset1,
      issuer: userBalances
        .find((user) => user.username === username)
        ?.balances.find(({ currency }) => currency === asset1.currency)
        ?.issuer!
    }
    const asset2Param = {
      ...asset2,
      issuer: userBalances
        .find((user) => user.username === username)
        ?.balances.find(({ currency }) => currency === asset2.currency)
        ?.issuer!
    }
    promises.push(ammInstanceCreate(wallet.seed, asset1Param, asset2Param, tradingFee))
  }
  
  const instanceCreateResponses = await Promise.all(promises)

  const iPools: IPool[] = []
  for (const i in instanceCreateResponses) {
    const response = instanceCreateResponses[i]
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
    iPools.push(pool)
    await pool.save()
  }

  return iPools
}

export const matrix_setupAMM = async () => {
  await dropDatabase()
  const icoUsers = await step0_matrix_setup_ICOs(ICOS)
  const usersWithWallets = await step1_matrix_setup_wallets(USERS, icoUsers)
  const pools = await step2_matrix_createpoolsAMM(usersWithWallets, POOLS)
  return {
    icoUsers,
    usersWithWallets,
    pools,
  }
}
