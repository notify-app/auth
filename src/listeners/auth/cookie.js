'use strict'

const utils = require('notify-utils')

const config = require('../../../config')
const notifyStore = require('../../store')
const errors = require('./errors')

module.exports = (req) => {
  return parseToken(req.headers.cookie)
    .then(validateToken)
}

/**
 * Parses the cookie header to retrieve the token. If expected cookie does not
 * exists, stop process.
 * @param  {String} cookieHeader String listing all the available cookies.
 * @return {Promise}             Resolved when the token has been retrieved or
 *                               rejected if expected cookie is not found.
 */
function parseToken (cookieHeader) {
  return utils.getCookieValue(cookieHeader, config.session.name)
    .catch(() => Promise.reject({ type: errors.INVALID_TOKEN }))
}

/**
 * Checks whether the token is still valid.
 * @param  {Object} token Token model from db.
 * @return {Promise}      Resolved with the user model the token belongs to, or
 *                        rejected if token is invalid.
 */
function validateToken (token) {
  return utils.getUserByToken(notifyStore, token, config.session.maxAge)
    .then(({payload}) => payload.records[0])
    .catch(() => Promise.reject({ type: errors.INVALID_TOKEN }))
}
