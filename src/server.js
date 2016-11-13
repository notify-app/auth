'use strict'

const http = require('http')
const middleware = require('notify-middleware')

const config = require('../config')
const listeners = require('./listeners')

const app = middleware()
app.use(...listeners)

http.createServer(app).listen(config.port, () => {
  console.info(`auth server: listening on port ${config.port}`)
})
