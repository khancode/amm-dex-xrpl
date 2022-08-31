export interface LoginResponse {
  success: string
  user: {
    _id: string
    username: string
    password: string
    wallet: {
      address: string
      seed: string
      _id: string
    }
  }
}

export interface UserBalancesResponse {
  username: string
  address: string
  balances: [
    {
      currency: string
      value: string
      issuer?: string
    }
  ]
}

export interface CreatePoolResponse {
  AMMAccount: string
  AMMID: string
  Asset1:
    | string
    | {
        currency: string
        issuer: string
        value: string
      }
  Asset2:
    | string
    | {
        currency: string
        issuer: string
        value: string
      }
  LPToken: {
    currency: string
    issuer: string
    value: string
  }
}

export interface GetUserPoolsBalancesResponse
  extends Array<{
    AMMAccount: string
    AMMID: string
    Asset1:
      | string
      | {
          currency: string
          issuer: string
          value: string
        }
    Asset2:
      | string
      | {
          currency: string
          issuer: string
          value: string
        }
    LPToken: {
      currency: string
      issuer: string
      value: string
    }
    TradingFee: number
    ledger_current_index: number
    validated: boolean
  }> {}
