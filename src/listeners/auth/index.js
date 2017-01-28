'use strict'

const http = require('http')

const logger = require('../../logger')
const cookieAuth = require('./cookie')
const errors = require('./errors')

module.exports = (req, res) => {
  return cookieAuth(req)
    .then(includeInfo.bind(null, res))
    .catch(onError.bind(null, req, res))
    .then(() => {
      res.end()
    })
}

/**
 * includes info about the user that has just logged in.
 * @param  {http.ServerResponse} res  HTTP Response.
 * @param  {Object} user  Object containing the details of the user.
 */
function includeInfo (res, user) {
  res.write(JSON.stringify({ id: user.id }))
}

/**
 * invoked when an error occurs.
 * @param  {http.ServerResponse} res  HTTP Response.
 * @param  {Mixed} err  Error message.
 */
function onError (req, res, err) {
  switch (err.type) {
    case errors.INVALID_TOKEN: {
      res.statusCode = 401
      res.statusMessage = http.STATUS_CODES[401]
      break
    }
    default: {
      logger.error(err)
      res.statusCode = 500
      res.statusMessage = http.STATUS_CODES[500]
    }
  }
}
