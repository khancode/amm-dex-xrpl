import { model, Schema } from 'mongoose'
import { Amount } from 'xrpl/dist/npm/models/common'

interface IPool {
  AMMAccount: string
  AMMID: string
  Asset1: Amount
  Asset2: Amount
  LPToken: Amount
  TradingFee: number
  Flags: number
}

const dataSchema = new Schema<IPool>({
    AMMAccount: {
      required: true,
      type: String,
    },
    AMMID: {
      required: true,
      type: String,
    },
    Asset1: {
      required: true,
      type: Object,
    },
    Asset2: {
      required: true,
      type: Object,
    },
    LPToken: {
      required: true,
      type: Object,
    },
})

const Pool = model<IPool>('Pool', dataSchema)

export {
    IPool,
    Pool,
}
