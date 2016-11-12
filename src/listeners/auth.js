'use strict'

const http = require('http')

const config = require('../../config')
const credAuth = require('./auth/credentials')
const cookieAuth = require('./auth/cookie')
const errors = require('./auth/errors')

module.exports = (req, res) => {
  return authenticate(cookieAuth, req, res)
}

/**
 * authenticate the user either using cookie info or the credentials.
 * @param  {Promise} promise  Promise to authenticate the user.
 * @param  {http.IncomingMessage} req  HTTP request.
 * @param  {http.ServerResponse} res   HTTP response.
 * @return {Promise}    Resolved when a response has been sent.
 */
function authenticate (promise, req, res) {
  return promise(req, res)
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
  const payload = {
    id: user.id
  }

  res.write(JSON.stringify(payload))
}

/**
 * invoked when an error occurs.
 * @param  {http.ServerResponse} res  HTTP Response.
 * @param  {Mixed} err  Error message.
 */
function onError (req, res, err) {
  switch (err.type) {
    case errors.INVALID_CREDENTIALS: {
      res.statusCode = 401
      res.statusMessage = http.STATUS_CODES[401]
      break
    }
    case errors.INVALID_TOKEN: {
      return authenticate(credAuth, req, res)
    }
    default: {
      res.statusCode = 500
      res.statusMessage = http.STATUS_CODES[500]
    }
  }
}
