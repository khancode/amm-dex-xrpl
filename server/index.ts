import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import type { Express } from 'express'

import connectDatabase from './database'
import routes from './routes'

dotenv.config()
const app: Express = express()
const port = process.env.PORT || 3000

connectDatabase()

// parse application/x-www-form-urlencoded - the default body type for forms
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json - the JSON payload sent by a REST client
app.use(bodyParser.json())

// REST API routes
app.use('/', routes)

app.listen(port, () => {
  console.log(`⚡️ Server is running on localhost:${port}`)
})