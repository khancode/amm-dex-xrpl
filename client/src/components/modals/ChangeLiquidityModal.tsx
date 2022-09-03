import React, { ReactElement, useEffect, useState } from 'react'
import { Card, Form, InputGroup, Nav, Spinner } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { AMMTransactionType, CurrencyIssuerValue } from '../../types'

import { PoolBalance, UserBalancesResponse } from '../../util/apiModels'
import { ShowPool } from '../ShowPool'
import { getCurrencyOptions, getIssuer } from './common'

const AMM_TRANSACTION_TYPES = new Set<AMMTransactionType>([
  `deposit`,
  `withdraw`,
])

const COMBO_TYPE_DELIMITER = `_`
type AMMTransactionCombinationsType =
  | `lptoken`
  | `asset1`
  | `asset1_asset2`
  | `asset1_lptoken`
  | `asset1_eprice`
const AMM_TRANSACTION_COMBINATIONS = new Set<AMMTransactionCombinationsType>([
  `lptoken`,
  `asset1`,
  `asset1${COMBO_TYPE_DELIMITER}asset2`,
  `asset1${COMBO_TYPE_DELIMITER}lptoken`,
  `asset1${COMBO_TYPE_DELIMITER}eprice`,
])
const AMM_TRANSACTION_COMBINATIONS_NAV_TITLE_MAP = new Map<string, string>(
  Object.entries({
    lptoken: `LPToken`,
    asset1: `Asset1`,
    asset1_asset2: `Asset1 + Asset2`,
    asset1_lptoken: `Asset1 + LPToken`,
    asset1_eprice: `Asset1 + EPrice`,
  })
)

interface ChangeLiquidityModalProps {
  show: boolean
  userBalances: UserBalancesResponse
  poolBalance: PoolBalance
  onHide: () => void
  onSubmit: (
    AMMID: string,
    transactionType: AMMTransactionType,
    LPToken: CurrencyIssuerValue,
    Asset1: CurrencyIssuerValue,
    Asset2: CurrencyIssuerValue,
    EPriceValue: string
  ) => void
  showLoadingIndicator: boolean
}

