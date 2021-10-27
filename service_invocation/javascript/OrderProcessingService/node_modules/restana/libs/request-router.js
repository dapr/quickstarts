'use strict'

/**
 * @see: https://github.com/jkyberneees/0http#0http---sequential-default-router
 */
const sequential = require('0http/lib/router/sequential')
const methods = require('./methods')
const EventEmitter = require('events')
const BEFORE_ROUTE_REGISTER_EVENT = 'beforeRouteRegister'

function registerRoute ({ routes, service, router, method, args }) {
  service.events.emit(BEFORE_ROUTE_REGISTER_EVENT, method, args)

  routes.add(`${method.toUpperCase()}${args[0]}`)
  router[method].apply(router, args)
}

module.exports = (options, service = {}) => {
  const routes = new Set()

  const router = sequential({
    errorHandler: options.errorHandler,
    cacheSize: options.routerCacheSize || 2000,
    defaultRoute: options.defaultRoute || ((req, res) => {
      res.send(404)
    })
  })

  // attach router id
  service.id = router.id

  // service events hub
  service.events = new EventEmitter({
    captureRejections: true
  })
  service.events.BEFORE_ROUTE_REGISTER = BEFORE_ROUTE_REGISTER_EVENT

  // attach use method
  service.use = (...args) => {
    router.use.apply(router, args)

    return service
  }

  // attach routes registration shortcuts
  methods.forEach((method) => {
    service[method] = (...args) => {
      if (Array.isArray(args[0])) {
        // support multiple paths registration
        const argsExceptPath = args.slice(1)

        // for each path
        args[0].forEach(path => {
          const args = [...argsExceptPath]
          args.unshift(path)

          registerRoute({ routes, service, router, method, args })
        })
      } else {
        registerRoute({ routes, service, router, method, args })
      }

      return service
    }
  })

  // attach router
  service.getRouter = () => router

  // attach routes
  service.routes = () => [...routes]

  // attach lookup and find methods if not main service
  if (!service.handle) {
    service.lookup = (...args) => router.lookup.apply(router, args)
    service.find = (...args) => router.find.apply(router, args)
  }

  return service
}
