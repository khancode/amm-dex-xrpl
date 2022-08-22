import bodyParser from 'body-parser'
import express from 'express'
import type { Express, Request, Response } from 'express'
const app: Express = express()
const port = 3000

// parse application/x-www-form-urlencoded - the default body type for forms
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json - the JSON payload sent by a REST client
app.use(bodyParser.json())


app.get('/', (req: Request, res: Response) => {
  res.send('TypeScript + Express server!')
})

app.get('/amm', (req: Request, res: Response) => {
  res.json({ dat: 'amm' })
})

app.post('/amm', (req: Request, res: Response) => {
  res.send('POST /amm success')
  console.log(req.body)
})

app.listen(port, () => {
  console.log(`⚡️ Server is running on localhost:${port}`)
})