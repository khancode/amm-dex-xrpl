import React, { ReactElement, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'
import { UserBalancesResponse } from '../../util/apiModels'

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
  const [tradingFee, setTradingFee] = useState<number>(0)

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
    setTradingFee(0)
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
      tradingFee
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
              <InputGroup className="mb-3">
                <InputGroup.Text>Currency</InputGroup.Text>
                <Form.Select
                  value={asset1Currency}
                  onChange={(event) => setAsset1Currency(event.target.value)}
                >
                  <option>Select Currency</option>
                  {getCurrencyOptions()}
                </Form.Select>
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Issuer</InputGroup.Text>
                <Form.Control
                  disabled
                  readOnly
                  type="text"
                  value={getIssuer(asset1Currency)}
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Value</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="value"
                  value={asset1Value}
                  onChange={(event) => setAsset1Value(event.target.value)}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="form.asset2">
              <Form.Label>Asset 2</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text>Currency</InputGroup.Text>
                <Form.Select
                  value={asset2Currency}
                  onChange={(event) => setAsset2Currency(event.target.value)}
                >
                  <option>Select Currency</option>
                  {getCurrencyOptions()}
                </Form.Select>
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Issuer</InputGroup.Text>
                <Form.Control
                  disabled
                  readOnly
                  type="text"
                  value={getIssuer(asset2Currency)}
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Value</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="value"
                  value={asset2Value}
                  onChange={(event) => setAsset2Value(event.target.value)}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="form.tradingFee">
              <Form.Label>Trading Fee</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text>Value</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="value"
                  value={tradingFee}
                  onChange={(event) =>
                    setTradingFee(Number(event.target.value))
                  }
                />
              </InputGroup>
            </Form.Group>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
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
