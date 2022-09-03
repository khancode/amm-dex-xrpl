export type AMMTransactionType = `deposit` | `withdraw`

export interface CurrencyIssuerValue {
  currency: string
  value: string
  issuer?: string
}
