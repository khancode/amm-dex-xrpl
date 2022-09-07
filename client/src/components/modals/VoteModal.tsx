import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { Form, FormGroup, Spinner, Table } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import { PoolBalance } from '../../util/apiModels'
import { ShowPool } from '../ShowPool'
import { formatTradingFeeToPercent, MAX_FEE_VAL } from './common'
import './VoteModal.scss'

interface VoteModalProps {
  show: boolean
  poolBalance: PoolBalance
  onHide: () => void
  onSubmit: (AMMID: string, FeeVal: number) => void
  showLoadingIndicator: boolean
}

export const VoteModal: React.FC<VoteModalProps> = ({
  show,
  poolBalance,
  onHide,
  onSubmit,
  showLoadingIndicator,
}: VoteModalProps) => {
  const [feeVal, setFeeVal] = useState<string>(``)

  useEffect(() => {
    if (!show) {
      resetFormFields()
    }
  }, [show])

  const resetFormFields = (): void => {
    setFeeVal(``)
  }

  const handleCloseButtonClick = async (event: any): Promise<void> => {
    onHide()
  }

  const handleSubmitButtonClick = async (event: any): Promise<void> => {
    onSubmit(poolBalance.AMMID, Number(feeVal))
  }

  const handleFeeValChange = (event: ChangeEvent<any>): void => {
    const newFee = Number(event.target.value)
    const validateFee = newFee > MAX_FEE_VAL ? MAX_FEE_VAL : newFee
    setFeeVal(validateFee.toString())
  }

  const showFeeValForm = (): ReactElement => {
    return (
      <FormGroup>
        <Form.Label>
          <b>
            Vote on a new Trading Fee{` `}
            {formatTradingFeeToPercent(Number(feeVal))}
          </b>
        </Form.Label>
        <Form.Control
          type="number"
          min="0"
          placeholder="Number between 0 to 65000"
          value={feeVal}
          onChange={handleFeeValChange}
          disabled={showLoadingIndicator}
        />
      </FormGroup>
    )
  }

  const showVotes = (): ReactElement[] | ReactElement => {
    if (poolBalance?.VoteSlots == null) {
      return <>No votes for this pool</>
    }

    // Sort VoteSlots by weight in descending order
    poolBalance.VoteSlots.sort((a, b) => b.VoteWeight - a.VoteWeight)

    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Rank</th>
            <th>FeeVal</th>
            <th>VoteWeight</th>
          </tr>
        </thead>
        <tbody>
          {poolBalance.VoteSlots.map(({ FeeVal, VoteWeight }, index) => {
            const voteRank = index + 1
            return (
              <tr key={`${FeeVal}_${VoteWeight}`}>
                <td>{voteRank}</td>
                <td>{formatTradingFeeToPercent(FeeVal)}</td>
                <td>{VoteWeight.toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    )
  }

  return (
    <Modal
      size="lg"
      show={show}
      onEscapeKeyDown={handleCloseButtonClick}
      aria-labelledby="contained-modal-title-vcenter"
    >
      {/* @ts-expect-error */}
      <Modal.Header closeButton onHide={handleCloseButtonClick}>
        <Modal.Title id="contained-modal-title-vcenter">
          Vote on Trading Fee
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <ShowPool poolBalance={poolBalance} />
        <h5>
          Current Trading Fee:{` `}
          {formatTradingFeeToPercent(poolBalance?.TradingFee)}
        </h5>
        {showVotes()}
        <div className="show-fee-val-form">{showFeeValForm()}</div>
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
          <h4>Submitting Vote...</h4>
        </div>
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
