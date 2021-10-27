const http = require('http')
const httpServer = http.Server
const httpsServer = require('https').Server

module.exports = (config = {}) => {
  const router = config.router || require('./lib/router/sequential')()
  const server = config.server || http.createServer()

  config.prioRequestsProcessing = config.prioRequestsProcessing || server instanceof httpServer || server instanceof httpsServer

  /*
  Native server can also be https server, so we also need to check for it.
  Unfortunately, there appears to be no proper way to check for http2 server.
  */

  if (config.prioRequestsProcessing) {
    server.on('request', (req, res) => {
      setImmediate(() => router.lookup(req, res))
    })
  } else {
    server.on('request', (req, res) => {
      router.lookup(req, res)
    })
  }

  return {
    router,
    server
  }
}
