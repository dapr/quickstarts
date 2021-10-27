'use strict'

const methods = require('./methods')

module.exports = (options) => {
  const agent = options.apm || options.agent

  return {
    patch (app) {
      methods.forEach(method => {
        const ref = app[method]

        app[method] = (path, ...args) => {
          args.unshift((req, res, next) => {
            agent.setTransactionName(`${req.method} ${path}`)

            return next()
          })

          return ref(path, args)
        }
      })
    }
  }
}
