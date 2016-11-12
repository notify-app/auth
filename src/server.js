'use strict'

const http = require('http')
const middleware = require('notify-middleware')

const config = require('../config')
const corsListener = require('./listeners/cors')
const authListener = require('./listeners/auth')

const app = middleware()

app.use(corsListener)
app.use(authListener)

http.createServer(app).listen(config.port, () => {
  console.info(`auth server: listening on port ${config.port}`)
})
