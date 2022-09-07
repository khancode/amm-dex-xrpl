import React, { ReactElement, useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'

import { getTransactions } from '../util/apiRequests'
import './Transactions.scss'

export const Transactions: React.FC<{}> = () => {
  const [transactions, setTransactions] = useState<any>([])

  useEffect(() => {
    getTransactions().then((getTransactionsResponse) => {
      setTransactions(getTransactionsResponse)
    })
  })

  const showTransactions = (): ReactElement[] => {
    transactions.reverse()
    // @ts-expect-error
    return transactions.map((tx, index) => {
      const dateFormatted = new Date(tx.date).toLocaleTimeString()
      return (
        <Card key={index}>
          <Card.Header>
            <Card.Title className="transaction-card-title">
              <div>{tx.transactionType}</div>
              <div>{dateFormatted}</div>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <JSONPretty data={tx.payload} />
          </Card.Body>
        </Card>
      )
    })
  }

  return (
    <div className="transactions-screen">
      <h1>Transactions screen!</h1>
      {showTransactions()}
    </div>
  )
}
