import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'
import { UserContext } from '../components/layout/Page'
import { getCurrencyOptions, getIssuer } from '../components/modals/common'
import { CurrencyIssuerValue } from '../types'
import { UserBalancesResponse } from '../util/apiModels'
import { getUserBalances, swapAssets } from '../util/apiRequests'

export const Swap: React.FC<{}> = () => {
  const { user, loading } = useContext(UserContext)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse>()

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
      getUserBalances(user?.user.username).then((UserBalancesResponse) => {
        setUserBalances(UserBalancesResponse)
      })
    }
  }, [loading])

  const handleSwap = (): void => {
    swapAssets(user?.user.username, swapAsset, withAsset).then(
      (swapAssetsResponse) => {
        // TODO: handle swapAssetsResponse data
        console.log(`TODO: handle swapAssetsResponse data`)
        console.log(
          `swapAssetsResponse: ${JSON.stringify(swapAssetsResponse, null, 4)}`
        )
      }
    )
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
                  onChange={(event) => {
                    const newSwapAsset = {
                      ...swapAsset,
                      currency: event.target.value,
                      issuer: getIssuer(userBalances!, event.target.value),
                    }
                    setSwapAsset(newSwapAsset)
                  }}
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
                  onChange={(event) => {
                    const newSwapAsset = {
                      ...swapAsset,
                      value: event.target.value,
                    }
                    setSwapAsset(newSwapAsset)
                  }}
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
                  onChange={(event) => {
                    const newwithAsset = {
                      ...withAsset,
                      currency: event.target.value,
                      issuer: getIssuer(userBalances!, event.target.value),
                    }
                    setWithAsset(newwithAsset)
                  }}
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
                  onChange={(event) => {
                    const newwithAsset = {
                      ...withAsset,
                      value: event.target.value,
                    }
                    setWithAsset(newwithAsset)
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Button onClick={handleSwap}>Swap</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
