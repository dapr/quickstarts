const qs = require('querystring')

module.exports = (req, url) => {
  const [path, search] = url.split('?')
  req.path = path
  switch (search) {
    case undefined:
    case '': {
      req.search = '?'
      req.query = {}
      break
    }
    default: {
      req.search = '?' + search
      req.query = qs.parse(search.replace(/\[\]=/g, '='))
    }
  }
}
