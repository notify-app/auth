'use strict'

const http = require('http')
const middleware = require('notify-middleware')

const config = require('../config')
const corsListener = require('./listeners/cors')
const credAuthListener = require('./listeners/credAuth')

const app = middleware()

app.use(corsListener)
app.use(credAuthListener)

http.createServer(app).listen(config.port, () => {
  console.info(`auth server: listening on port ${config.port}`)
})
