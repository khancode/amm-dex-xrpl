import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { UserContext } from '../components/layout/Page'
import { CreatePoolModal } from '../components/modals/CreatePoolModal'
import { GetUserPoolsResponse, UserBalancesResponse } from '../util/apiModels'
import { getUserBalances, createPool, getUserPools } from '../util/apiRequests'

export const Pool: React.FC<{}> = () => {
  const { user, loading } = useContext(UserContext)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()
  const [userPools, setUserPools] = useState<GetUserPoolsResponse>([])
  const [showCreatePoolModal, setShowCreatePoolModal] = useState<boolean>(false) // DEV: set to true to immediately open modal
  const [showLoadingIndicator, setShowLoadingIndicator] =
    useState<boolean>(false)

  useEffect(() => {
    if (!loading) {
      getUserBalances(user?.user.username).then((UserBalancesResponse) => {
        setUserBalances(UserBalancesResponse)
      })
      getUserPools(user?.user.username).then((getUserPoolsResponse) => {
        setUserPools(getUserPoolsResponse)
      })
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
      getUserPools(user?.user.username).then((getUserPoolsResponse) => {
        setUserPools(getUserPoolsResponse)
      })
    })
  }

  return (
    <div>
      <h1>Pool screen!</h1>
      <p>Balances: {JSON.stringify(userBalances, null, 4)}</p>
      <Button onClick={toggleCreatePoolModal}>+ Create Pool</Button>
      <CreatePoolModal
        show={showCreatePoolModal}
        userBalances={userBalances!}
        onHide={toggleCreatePoolModal}
        onCreate={onCreate}
        showLoadingIndicator={showLoadingIndicator}
      />
      <h3>My Positions</h3>
      <div>
        {userPools.length === 0
          ? `No active positions`
          : JSON.stringify(userPools, null, 4)}
      </div>
      <h3>Other Pools</h3>
    </div>
  )
}
