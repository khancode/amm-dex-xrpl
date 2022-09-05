import React, { ReactElement, useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'

import { UserContext } from '../components/layout/Page'
import { ChangeLiquidityModal } from '../components/modals/ChangeLiquidityModal'
import { CreatePoolModal } from '../components/modals/CreatePoolModal'
import { VoteModal } from '../components/modals/VoteModal'
import { ShowPool } from '../components/ShowPool'
import { AMMTransactionType, CurrencyIssuerValue } from '../types'
import {
  GetOtherPoolsBalancesResponse,
  GetUserPoolsBalancesResponse,
  PoolBalance,
  UserBalancesResponse,
} from '../util/apiModels'
import {
  getUserBalances,
  createPool,
  getUserPoolsBalances,
  getOtherPoolsBalances,
  depositIntoPool,
  withdrawFromPool,
  vote,
} from '../util/apiRequests'

export const Pool: React.FC<{}> = () => {
  const { user, loading } = useContext(UserContext)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()
  const [userPoolsBalances, setUserPoolsBalances] =
    useState<GetUserPoolsBalancesResponse>([])
  const [otherPoolsBalances, setOtherPoolsBalances] =
    useState<GetOtherPoolsBalancesResponse>([])
  const [liquidityPoolSelected, setLiquidityPoolSelected] =
    useState<PoolBalance>()
  const [showCreatePoolModal, setShowCreatePoolModal] = useState<boolean>(false) // DEV: set to true to immediately open modal
  const [showChangeLiquidityModal, setShowChangeLiquidityModal] =
    useState<boolean>(false)
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false)
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

  const toggleChangeLiquidityModal = (): void => {
    setShowChangeLiquidityModal(!showChangeLiquidityModal)
  }

  const toggleVoteModal = (): void => {
    setShowVoteModal(!showVoteModal)
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

  const onLiquidityChangeSubmit = (
    AMMID: string,
    transactionType: AMMTransactionType,
    LPToken: CurrencyIssuerValue | null,
    Asset1: CurrencyIssuerValue | null,
    Asset2: CurrencyIssuerValue | null,
    EPriceValue: string
  ): void => {
    setShowLoadingIndicator(true)

    if (transactionType === `deposit`) {
      depositIntoPool(
        user?.user.username,
        AMMID,
        LPToken!,
        Asset1!,
        Asset2!,
        EPriceValue
      ).then(() => {
        getUserBalances(user?.user.username).then((userBalancesResponse) => {
          setUserBalances(userBalancesResponse)
          setShowLoadingIndicator(false)
          toggleChangeLiquidityModal()
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
    } else if (transactionType === `withdraw`) {
      withdrawFromPool(
        user?.user.username,
        AMMID,
        LPToken!,
        Asset1!,
        Asset2!,
        EPriceValue
      ).then(() => {
        getUserBalances(user?.user.username).then((userBalancesResponse) => {
          setUserBalances(userBalancesResponse)
          setShowLoadingIndicator(false)
          toggleChangeLiquidityModal()
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
  }

  const onVoteSubmit = (AMMID: string, FeeVal: number): void => {
    setShowLoadingIndicator(true)

    // TODO: implement API route
    vote(user?.user.username, AMMID, FeeVal).then((voteResponse) => {
      console.log(`voteResponse - down below:`)
      console.log(voteResponse)
      getUserBalances(user?.user.username).then((userBalancesResponse) => {
        setUserBalances(userBalancesResponse)
        setShowLoadingIndicator(false)
        toggleVoteModal()
      })
      getUserPoolsBalances(user?.user.username).then(
        (getUserPoolsBalancesResponse) => {
          setUserPoolsBalances(getUserPoolsBalancesResponse)
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

  const onPlusMinusLiquidityButtonClick = (poolBalance: PoolBalance): void => {
    setLiquidityPoolSelected(poolBalance)
    setShowChangeLiquidityModal(!showChangeLiquidityModal)
  }

  const onVoteButtonClick = (poolBalance: PoolBalance): void => {
    setLiquidityPoolSelected(poolBalance)
    setShowVoteModal(!showVoteModal)
  }

  const showPools = (
    poolsBalances: GetUserPoolsBalancesResponse | GetOtherPoolsBalancesResponse
  ): ReactElement | ReactElement[] => {
    if (poolsBalances.length === 0) {
      return <div>No active positions</div>
    }

    return poolsBalances.map((poolBalance) => {
      const isVotable =
        userBalances?.balances.find(({ currency }) => {
          return currency === poolBalance.LPToken.currency
        }) != null
      const onVoteButtonClickParam = isVotable ? onVoteButtonClick : undefined

      return (
        <ShowPool
          key={poolBalance.AMMID}
          poolBalance={poolBalance}
          onPlusMinusLiquidityButtonClick={onPlusMinusLiquidityButtonClick}
          onVoteButtonClick={onVoteButtonClickParam}
        />
      )
    })
  }

  return (
    <div>
      <h1>Pool screen!</h1>
      <h3>Balances</h3>
      <div>{myBalances()}</div>
      <Button onClick={toggleCreatePoolModal}>+ Create Pool</Button>
      <h3>My Positions</h3>
      <div>{showPools(userPoolsBalances)}</div>
      <h3>Other Pools</h3>
      <div>{showPools(otherPoolsBalances)}</div>

      {/* All Modals used below: */}
      <CreatePoolModal
        show={showCreatePoolModal}
        userBalances={userBalances!}
        onHide={toggleCreatePoolModal}
        onCreate={onCreate}
        showLoadingIndicator={showLoadingIndicator}
      />
      <VoteModal
        show={showVoteModal}
        onHide={toggleVoteModal}
        onSubmit={onVoteSubmit}
        showLoadingIndicator={showLoadingIndicator}
        poolBalance={liquidityPoolSelected!}
      />
      <ChangeLiquidityModal
        show={showChangeLiquidityModal}
        userBalances={userBalances!}
        onHide={toggleChangeLiquidityModal}
        onSubmit={onLiquidityChangeSubmit}
        showLoadingIndicator={showLoadingIndicator}
        poolBalance={liquidityPoolSelected!}
      />
    </div>
  )
}
