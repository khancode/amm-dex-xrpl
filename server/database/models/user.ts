import { model, Schema } from 'mongoose'

interface IUser {
    username: string
    password: string
    wallet: {
        address: string,
        seed: string,
    }
}

const dataSchema = new Schema<IUser>({
    username: {
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    },
	wallet: {
        required: true,
		type: {
            address: {
                required: true,
                type: String,
            },
            seed: {
                required: true,
                type: String,
            },
        },
	},
})

const User = model<IUser>('User', dataSchema)

export {
    IUser,
    User,
}
