import axios from 'axios'
import {
  UserBalancesResponse,
  LoginResponse,
  CreatePoolResponse,
  GetUserPoolsBalancesResponse,
} from './apiModels'

const API_SERVER = `http://localhost:3000`
const API_LOGIN_URL = `${API_SERVER}/login`
const API_USERS_URL = `${API_SERVER}/users`
const API_POOLS_URL = `${API_SERVER}/pools`

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  return await new Promise((resolve, reject) => {
    const body = { username, password }
    axios
      .post(API_LOGIN_URL, body)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as LoginResponse)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

export async function getUserBalances(
  username: string
): Promise<UserBalancesResponse> {
  return await new Promise((resolve, reject) => {
    axios
      .get(`${API_USERS_URL}/balances/${username}`)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as UserBalancesResponse)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

export async function createPool(
  username: string,
  asset1: { currency: string; issuer: string; value: string },
  asset2: { currency: string; issuer: string; value: string },
  tradingFee: number
): Promise<CreatePoolResponse> {
  return await new Promise((resolve, reject) => {
    const body = { username, asset1, asset2, tradingFee }
    axios
      .post(API_POOLS_URL, body)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as CreatePoolResponse)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

/**
 * Queries balances of all pools that a user has liquidity in.
 * This should be called periodically to see latest pool(s) balance(s).
 * @param AMMIDList
 * @returns Promise<PoolsBalancesResponse>
 */
export async function getUserPoolsBalances(
  username: string
): Promise<GetUserPoolsBalancesResponse> {
  return await new Promise((resolve, reject) => {
    axios
      .get(`${API_POOLS_URL}/user/${username}`)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as GetUserPoolsBalancesResponse)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}
