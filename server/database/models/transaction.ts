import { model, Schema } from 'mongoose'

interface ITransaction {
    date: Date
    transactionType: string
    payload: Object
}

const dataSchema = new Schema<ITransaction>({
    date: {
        required: true,
        type: Date,
    },
    transactionType: {
        required: true,
        type: String,
    },
    payload: {
        required: true,
        type: Object,
    },
})

const Transaction = model<ITransaction>('Transaction', dataSchema)

export {
    ITransaction,
    Transaction,
}
