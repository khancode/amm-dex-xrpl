import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import type { Express, Request, Response } from 'express'
import mongoose from 'mongoose'

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


app.get('/', (req: Request, res: Response) => {
  res.send('TypeScript + Express server!')
})

app.get('/amm/:id', (req: Request, res: Response) => {
  const ammId = req.params.id
  res.json({ ammId })
})

app.post('/amm', (req: Request, res: Response) => {
  res.send('POST /amm success')
  console.log(req.body)
})

app.listen(port, () => {
  console.log(`⚡️ Server is running on localhost:${port}`)
})