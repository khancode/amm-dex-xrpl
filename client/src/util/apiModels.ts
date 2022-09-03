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

export interface AMMInstanceIdentifier {
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

export interface CreatePoolResponse extends AMMInstanceIdentifier {}

export interface PoolBalance extends AMMInstanceIdentifier {
  TradingFee: number
  ledger_current_index: number
  validated: boolean
}

export interface GetUserPoolsBalancesResponse extends Array<PoolBalance> {}

export interface GetOtherPoolsBalancesResponse extends Array<PoolBalance> {}
