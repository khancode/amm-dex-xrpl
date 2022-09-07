import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
  Toast,
} from 'react-bootstrap'
import { BsArrowDownCircle } from 'react-icons/bs'

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
import './Swap.scss'

export const Swap: React.FC<{}> = () => {
  const { user, loading } = useContext(UserContext)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()
  const [currencyExchangeInfo, setCurrencyExchangeInfo] =
    useState<GetCurrencyExchangeInfoResponse | null>(null)
  const [showLoadingIndicator, setShowLoadingIndicator] =
    useState<boolean>(false)
  const [showToast, setShowToast] = useState<boolean>(false)
  const [toastHeader, setToastHeader] = useState<string>(``)
  const [toastBody, setToastBody] = useState<string>(``)

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

  const resetFormFields = (): void => {
    setSwapAsset({
      currency: ``,
      issuer: ``,
      value: ``,
    })
    setWithAsset({
      currency: ``,
      issuer: ``,
      value: ``,
    })
    setCurrencyExchangeInfo(null)
  }

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

    setShowLoadingIndicator(true)

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
      setShowLoadingIndicator(false)
      resetFormFields()
      setToastHeader(
        `Swapped ${swapAsset.currency} with ${withAsset.currency}!`
      )
      setToastBody(`Check Transactions for more info!`)
      toggleShowToast()
    })
  }

  const toggleShowToast = (): void => {
    setShowToast(!showToast)
  }

  return (
    <div className="swap-screen">
      <Toast className="swap-toast" show={showToast} onClose={toggleShowToast}>
        <Toast.Header>
          {/* <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" /> */}
          <strong className="me-auto">
            <b>{toastHeader}</b>
          </strong>
        </Toast.Header>
        <Toast.Body>{toastBody}</Toast.Body>
      </Toast>

      <Card className="swap-card">
        <Card.Header>
          <Card.Title>Swap</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group controlId="swapForm.swapAsset">
              <Row>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="0.0"
                      value={swapAsset?.value}
                      onChange={handleSwapAssetValueChange}
                      disabled={showLoadingIndicator}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Select
                      value={swapAsset?.currency}
                      onChange={handleSwapAssetCurrencyChange}
                      disabled={showLoadingIndicator}
                    >
                      <option>Select Currency</option>
                      {getCurrencyOptions(userBalances!)}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
            <Row className="mb-3">
              <BsArrowDownCircle className="arrow-down-circle-icon" />
            </Row>
            <Form.Group className="mb-3" controlId="swapForm.withAsset">
              <Row>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="0.0"
                      value={withAsset?.value}
                      onChange={handleWithAssetValueChange}
                      disabled={showLoadingIndicator}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Select
                      value={withAsset?.currency}
                      onChange={handleWithAssetCurrencyChange}
                      disabled={showLoadingIndicator}
                    >
                      <option>Select Currency</option>
                      {getCurrencyOptions(userBalances!)}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>

            {currencyExchangeInfo != null && (
              <div className="exchange-rate">
                {currencyExchangeInfo.exchangeRate}
              </div>
            )}

            <Button
              className="swap-button"
              onClick={handleSwap}
              disabled={showLoadingIndicator}
            >
              {showLoadingIndicator && (
                <Spinner
                  className="create-button-spinner"
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {showLoadingIndicator ? `Submitting...` : `Swap`}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
