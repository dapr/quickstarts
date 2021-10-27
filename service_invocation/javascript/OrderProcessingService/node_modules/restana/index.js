'use strict'

/**
 * restana Web Framework implementation
 *
 * @license MIT
 */

const requestRouter = require('./libs/request-router')
const exts = {
  request: {},
  response: require('./libs/response-extensions')
}

module.exports = (options = {}) => {
  options.errorHandler = options.errorHandler || ((err, req, res) => {
    res.send(err)
  })

  const server = options.server || require('http').createServer()
  const prp = undefined === options.prioRequestsProcessing ? true : options.prioRequestsProcessing
  if (prp) {
    server.on('request', (req, res) => {
      setImmediate(() => service.handle(req, res))
    })
  } else {
    server.on('request', (req, res) => {
      service.handle(req, res)
    })
  }

  const handle = (req, res) => {
    // request object population
    res.send = exts.response.send(options, req, res)

    service.getRouter().lookup(req, res)
  }

  const service = handle

  const service_ = {
    errorHandler: options.errorHandler,

    newRouter () {
      return requestRouter(options)
    },

    getServer () {
      return server
    },

    getConfigOptions () {
      return options
    },

    handle: handle,

    start: (...args) => new Promise((resolve, reject) => {
      if (!args || !args.length) args = [3000]
      server.listen(...args, (err) => {
        if (err) reject(err)
        resolve(server)
      })
    }),

    close: () => new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err)
        resolve()
      })
    })
  }

  Object.assign(service, service_)

  // apply router capabilities
  requestRouter(options, service)

  service.callback = () => service.handle

  service.use(async (req, res, next) => {
    try {
      await next()
    } catch (err) {
      return options.errorHandler(err, req, res)
    }
  })

  return service
}
