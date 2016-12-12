'use strict'

const qs = require('querystring')
const hat = require('hat')

const config = require('../../../config')
const notifyStore = require('../../store')
const errors = require('./errors')

module.exports = (req, res) => {
  return parsePOSTData(req)
    .then(authUser)
    .then(createToken.bind(null, req, res))
}

/**
 * parses post data.
 * @param  {http.IncomingMessage} req  HTTP request.
 * @return {Promise}     Resolved once the POST data has been retrieved and
 *                       parsed.
 */
function parsePOSTData (req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (data) => {
      body += data.toString('ascii')
    })

    req.on('end', () => {
      const credentials = qs.parse(body)

      if (credentials.username == null || credentials.password == null) {
        return reject({ type: errors.INVALID_CREDENTIALS })
      }

      resolve(credentials)
    })
  })
}

/**
 * authenticates the user.
 * @param  {String} credentials.username  Username.
 * @param  {String} credentials.password  Password.
 * @return {Promise}    Resolved once the user credentials have been checked
 *                      with the database.
 */
function authUser (credentials) {
  return notifyStore.store.find(notifyStore.types.USERS, undefined, {
    match: {
      username: credentials.username,
      password: credentials.password
    }
  }).then(({payload}) => {
    if (payload.count === 0) {
      return Promise.reject({ type: errors.INVALID_CREDENTIALS })
    }

    return payload.records[0]
  })
}

/**
 * creates the access token.
 * @param  {http.IncomingMessage} req  HTTP request.
 * @param  {http.ServerResponse}  res  HTTP Response.
 * @param  {Object} user  Object containing the details of the user.
 * @return {Promise}      Resolved once the token have been created both in the
 *                        db and in the response header.
 */
function createToken (req, res, user) {
  const token = hat()

  return notifyStore.store.create(notifyStore.types.TOKENS, {
    token: token,
    user: user.id,
    created: new Date(),
    origin: req.headers.origin
  })
  .then(() => {
    const {session} = config
    const cookie = `${session.name}=${token}; Max-Age=${session.maxAge}`
    res.setHeader('Set-Cookie', cookie)

    return user
  })
}
