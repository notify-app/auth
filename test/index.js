'use strict'

const mockr = require('mock-require')

/**
 * ipcEmitter is a mock for ipc-emitter module. This is required since the Auth
 * module is meant to run in a forked environment and since the test cases are
 * executed in a non-forked environment, IPC-Emitter warns the user.
 * @type {Object}
 */
const ipcEmitter = { worker: { emit: () => {} } }

mockr('ipc-emitter', ipcEmitter)

describe('Authentication Server:', function () {
  after(function () {
    mockr.stop('ipc-emitter')
  })

  ;['auth'].forEach(function (cases) {
    require(`./${cases}-test`)
  })
})
