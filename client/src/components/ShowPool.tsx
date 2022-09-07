import React from 'react'
import { Button, Card, ProgressBar } from 'react-bootstrap'

import { PoolBalance } from '../util/apiModels'
import './ShowPool.scss'

interface ShowPoolProps {
  poolBalance: PoolBalance
  onPlusMinusLiquidityButtonClick?: (poolBalance: PoolBalance) => void
  onVoteButtonClick?: (poolBalance: PoolBalance) => void
}

export const ShowPool: React.FC<ShowPoolProps> = ({
  poolBalance,
  onPlusMinusLiquidityButtonClick,
  onVoteButtonClick,
}: ShowPoolProps) => {
  const { AMMID, Asset1, Asset2, LPToken } = poolBalance
  const asset1Currency = typeof Asset1 === `string` ? `XRP` : Asset1.currency
  const asset2Currency = typeof Asset2 === `string` ? `XRP` : Asset2.currency
  const asset1Value = Number(
    typeof Asset1 === `string` ? Number(Asset1) / 1000000 : Asset1.value
  )
  const asset2Value = Number(
    typeof Asset2 === `string` ? Number(Asset2) / 1000000 : Asset2.value
  )
  const totalAssetsValue = asset1Value + asset2Value
  const asset1Percentage = (asset1Value / totalAssetsValue) * 100
  const asset2Percentage = (asset2Value / totalAssetsValue) * 100
  const asset1Label = `${asset1Value.toLocaleString()} ${asset1Currency}`
  const asset2Label = `${asset2Value.toLocaleString()} ${asset2Currency}`
  const LPTokenDetails = `${Number(LPToken.value).toLocaleString()} LPToken (${
    LPToken.currency
  })`
  return (
    <Card className="show-pool">
      <Card.Header>
        <div className="row">
          <div className="col">{LPTokenDetails}</div>
          <Button
            hidden={onVoteButtonClick == null}
            variant="outline-primary"
            className="vote-button col-2"
            onClick={() => onVoteButtonClick!(poolBalance)}
          >
            Vote
          </Button>
          <Button
            hidden={onPlusMinusLiquidityButtonClick == null}
            className="col-2"
            onClick={() => onPlusMinusLiquidityButtonClick!(poolBalance)}
          >
            +/- Liquidity
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <ProgressBar>
          <ProgressBar
            now={asset1Percentage}
            label={asset1Label}
            key={`${AMMID}_Asset1`}
          />
          <ProgressBar
            variant="info"
            now={asset2Percentage}
            label={asset2Label}
            key={`${AMMID}_Asset2`}
          />
        </ProgressBar>
      </Card.Body>
    </Card>
  )
}
