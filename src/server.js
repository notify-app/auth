'use strict'

const http = require('http')
const {worker} = require('ipc-emitter')
const middleware = require('notify-middleware')

const config = require('../config')
const listeners = require('./listeners')

const app = middleware()
app.use(...listeners)

http.createServer(app).listen(config.port, () => {
  worker.emit('logs:info', 'auth', `listening on port ${config.port}`)
})
