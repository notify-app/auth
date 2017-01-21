'use strict'

const {worker} = require('ipc-emitter')
const Logger = require('notify-logger')

// Create new logger with namespace 'auth'.
module.exports = new Logger(worker, 'auth')
