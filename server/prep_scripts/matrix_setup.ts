import mongoose from "mongoose";
import { IPool, Pool } from "../database/models/pool";
import { IUser, User } from "../database/models/user"
import { ammInfoByAssets, ammInstanceCreate } from "../xrpl_util";
import { logBalancesWithIUserList, setupWalletsForAMM } from "../xrpl_util/util"
import { MATRIX_POOL, MATRIX_USER, POOLS, USERS } from "./matrix_data";


const dropDatabase = async (): Promise<any> => {
  return mongoose.connection.dropDatabase();
}

const step1_matrix_setupwalletsAMM = async (users: MATRIX_USER[]): Promise<IUser[]> => {
  await dropDatabase()

  const usersWithWallets: IUser[] = []
  for (const i in users) {
    const { username, password, currencies } = users[i]
    const gatewayUsername = `gateway_${i}`
    const { gateway, liquidityProvider } = await setupWalletsForAMM(gatewayUsername, username, currencies)
    const gatewayIUser = {
      username: gatewayUsername,
      password: gatewayUsername,
      wallet: {
        address: gateway.address,
        seed: gateway.seed!,
      }
    }
    const liquidityProviderIUser = {
      username,
      password,
      wallet: {
        address: liquidityProvider.address,
        seed: liquidityProvider.seed!,
      }
    }
    usersWithWallets.push(gatewayIUser, liquidityProviderIUser)

    const gatewayUser = new User(gatewayIUser)
    const liquidityProviderUser = new User(liquidityProviderIUser)
    await Promise.all([gatewayUser.save(), liquidityProviderUser.save()])
  }

  return usersWithWallets
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
  const usersWithWallets = await step1_matrix_setupwalletsAMM(USERS)
  const pools = await step2_matrix_createpoolsAMM(usersWithWallets, POOLS)
  return {
    usersWithWallets,
    pools,
  }
}
