function next (middlewares, req, res, index, routers = {}, defaultRoute, errorHandler) {
  const middleware = middlewares[index]
  if (!middleware) {
    if (!res.finished) {
      return defaultRoute(req, res)
    }

    return
  }

  function step (err) {
    if (err) {
      return errorHandler(err, req, res)
    } else {
      return next(middlewares, req, res, index + 1, routers, defaultRoute, errorHandler)
    }
  }

  try {
    if (middleware.id) {
      // nested routes support
      const pattern = routers[middleware.id]
      if (pattern) {
        req.preRouterUrl = req.url
        req.preRouterPath = req.path

        req.url = req.url.replace(pattern, '')
      }

      return middleware.lookup(req, res, step)
    } else {
      return middleware(req, res, step)
    }
  } catch (err) {
    return errorHandler(err, req, res)
  }
}

module.exports = next
