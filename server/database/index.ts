import { connect, connection } from 'mongoose'

export default function connectDatabase() {
    // Connects to MongoDB
    connect(process.env.MONGODB_SERVER as string)
    const database = connection

    console.log('Database connecting...')
    
    database.once('connected', () => {
        console.log('Database Connected')
    })
    database.on('error', (error) => {
        console.log(error)
    })

    return database
}
