import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { ProgressBar } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { UserContext } from '../components/layout/Page'
import { CreatePoolModal } from '../components/modals/CreatePoolModal'
import {
  GetOtherPoolsBalancesResponse,
  GetUserPoolsBalancesResponse,
  UserBalancesResponse,
} from '../util/apiModels'
import {
  getUserBalances,
  createPool,
  getUserPoolsBalances,
  getOtherPoolsBalances,
} from '../util/apiRequests'

export const Pool: React.FC<{}> = () => {
  const { user, loading } = useContext(UserContext)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()
  const [userPoolsBalances, setUserPoolsBalances] =
    useState<GetUserPoolsBalancesResponse>([])
  const [otherPoolsBalances, setOtherPoolsBalances] =
    useState<GetOtherPoolsBalancesResponse>([])
  const [showCreatePoolModal, setShowCreatePoolModal] = useState<boolean>(false) // DEV: set to true to immediately open modal
  const [showLoadingIndicator, setShowLoadingIndicator] =
    useState<boolean>(false)

  useEffect(() => {
    if (!loading) {
      getUserBalances(user?.user.username).then((UserBalancesResponse) => {
        setUserBalances(UserBalancesResponse)
      })
      getUserPoolsBalances(user?.user.username).then(
        (getUserPoolsBalancesResponse) => {
          setUserPoolsBalances(getUserPoolsBalancesResponse)
        }
      )
      getOtherPoolsBalances(user?.user.username).then(
        (getOtherPoolsBalancesResponse) => {
          setOtherPoolsBalances(getOtherPoolsBalancesResponse)
        }
      )
    }
  }, [loading])

  const toggleCreatePoolModal = (): void => {
    setShowCreatePoolModal(!showCreatePoolModal)
  }

  const onCreate = (
    asset1Currency: string,
    asset1Issuer: string,
    asset1Value: string,
    asset2Currency: string,
    asset2Issuer: string,
    asset2Value: string,
    tradingFee: number
  ): void => {
    const asset1 = {
      currency: asset1Currency,
      issuer: asset1Issuer,
      value: asset1Value,
    }
    const asset2 = {
      currency: asset2Currency,
      issuer: asset2Issuer,
      value: asset2Value,
    }

    setShowLoadingIndicator(true)

    createPool(user.user.username, asset1, asset2, tradingFee).then((pool) => {
      getUserBalances(user?.user.username).then((userBalancesResponse) => {
        setUserBalances(userBalancesResponse)
        setShowLoadingIndicator(false)
        toggleCreatePoolModal()
      })
      getUserPoolsBalances(user?.user.username).then(
        (getUserPoolsBalancesResponse) => {
          setUserPoolsBalances(getUserPoolsBalancesResponse)
        }
      )
      getOtherPoolsBalances(user?.user.username).then(
        (getOtherPoolsBalancesResponse) => {
          setOtherPoolsBalances(getOtherPoolsBalancesResponse)
        }
      )
    })
  }

  const myBalances = (): ReactElement | ReactElement[] => {
    if (userBalances == null) {
      return <div>No balances</div>
    }

    return userBalances.balances.map((userBalance) => {
      const { currency, issuer, value } = userBalance
      return (
        <div key={`${currency}${issuer != null ? `_` + issuer : ``}`}>
          <b>{`${currency} -> ${Number(value).toLocaleString()}`}</b>
          {issuer != null && <div>{issuer}</div>}
        </div>
      )
    })
  }

  const showPools = (
    poolsBalances: GetUserPoolsBalancesResponse | GetOtherPoolsBalancesResponse
  ): ReactElement | ReactElement[] => {
    if (poolsBalances.length === 0) {
      return <div>No active positions</div>
    }

    return poolsBalances.map((poolBalance) => {
      const { AMMID, Asset1, Asset2, LPToken } = poolBalance
      const asset1Currency =
        typeof Asset1 === `string` ? `XRP` : Asset1.currency
      const asset2Currency =
        typeof Asset2 === `string` ? `XRP` : Asset2.currency
      const asset1Value = Number(
        typeof Asset1 === `string` ? Number(Asset1) / 1000000 : Asset1.value
      )
      const asset2Value = Number(
        typeof Asset2 === `string` ? Number(Asset2) / 1000000 : Asset2.value
      )
      const totalAssetsValue = asset1Value + asset2Value
      const asset1Percentage = (asset1Value / totalAssetsValue) * 100
      const asset2Percentage = (asset2Value / totalAssetsValue) * 100
      const asset1Label = `${asset1Value.toLocaleString()} ${asset1Currency}`
      const asset2Label = `${asset2Value.toLocaleString()} ${asset2Currency}`
      const LPTokenDetails = `${Number(
        LPToken.value
      ).toLocaleString()} LPToken (${LPToken.currency})`
      return (
        <div key={AMMID}>
          <div>{LPTokenDetails}</div>
          <ProgressBar>
            <ProgressBar
              now={asset1Percentage}
              label={asset1Label}
              key={`${AMMID}_Asset1`}
            />
            <ProgressBar
              variant="info"
              now={asset2Percentage}
              label={asset2Label}
              key={`${AMMID}_Asset2`}
            />
          </ProgressBar>
        </div>
      )
    })
  }

  return (
    <div>
      <h1>Pool screen!</h1>
      <h3>Balances</h3>
      <div>{myBalances()}</div>
      <Button onClick={toggleCreatePoolModal}>+ Create Pool</Button>
      <CreatePoolModal
        show={showCreatePoolModal}
        userBalances={userBalances!}
        onHide={toggleCreatePoolModal}
        onCreate={onCreate}
        showLoadingIndicator={showLoadingIndicator}
      />
      <h3>My Positions</h3>
      <div>{showPools(userPoolsBalances)}</div>
      <h3>Other Pools</h3>
      <div>{showPools(otherPoolsBalances)}</div>
    </div>
  )
}
