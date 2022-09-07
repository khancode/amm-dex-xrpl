import axios from 'axios'
import { CurrencyIssuerValue } from '../types'
import {
  UserBalancesResponse,
  LoginResponse,
  CreatePoolResponse,
  GetAllPoolsBalancesResponse,
  GetUserPoolsBalancesResponse,
  GetOtherPoolsBalancesResponse,
  GetCurrencyExchangeInfoResponse,
} from './apiModels'

const API_SERVER = `http://localhost:3000`
const API_LOGIN_URL = `${API_SERVER}/login`
const API_USERS_URL = `${API_SERVER}/users`
const API_POOLS_URL = `${API_SERVER}/pools`
const API_SWAP_URL = `${API_SERVER}/swap`
const API_VOTE_URL = `${API_SERVER}/vote`
const API_TRANSACTIONS_URL = `${API_SERVER}/transactions`

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
 * Queries balances of all pools.
 * @param AMMIDList
 * @returns Promise<PoolsBalancesResponse>
 */
export async function getAllPoolsBalances(
  username: string
): Promise<GetAllPoolsBalancesResponse> {
  return await new Promise((resolve, reject) => {
    axios
      .get(`${API_POOLS_URL}/balances`)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as GetOtherPoolsBalancesResponse)
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
      .get(`${API_POOLS_URL}/balances/include/${username}`)
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

/**
 * Queries balances of all pools that a user has liquidity in.
 * This should be called periodically to see latest pool(s) balance(s).
 * @param AMMIDList
 * @returns Promise<PoolsBalancesResponse>
 */
export async function getOtherPoolsBalances(
  username: string
): Promise<GetOtherPoolsBalancesResponse> {
  return await new Promise((resolve, reject) => {
    axios
      .get(`${API_POOLS_URL}/balances/exclude/${username}`)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as GetOtherPoolsBalancesResponse)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

export async function depositIntoPool(
  username: string,
  ammId: string,
  lptoken: CurrencyIssuerValue,
  asset1: CurrencyIssuerValue,
  asset2: CurrencyIssuerValue,
  epriceValue: string
): Promise<CreatePoolResponse> {
  return await new Promise((resolve, reject) => {
    const body = { username, ammId, lptoken, asset1, asset2, epriceValue }
    axios
      .post(`${API_POOLS_URL}/deposit`, body)
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

export async function withdrawFromPool(
  username: string,
  ammId: string,
  lptoken?: CurrencyIssuerValue,
  asset1?: CurrencyIssuerValue,
  asset2?: CurrencyIssuerValue,
  epriceValue?: string
): Promise<CreatePoolResponse> {
  return await new Promise((resolve, reject) => {
    const body = { username, ammId, lptoken, asset1, asset2, epriceValue }
    axios
      .post(`${API_POOLS_URL}/withdraw`, body)
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

export async function swapAssets(
  username: string,
  swapAsset: CurrencyIssuerValue,
  withAsset: CurrencyIssuerValue
): Promise<CreatePoolResponse> {
  return await new Promise((resolve, reject) => {
    const body = { username, swapAsset, withAsset }
    axios
      .post(`${API_SWAP_URL}`, body)
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

export async function getCurrencyExchangeInfo(
  swapAsset: CurrencyIssuerValue,
  withAsset: CurrencyIssuerValue
): Promise<GetCurrencyExchangeInfoResponse> {
  return await new Promise((resolve, reject) => {
    const body = { swapAsset, withAsset }
    axios
      .post(`${API_SWAP_URL}/spotprice`, body)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data as GetCurrencyExchangeInfoResponse)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

export async function swapAssetsDepositWithdraw(
  username: string,
  AMMID: string,
  swapAsset: CurrencyIssuerValue,
  withAsset: CurrencyIssuerValue
): Promise<any> {
  return await new Promise((resolve, reject) => {
    const body = { username, AMMID, swapAsset, withAsset }
    axios
      .post(`${API_SWAP_URL}/depositwithdraw`, body)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

export async function vote(
  username: string,
  AMMID: string,
  FeeVal: number
): Promise<any> {
  return await new Promise((resolve, reject) => {
    const body = { username, AMMID, FeeVal }
    axios
      .post(`${API_VOTE_URL}`, body)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}

export async function getTransactions(): Promise<any> {
  return await new Promise((resolve, reject) => {
    axios
      .get(API_TRANSACTIONS_URL)
      .then((response) => {
        if (response.status < 200 || response.status > 299) {
          reject(response.data.error)
        }
        resolve(response.data)
      })
      .catch((error) => {
        throw new Error(error)
      })
  })
}
