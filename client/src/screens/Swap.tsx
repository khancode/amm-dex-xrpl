import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'
import { UserContext } from '../components/layout/Page'
import { getCurrencyOptions, getIssuer } from '../components/modals/common'
import { CurrencyIssuerValue } from '../types'
import {
  GetCurrencyExchangeInfoResponse,
  UserBalancesResponse,
} from '../util/apiModels'
import {
  getCurrencyExchangeInfo,
  getUserBalances,
  swapAssetsDepositWithdraw,
} from '../util/apiRequests'

export const Swap: React.FC<{}> = () => {
  const { user, loading } = useContext(UserContext)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()
  const [currencyExchangeInfo, setCurrencyExchangeInfo] =
    useState<GetCurrencyExchangeInfoResponse>()

  const [swapAsset, setSwapAsset] = useState<CurrencyIssuerValue>({
    currency: ``,
    issuer: ``,
    value: ``,
  })
  const [withAsset, setWithAsset] = useState<CurrencyIssuerValue>({
    currency: ``,
    issuer: ``,
    value: ``,
  })

  useEffect(() => {
    if (!loading) {
      getUserBalances(user?.user.username).then((userBalancesRes) => {
        setUserBalances(userBalancesRes)
      })
    }
  }, [loading])

  const handleSwapAssetCurrencyChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    const newCurrency = event.target.value
    const newSwapAsset = {
      ...swapAsset,
      currency: newCurrency,
      issuer: getIssuer(userBalances!, newCurrency),
    }
    setSwapAsset(newSwapAsset)

    if (withAsset.currency === ``) {
      return
    }

    getCurrencyExchangeInfo(newSwapAsset, withAsset).then(
      (getCurrencyExchangeInfoResponse) => {
        setCurrencyExchangeInfo(getCurrencyExchangeInfoResponse)
      }
    )
  }

  const handleWithAssetCurrencyChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    const newCurrency = event.target.value
    const newWithAsset = {
      ...withAsset,
      currency: newCurrency,
      issuer: getIssuer(userBalances!, newCurrency),
    }
    setWithAsset(newWithAsset)

    if (swapAsset.currency === ``) {
      return
    }

    getCurrencyExchangeInfo(swapAsset, newWithAsset).then(
      (getCurrencyExchangeInfoResponse) => {
        setCurrencyExchangeInfo(getCurrencyExchangeInfoResponse)
      }
    )
  }

  const handleSwapAssetValueChange = (event: ChangeEvent<any>): void => {
    const newValue = event.target.value
    const newSwapAsset = {
      ...swapAsset,
      value: newValue,
    }
    setSwapAsset(newSwapAsset)

    if (currencyExchangeInfo == null) {
      return
    }

    const newWithAsset = {
      ...withAsset,
      value: String(Number(newValue) * currencyExchangeInfo.spotPrice),
    }
    setWithAsset(newWithAsset)
  }

  const handleWithAssetValueChange = (event: ChangeEvent<any>): void => {
    const newValue = event.target.value
    const newWithAsset = {
      ...withAsset,
      value: newValue,
    }
    setWithAsset(newWithAsset)

    if (currencyExchangeInfo == null) {
      return
    }

    const newSwapAsset = {
      ...swapAsset,
      value: String(Number(newValue) / currencyExchangeInfo.spotPrice),
    }
    setSwapAsset(newSwapAsset)
  }

  const handleSwap = (): void => {
    if (currencyExchangeInfo == null) {
      throw Error(`currencyExchangeInfo is undefined`)
    }

    swapAssetsDepositWithdraw(
      user?.user.username,
      currencyExchangeInfo?.poolBalance.AMMID,
      swapAsset,
      withAsset
    ).then((swapAssetsDepositWithdraw) => {
      console.log(
        `swapAssetsDepositWithdraw: ${JSON.stringify(
          swapAssetsDepositWithdraw,
          null,
          4
        )}`
      )
    })
  }

  return (
    <div>
      <h1>Swap screen!</h1>
      <Card>
        <Card.Header>Swap</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3" controlId="swapForm.swapAsset">
              <Card.Title>
                <Form.Label>Swap Asset</Form.Label>
              </Card.Title>
              <InputGroup className="mb-3">
                <Form.Select
                  value={swapAsset?.currency}
                  onChange={handleSwapAssetCurrencyChange}
                >
                  <option>Select Currency</option>
                  {getCurrencyOptions(userBalances!)}
                </Form.Select>
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Issuer</InputGroup.Text>
                <Form.Control
                  disabled
                  readOnly
                  type="text"
                  value={getIssuer(userBalances!, swapAsset?.currency)}
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Value</InputGroup.Text>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="value"
                  value={swapAsset?.value}
                  onChange={handleSwapAssetValueChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="swapForm.withAsset">
              <Card.Title>
                <Form.Label>With</Form.Label>
              </Card.Title>
              <InputGroup className="mb-3">
                <Form.Select
                  value={withAsset?.currency}
                  onChange={handleWithAssetCurrencyChange}
                >
                  <option>Select Currency</option>
                  {getCurrencyOptions(userBalances!)}
                </Form.Select>
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Issuer</InputGroup.Text>
                <Form.Control
                  disabled
                  readOnly
                  type="text"
                  value={getIssuer(userBalances!, withAsset?.currency)}
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Value</InputGroup.Text>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="value"
                  value={withAsset?.value}
                  onChange={handleWithAssetValueChange}
                />
              </InputGroup>
            </Form.Group>

            <div>{currencyExchangeInfo?.exchangeRate}</div>

            <Button onClick={handleSwap}>Swap</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