export const ChangeLiquidityModal: React.FC<ChangeLiquidityModalProps> = ({
  show,
  userBalances,
  poolBalance,
  onHide,
  onSubmit,
  showLoadingIndicator,
}: ChangeLiquidityModalProps) => {
  const [currentAMMTransactionType, setCurrentAMMTransactionType] =
    useState<AMMTransactionType>(`deposit`)
  const [
    currentAMMTransactionCombination,
    setCurrentAMMTransactionCombination,
  ] = useState<AMMTransactionCombinationsType>(`lptoken`)
  const [LPToken, setLPToken] = useState<CurrencyIssuerValue | null>(null)
  const [Asset1, setAsset1] = useState<CurrencyIssuerValue | null>(null)
  const [Asset2, setAsset2] = useState<CurrencyIssuerValue | null>(null)
  const [EPriceValue, setEPriceValue] = useState<string>(``)

  useEffect(() => {
    if (!show) {
      resetFormFields()
    }
  }, [show])

  const resetFormFields = (): void => {
    setLPToken({ currency: ``, issuer: ``, value: `` })
    setAsset1({ currency: ``, issuer: ``, value: `` })
    setAsset2({ currency: ``, issuer: ``, value: `` })
    setEPriceValue(``)
  }

  const handleCloseButtonClick = async (event: any): Promise<void> => {
    onHide()
  }

  const handleSubmitButtonClick = async (event: any): Promise<void> => {
    onSubmit(
      poolBalance.AMMID,
      currentAMMTransactionType,
      LPToken!,
      Asset1!,
      Asset2!,
      EPriceValue
    )
  }

  const formatTransactionType = (
    transactionType: AMMTransactionType
  ): string => {
    const capitalizeTransactionType =
      transactionType[0].toUpperCase() + transactionType.slice(1)
    return capitalizeTransactionType
  }

  const transactionTypeNav = (): ReactElement => {
    return (
      <Nav
        variant="pills"
        activeKey={currentAMMTransactionType}
        onSelect={(transactionType) => {
          setCurrentAMMTransactionType(transactionType as AMMTransactionType)
        }}
      >
        {Array.from(AMM_TRANSACTION_TYPES).map((transactionType) => {
          return (
            <Nav.Item key={transactionType}>
              <Nav.Link eventKey={transactionType}>
                {formatTransactionType(transactionType)}
              </Nav.Link>
            </Nav.Item>
          )
        })}
      </Nav>
    )
  }

  const showForm = (): ReactElement => {
    const assets: string[] =
      currentAMMTransactionCombination.split(COMBO_TYPE_DELIMITER)
    return (
      <Form>
        <Form.Group
          hidden={!assets.includes(`lptoken`)}
          className="mb-3"
          controlId="exampleForm.ControlInput1"
        >
          <Form.Label>LPToken</Form.Label>
          <InputGroup className="mb-3">
            <Form.Select
              value={LPToken?.currency}
              onChange={(event) => {
                const newLPToken = {
                  ...LPToken!,
                  currency: event.target.value,
                  issuer: getIssuer(userBalances, event.target.value),
                }
                setLPToken(newLPToken)
              }}
            >
              <option>Select Currency</option>
              {getCurrencyOptions(userBalances)}
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Issuer</InputGroup.Text>
            <Form.Control
              disabled
              readOnly
              type="text"
              value={getIssuer(userBalances, LPToken?.currency)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Value</InputGroup.Text>
            <Form.Control
              type="number"
              min="0"
              placeholder="value"
              value={LPToken?.value}
              onChange={(event) => {
                const newLPToken = { ...LPToken!, value: event.target.value }
                setLPToken(newLPToken)
              }}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group
          hidden={!assets.includes(`asset1`)}
          className="mb-3"
          controlId="exampleForm.ControlInput1"
        >
          <Form.Label>Asset1</Form.Label>
          <InputGroup className="mb-3">
            <Form.Select
              value={Asset1?.currency}
              onChange={(event) => {
                const newAsset1 = {
                  ...Asset1!,
                  currency: event.target.value,
                  issuer: getIssuer(userBalances, event.target.value),
                }
                setAsset1(newAsset1)
              }}
            >
              <option>Select Currency</option>
              {getCurrencyOptions(userBalances)}
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Issuer</InputGroup.Text>
            <Form.Control
              disabled
              readOnly
              type="text"
              value={getIssuer(userBalances, Asset1?.currency)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Value</InputGroup.Text>
            <Form.Control
              type="number"
              min="0"
              placeholder="value"
              value={Asset1?.value}
              onChange={(event) => {
                const newAsset1 = { ...Asset1!, value: event.target.value }
                setAsset1(newAsset1)
              }}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group
          hidden={!assets.includes(`asset2`)}
          className="mb-3"
          controlId="exampleForm.ControlInput1"
        >
          <Form.Label>Asset2</Form.Label>
          <InputGroup className="mb-3">
            <Form.Select
              value={Asset2?.currency}
              onChange={(event) => {
                const newAsset2 = {
                  ...Asset2!,
                  currency: event.target.value,
                  issuer: getIssuer(userBalances, event.target.value),
                }
                setAsset2(newAsset2)
              }}
            >
              <option>Select Currency</option>
              {getCurrencyOptions(userBalances)}
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Issuer</InputGroup.Text>
            <Form.Control
              disabled
              readOnly
              type="text"
              value={getIssuer(userBalances, Asset2?.currency)}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Value</InputGroup.Text>
            <Form.Control
              type="number"
              min="0"
              placeholder="value"
              value={Asset2?.value}
              onChange={(event) => {
                const newAsset2 = { ...Asset2!, value: event.target.value }
                setAsset2(newAsset2)
              }}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group
          hidden={!assets.includes(`eprice`)}
          className="mb-3"
          controlId="exampleForm.ControlInput1"
        >
          <Form.Label>EPrice</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text>Value</InputGroup.Text>
            <Form.Control
              type="number"
              min="0"
              placeholder="value"
              value={EPriceValue}
              onChange={(event) => {
                setEPriceValue(event.target.value)
              }}
            />
          </InputGroup>
        </Form.Group>
      </Form>
    )
  }

  const transactionCombinationNav = (): ReactElement => {
    return (
      <Card>
        <Card.Header>
          <Nav
            justify
            variant="tabs"
            activeKey={currentAMMTransactionCombination}
            onSelect={(transactionType) => {
              resetFormFields()
              setCurrentAMMTransactionCombination(
                transactionType as AMMTransactionCombinationsType
              )
            }}
          >
            {Array.from(AMM_TRANSACTION_COMBINATIONS).map(
              (transactionCombo) => {
                const formatTransactionCombo =
                  AMM_TRANSACTION_COMBINATIONS_NAV_TITLE_MAP.get(
                    transactionCombo
                  )
                return (
                  <Nav.Item key={transactionCombo}>
                    <Nav.Link eventKey={transactionCombo}>
                      {formatTransactionCombo}
                    </Nav.Link>
                  </Nav.Item>
                )
              }
            )}
          </Nav>
        </Card.Header>
        <Card.Body>
          <Card.Title>
            {formatTransactionType(currentAMMTransactionType)} Liquidity
          </Card.Title>
          {showForm()}
        </Card.Body>
      </Card>
    )
  }

  return (
    <Modal
      size="xl"
      show={show}
      onEscapeKeyDown={handleCloseButtonClick}
      aria-labelledby="contained-modal-title-vcenter"
    >
      {/* @ts-expect-error */}
      <Modal.Header closeButton onHide={handleCloseButtonClick}>
        <Modal.Title id="contained-modal-title-vcenter">
          Deposit/Withdraw Liquidity
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <ShowPool poolBalance={poolBalance} />
        {transactionTypeNav()}
        {transactionCombinationNav()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseButtonClick}>
          Nah
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmitButtonClick}
          disabled={showLoadingIndicator}
        >
          {showLoadingIndicator && (
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          )}
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
