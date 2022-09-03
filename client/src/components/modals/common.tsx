import React, { ReactElement } from 'react'

import { UserBalancesResponse } from '../../util/apiModels'

export const getCurrencyOptions = (
  userBalances: UserBalancesResponse
): ReactElement[] => {
  return userBalances?.balances.map(({ currency }) => {
    return <option key={currency}>{currency}</option>
  })
}

export const getIssuer = (
  userBalances: UserBalancesResponse,
  currency?: string
): string => {
  if (userBalances === undefined || currency === `` || currency === `XRP`) {
    return ``
  }
  const { balances } = userBalances
  for (const i in balances) {
    const balance = balances[i]
    if (currency === balance.currency && balance.issuer != null) {
      return balance.issuer
    }
  }
  return ``
}
