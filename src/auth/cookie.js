'use strict'

const qs = require('querystring')

const config = require('../../config')
const notifyStore = require('../store')
const errors = require('./errors')

module.exports = (req) => {
  return parseToken(req)
    .then(retrieveToken)
    .then(validateToken)
    .then(prepareUser)
}

/**
 * Parses the cookie header to retrieve the token. If expected cookie does not
 * exists, stop process.
 * @param  {http.IncomingMessage} req  HTTP request.
 * @return {Promise}    Resolved when the token has been retrieved or rejected
 *                      if expected cookie is not found.
 */
function parseToken (req) {
  const cookies = qs.parse(req.headers.cookie, '; ', '=')
  const tokenValue = cookies[config.session.name]

  if (tokenValue !== undefined) return Promise.resolve(tokenValue)
  return Promise.reject({ type: errors.INVALID_TOKEN })
}

/**
 * retrieves token info stored in db. If token does not exists in db, stop
 * process.
 * @param  {String} token Token retrieved from cookie.
 * @return {Promise}      Resolved when token exists in db or rejected if it
 *                        doesn't.
 */
function retrieveToken (token) {
  return notifyStore.store.find(notifyStore.types.TOKENS, undefined, {
    match: {
      token: token
    }
  }).then(({payload}) => {
    if (payload.count === 0) {
      return Promise.reject({ type: errors.INVALID_TOKEN })
    }

    return payload.records[0]
  })
}

/**
 * checks whether the token is still valid.
 * @param  {Object} token Token model from db.
 * @return {Promise}      Resolved with the user model the token belongs to, or
 *                        rejected if token is invalid.
 */
function validateToken (token) {
  const created = new Date(token.created)
  let expire = new Date(token.created)
  expire.setSeconds(expire.getSeconds() + config.session.maxAge)

  if (expire > created) {
    return notifyStore.store.find(notifyStore.types.USERS, token.user)
  }

  return notifyStore.store.delete(notifyStore.types.TOKENS, token.id)
    .then(() => {
      return Promise.reject({ type: errors.INVALID_TOKEN })
    })
}

function prepareUser ({payload}) {
  return payload.records[0]
}
