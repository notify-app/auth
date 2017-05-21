'use strict'

const assert = require('assert')
const sinon = require('sinon')
const notifyStore = require('../src/store')
const utils = require('notify-utils')
const config = require('../config')
const auth = require('../src/listeners/auth')

describe('Scenario: Logging in without a Access Token', function () {
  describe('Given an auth server instance,', function () {
    describe('when making a request without Access Token:', function () {
      let req = null
      let res = null

      beforeEach(function () {
        req = {
          headers: {
            origin: 'http://example.com',
            cookie: ''
          }
        }

        res = {
          end: sinon.stub()
        }

        sinon.spy(utils, 'getCookieValue')
      })

      afterEach(function () {
        utils.getCookieValue.restore()
      })

      it('should try to retrieve the access token from the cookie header', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(utils.getCookieValue.calledOnce, true)
            assert.strictEqual(utils.getCookieValue.getCall(0).args[0], '')
            assert.strictEqual(utils.getCookieValue.getCall(0).args[1], config
              .session.cookie)
          })
      })

      it('should send an 401 HTTP Response', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(res.statusCode, 401)
            assert.strictEqual(res.end.calledOnce, true)
          })
      })
    })
  })
})

describe('Scenario: Logging in with an invalid Access Token', function () {
  describe('Given an auth server instance,', function () {
    describe('when making a request with an invalid Access Token:', function () {
      let req = null
      let res = null
      let token = null

      beforeEach(function () {
        token = 'abc123'

        req = {
          headers: {
            origin: 'http://example.com',
            cookie: `${config.session.cookie}=${token}`
          }
        }

        res = {
          end: sinon.stub()
        }

        sinon.spy(utils, 'getCookieValue')
        sinon.stub(utils, 'getUserByToken').returns(Promise.reject())
      })

      afterEach(function () {
        utils.getCookieValue.restore()
        utils.getUserByToken.restore()
      })

      it('should try to retrieve the access token from the cookie header', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(utils.getCookieValue.calledOnce, true)
            assert.strictEqual(utils.getCookieValue.getCall(0).args[0],
              req.headers.cookie)
            assert.strictEqual(utils.getCookieValue.getCall(0).args[1], config
              .session.cookie)
          })
      })

      it('should try to retrieve the owner of the access token', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(utils.getUserByToken.calledOnce, true)
            assert.strictEqual(utils.getUserByToken.getCall(0).args[0], token)
            assert.strictEqual(utils.getUserByToken.getCall(0).args[1], notifyStore)
            assert.deepStrictEqual(utils.getUserByToken.getCall(0).args[2], {
              origin: req.headers.origin,
              maxAge: config.session.maxAge
            })
          })
      })

      it('should send an 401 HTTP Response', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(res.statusCode, 401)
            assert.strictEqual(res.end.calledOnce, true)
          })
      })
    })
  })
})

describe('Scenario: Logging in with a valid Access Token', function () {
  describe('Given an auth server instance,', function () {
    describe('when making a request with a valid Access Token:', function () {
      let req = null
      let res = null
      var user = null
      let token = null

      beforeEach(function () {
        user = { id: '1' }
        token = 'abc123'

        req = {
          headers: {
            origin: 'http://example.com',
            cookie: `${config.session.cookie}=${token}`
          }
        }

        res = {
          end: sinon.stub(),
          write: sinon.stub()
        }

        sinon.spy(utils, 'getCookieValue')
        sinon.stub(utils, 'getUserByToken').returns(Promise.resolve(user))
      })

      afterEach(function () {
        utils.getCookieValue.restore()
        utils.getUserByToken.restore()
      })

      it('should try to retrieve the access token from the cookie header', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(utils.getCookieValue.calledOnce, true)
            assert.strictEqual(utils.getCookieValue.getCall(0).args[0],
              req.headers.cookie)
            assert.strictEqual(utils.getCookieValue.getCall(0).args[1], config
              .session.cookie)
          })
      })

      it('should try to retrieve the owner of the access token', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(utils.getUserByToken.calledOnce, true)
            assert.strictEqual(utils.getUserByToken.getCall(0).args[0], token)
            assert.strictEqual(utils.getUserByToken.getCall(0).args[1], notifyStore)
            assert.deepStrictEqual(utils.getUserByToken.getCall(0).args[2], {
              origin: req.headers.origin,
              maxAge: config.session.maxAge
            })
          })
      })

      it('should include the user info in the HTTP Response', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(res.write.calledOnce, true)
            assert.strictEqual(res.write.getCall(0).args[0],
              `{"id":"${user.id}"}`)
          })
      })

      it('should send an 200 HTTP Response', function () {
        return auth(req, res)
          .then(() => {
            assert.strictEqual(res.statusCode, undefined)
            assert.strictEqual(res.end.calledOnce, true)
          })
      })
    })
  })
})
