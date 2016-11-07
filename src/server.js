'use strict'

const http = require('http')

const config = require('../config')
const corsListener = require('./listeners/cors')
const credAuthListener = require('./listeners/credAuth')

const server = http.createServer((req, res) => {
  if (req.url !== '/auth') return res.end()

  corsListener(req, res)
    && credAuthListener(req, res)
})

server.listen(config.port, () => {
  console.info(`auth server: listening on port ${config.port}`)
})
