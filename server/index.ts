import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import type { Express, Request, Response } from 'express'
import mongoose from 'mongoose'

import routes from './routes'

dotenv.config()
const app: Express = express()
const port = 3000

// parse application/x-www-form-urlencoded - the default body type for forms
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json - the JSON payload sent by a REST client
app.use(bodyParser.json())

// Connects to MongoDB
mongoose.connect(process.env.MONGODB_SERVER as string)
const database = mongoose.connection
database.once('connected', () => {
  console.log('Database Connected')
})
database.on('error', (error) => {
  console.log(error)
})

app.use('/', routes)

app.listen(port, () => {
  console.log(`⚡️ Server is running on localhost:${port}`)
})