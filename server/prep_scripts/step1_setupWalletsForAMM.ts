import mongoose from "mongoose";
import { IUser, User } from "../database/models/user"
import { setupWalletsForAMM } from "../xrpl_util/util"

const USERS = [
  {
    username: `khancode`,
    password: `khancode`,
    currencies: [`ETH`],
  }
]

async function dropDatabase(): Promise<any> {
  return mongoose.connection.dropDatabase();
}

export const step1_setupWalletsForAMM = async (): Promise<IUser[]> => {
  await dropDatabase()

  const usersWithWallets: IUser[] = []
  for (const i in USERS) {
    const { username, password, currencies } = USERS[i]
    const gatewayUsername = `gateway_${i}`
    const { gateway, liquidityProvider } = await setupWalletsForAMM(`gateway_${i}`, username, currencies)
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

    // console.log(`Created new gateway user:`)
    // console.log(`\tusername: ${gatewayIUser.username}`)
    // console.log(`\tpassword: ${gatewayIUser.password}`)

    // console.log(`Created new liquidity provider user:`)
    // console.log(`\tusername: ${liquidityProviderIUser.username}`)
    // console.log(`\tpassword: ${liquidityProviderIUser.password}`)
    // console.log(`\tcurrencies: ${currencies}`)
  }
  return usersWithWallets
}
