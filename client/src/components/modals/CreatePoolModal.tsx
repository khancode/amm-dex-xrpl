import React, { ReactElement, useEffect, useState } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'

import { UserBalancesResponse } from '../../util/apiModels'
import { ShowPool } from '../ShowPool'
import { formatTradingFeeToPercent, MAX_FEE_VAL } from './common'
import './CreatePoolModal.scss'

interface CreatePoolModalProps {
  show: boolean
  userBalances: UserBalancesResponse
  onHide: () => void
  onCreate: (
    asset1Currency: string,
    asset1Issuer: string,
    asset1Value: string,
    asset2Currency: string,
    asset2Issuer: string,
    asset2Value: string,
    tradingFee: number
  ) => void
  showLoadingIndicator: boolean
}

export const CreatePoolModal: React.FC<CreatePoolModalProps> = ({
  show,
  userBalances,
  onHide,
  onCreate,
  showLoadingIndicator,
}: CreatePoolModalProps) => {
  const [asset1Currency, setAsset1Currency] = useState<string>(``)
  const [asset1Value, setAsset1Value] = useState<string>(``)
  const [asset2Currency, setAsset2Currency] = useState<string>(``)
  const [asset2Value, setAsset2Value] = useState<string>(``)
  const [tradingFee, setTradingFee] = useState<string>(``)
  const [previewPoolBalance, setPreviewPoolBalance] = useState<any>({
    AMMID: `preview`,
    Asset1: {
      currency: ``,
      issuer: ``,
      value: ``,
    },
    Asset2: {
      currency: ``,
      issuer: ``,
      value: ``,
    },
    LPToken: {
      currency: ``,
      issuer: ``,
      value: ``,
    },
  })

  useEffect(() => {
    if (!show) {
      resetFormFields()
    }
  }, [show])

  const resetFormFields = (): void => {
    setAsset1Currency(``)
    setAsset1Value(``)
    setAsset2Currency(``)
    setAsset2Value(``)
    setTradingFee(``)
  }

  const getCurrencyOptions = (): ReactElement[] => {
    return userBalances?.balances.map(({ currency }) => {
      return <option key={currency}>{currency}</option>
    })
  }

  const getIssuer = (currency: string): string => {
    if (userBalances === undefined || currency === `XRP`) {
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

  const handleCloseButtonClick = async (event: any): Promise<void> => {
    onHide()
  }

  const handleCreateButtonClick = async (event: any): Promise<void> => {
    if (asset1Currency === ``) {
      alert(`Please select Asset 1 Currency`)
      return
    } else if (asset2Currency === ``) {
      alert(`Please select Asset 2 Currency`)
      return
    } else if (asset1Value === ``) {
      alert(`Please select Asset 1 Value`)
      return
    } else if (asset2Value === ``) {
      alert(`Please select Asset 2 Value`)
      return
    }

    onCreate(
      asset1Currency,
      getIssuer(asset1Currency),
      asset1Value,
      asset2Currency,
      getIssuer(asset2Currency),
      asset2Value,
      Number(tradingFee)
    )
  }

  return (
    <Modal
      show={show}
      onEscapeKeyDown={handleCloseButtonClick}
      aria-labelledby="contained-modal-title-vcenter"
    >
      {/* @ts-expect-error */}
      <Modal.Header closeButton onHide={handleCloseButtonClick}>
        <Modal.Title id="contained-modal-title-vcenter">
          Create AMM Instance Pool
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <Container>
          <Form>
            <Form.Group className="mb-3" controlId="form.asset1">
              <Form.Label>Asset 1</Form.Label>
              <Row>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Value"
                      value={asset1Value}
                      onChange={(event) => {
                        const asset1Value = event.target.value
                        setAsset1Value(asset1Value)
                        const newpreviewPoolBalance = {
                          ...previewPoolBalance,
                        }
                        newpreviewPoolBalance.Asset1.value = asset1Value
                        setPreviewPoolBalance(newpreviewPoolBalance)
                      }}
                      disabled={showLoadingIndicator}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Select
                      value={asset1Currency}
                      onChange={(event) => {
                        const asset1Currency = event.target.value
                        setAsset1Currency(asset1Currency)
                        const newpreviewPoolBalance = {
                          ...previewPoolBalance,
                        }
                        newpreviewPoolBalance.Asset1.currency = asset1Currency
                        setPreviewPoolBalance(newpreviewPoolBalance)
                      }}
                      disabled={showLoadingIndicator}
                    >
                      <option>Select Currency</option>
                      {getCurrencyOptions()}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId="form.asset2">
              <Form.Label>Asset 2</Form.Label>
              <Row>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Value"
                      value={asset2Value}
                      onChange={(event) => {
                        const asset2Value = event.target.value
                        setAsset2Value(asset2Value)
                        const newpreviewPoolBalance = {
                          ...previewPoolBalance,
                        }
                        newpreviewPoolBalance.Asset2.value = asset2Value
                        setPreviewPoolBalance(newpreviewPoolBalance)
                      }}
                      disabled={showLoadingIndicator}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup className="mb-3">
                    <Form.Select
                      value={asset2Currency}
                      onChange={(event) => {
                        const asset2Currency = event.target.value
                        setAsset2Currency(asset2Currency)
                        const newpreviewPoolBalance = {
                          ...previewPoolBalance,
                        }
                        newpreviewPoolBalance.Asset2.currency = asset2Currency
                        setPreviewPoolBalance(newpreviewPoolBalance)
                      }}
                      disabled={showLoadingIndicator}
                    >
                      <option>Select Currency</option>
                      {getCurrencyOptions()}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId="form.tradingFee">
              <Form.Label>
                Trading Fee{` `}
                {formatTradingFeeToPercent(Number(tradingFee))}
              </Form.Label>
              <InputGroup className="mb-3">
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Number between 0 to 65000"
                  value={tradingFee}
                  onChange={(event) => {
                    const newFee = Number(event.target.value)
                    const validateFee =
                      newFee > MAX_FEE_VAL ? MAX_FEE_VAL : newFee
                    setTradingFee(validateFee.toString())
                  }}
                  disabled={showLoadingIndicator}
                />
              </InputGroup>
            </Form.Group>
          </Form>
          <ShowPool
            className="preview-pool-balance"
            isPreview
            poolBalance={previewPoolBalance}
          />
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <div className="loading-container" hidden={!showLoadingIndicator}>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <h4>Creating AMM Instance...</h4>
        </div>
        <Button variant="secondary" onClick={handleCloseButtonClick}>
          Nah
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateButtonClick}
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
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
