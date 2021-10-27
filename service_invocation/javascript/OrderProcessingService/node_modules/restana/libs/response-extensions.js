'use strict'

const { forEachObject } = require('./utils')

const CONTENT_TYPE_HEADER = 'content-type'
const TYPE_JSON = 'application/json; charset=utf-8'
const TYPE_PLAIN = 'text/plain; charset=utf-8'
const TYPE_OCTET = 'application/octet-stream'

const NOOP = () => { }

const stringify = obj => {
  return JSON.stringify(obj)
}

const beforeEnd = (res, contentType, statusCode, data) => {
  if (contentType) {
    res.setHeader(CONTENT_TYPE_HEADER, contentType)
  }
  res.statusCode = statusCode
}

const parseErr = error => {
  const errorCode = error.status || error.code || error.statusCode
  const statusCode = typeof errorCode === 'number' ? errorCode : 500

  return {
    statusCode,
    data: stringify({
      code: statusCode,
      message: error.message,
      data: error.data
    })
  }
}

/**
 * The friendly 'res.send' method
 * No comments needed ;)
 */
module.exports.send = (options, req, res) => {
  const send = (data = res.statusCode, code = res.statusCode, headers = null, cb = NOOP) => {
    let contentType

    if (data instanceof Error) {
      const err = parseErr(data)
      contentType = TYPE_JSON
      code = err.statusCode
      data = err.data
    } else {
      if (headers && typeof headers === 'object') {
        forEachObject(headers, (value, key) => {
          res.setHeader(key.toLowerCase(), value)
        })
      }

      // NOTE: only retrieve content-type after setting custom headers
      contentType = res.getHeader(CONTENT_TYPE_HEADER)

      if (typeof data === 'number') {
        code = data
        data = res.body
      }

      if (data) {
        if (typeof data === 'string') {
          if (!contentType) contentType = TYPE_PLAIN
        } else if (typeof data === 'object') {
          if (data instanceof Buffer) {
            if (!contentType) contentType = TYPE_OCTET
          } else if (typeof data.pipe === 'function') {
            if (!contentType) contentType = TYPE_OCTET

            // NOTE: we exceptionally handle the response termination for streams
            beforeEnd(res, contentType, code, data)

            data.pipe(res)
            data.on('end', cb)

            return
          } else if (Promise.resolve(data) === data) { // http://www.ecma-international.org/ecma-262/6.0/#sec-promise.resolve
            headers = null
            return data
              .then(resolved => send(resolved, code, headers, cb))
              .catch(err => send(err, code, headers, cb))
          } else {
            if (!contentType) contentType = TYPE_JSON
            data = stringify(data)
          }
        }
      }
    }

    beforeEnd(res, contentType, code, data)
    res.end(data, cb)
  }

  return send
}
