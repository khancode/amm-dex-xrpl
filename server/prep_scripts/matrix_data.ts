export type ICO = string

export interface MATRIX_USER {
  username: string
  password: string
  currencies: string[]
}

export interface MATRIX_POOL {
  username: string
  asset1: {
    currency: string
    value: string
  }
  asset2: {
    currency: string
    value: string
  }
  tradingFee: number
}

// Currencies
const XRP = `XRP`
const BTC = `BTC`
const USD = `USD`
const ETH = `ETH`
const SOL = `SOL`
const ADA = `ADA`

export const ICOS: ICO[] = [
  BTC, USD, ETH, SOL, ADA,
]

export const USERS: MATRIX_USER[] = [
  {
    username: `khancode`,
    password: `khancode`,
    currencies: [BTC, ETH, USD],
  },
  {
    username: `satoshi`,
    password: `satoshi`,
    currencies: [BTC, USD],
  },
  {
    username: `giovanni`,
    password: `giovanni`,
    currencies: [ETH, USD],
  },
]

export const POOLS: MATRIX_POOL[] = [
  // {
  //   username: `khancode`,
  //   asset1: {
  //     currency: XRP,
  //     value: `1000`,
  //   },
  //   asset2: {
  //     currency: ETH,
  //     value: `1000`,
  //   },
  //   tradingFee: 0,
  // },
  {
    username: `satoshi`,
    asset1: {
      currency: BTC,
      value: `1000`,
    },
    asset2: {
      currency: USD,
      value: `1000`,
    },
    tradingFee: 0,
  },
  {
    username: `giovanni`,
    asset1: {
      currency: ETH,
      value: `1000`,
    },
    asset2: {
      currency: USD,
      value: `1000`,
    },
    tradingFee: 0,
  },
]