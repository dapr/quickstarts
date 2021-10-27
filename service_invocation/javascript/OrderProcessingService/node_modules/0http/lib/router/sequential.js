const Trouter = require('trouter')
const next = require('./../next')
const LRU = require('lru-cache')
const parse = require('regexparam')
const queryparams = require('../utils/queryparams')

module.exports = (config = {}) => {
  if (config.defaultRoute === undefined) {
    config.defaultRoute = (req, res) => {
      res.statusCode = 404
      res.end()
    }
  }
  if (config.errorHandler === undefined) {
    config.errorHandler = (err, req, res) => {
      res.statusCode = 500
      res.end(err.message)
    }
  }
  if (config.cacheSize === undefined) {
    config.cacheSize = 1000
  }
  if (config.id === undefined) {
    config.id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
  }

  const routers = {}
  const hasCache = config.cacheSize > 0
  const cache = hasCache ? new LRU(config.cacheSize) : null
  const router = new Trouter()
  router.id = config.id

  const _use = router.use

  router.use = (prefix, ...middlewares) => {
    if (typeof prefix === 'function') {
      middlewares = [prefix]
      prefix = '/'
    }
    _use.call(router, prefix, middlewares)

    if (middlewares[0].id) {
      // caching router -> pattern relation for urls pattern replacement
      const { pattern } = parse(prefix, true)
      routers[middlewares[0].id] = pattern
    }

    return this
  }

  router.lookup = (req, res, step) => {
    if (!req.url) {
      req.url = '/'
    }
    if (!req.originalUrl) {
      req.originalUrl = req.url
    }

    queryparams(req, req.url)

    let match
    if (hasCache) {
      const reqCacheKey = req.method + req.path
      match = cache.get(reqCacheKey)
      if (!match) {
        match = router.find(req.method, req.path)
        cache.set(reqCacheKey, match)
      }
    } else {
      match = router.find(req.method, req.path)
    }

    if (match.handlers.length !== 0) {
      const middlewares = [...match.handlers]
      if (step !== undefined) {
        // router is being used as a nested router
        middlewares.push((req, res, next) => {
          req.url = req.preRouterUrl
          req.path = req.preRouterPath

          delete req.preRouterUrl
          delete req.preRouterPath

          return step()
        })
      }

      if (!req.params) {
        req.params = {}
      }
      Object.assign(req.params, match.params)

      return next(middlewares, req, res, 0, routers, config.defaultRoute, config.errorHandler)
    } else {
      config.defaultRoute(req, res)
    }
  }

  router.on = (method, pattern, ...handlers) => router.add(method, pattern, handlers)

  return router
}
