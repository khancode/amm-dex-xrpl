import { model, Schema } from 'mongoose'

interface ISwap {
    date: Date
    username: string
    takerGets: Object
    takerPays: Object
}

const dataSchema = new Schema<ISwap>({
    date: {
        required: true,
        type: Date,
    },
    username: {
        required: true,
        type: String,
    },
    takerGets: {
        required: true,
        type: Object,
    },
    takerPays: {
        required: true,
        type: Object,
    },
})

const Swap = model<ISwap>('Swap', dataSchema)

export {
    ISwap,
    Swap,
}
