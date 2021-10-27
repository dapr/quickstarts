# 0http
[![NPM version](https://img.shields.io/npm/v/0http.svg?style=flat)](https://www.npmjs.com/package/0http)  

Cero friction HTTP framework:
- Tweaked Node.js Server for high throughput.
- Use the request router you like. 

![Performance Benchmarks](Benchmarks.png)
> [You can read more about this numbers here.](https://github.com/the-benchmarker/web-frameworks/blob/e00f4b9fc3db7105d8c918c36691560be069697c/README.md)

## Usage
```js
const cero = require('0http')
const { router, server } = cero()

router.get('/hello', (req, res) => {
  res.end('Hello World!')
})

router.post('/do', (req, res) => {
  // ...
  res.statusCode = 201
  res.end()
})

//...

server.listen(3000)
```

## Routers
`0http` allows you to define the router implementation you prefer as soon as it support the following interface:
```js
router.lookup = (req, res) // -> should trigger router search and handlers execution
```

### 0http - sequential (default router)
This a `0http` extended implementation of the [trouter](https://www.npmjs.com/package/trouter) router. Includes support for middlewares, nested routers and shortcuts for routes registration.  
As this is an iterative regular expression matching router, it tends to be slower than `find-my-way` when the number of registered routes increases; to mitigate this issue, we use 
an internal(optional) LRU cache to store the matching results of the previous requests, resulting on a super-fast matching process.

Supported HTTP verbs: `GET, HEAD, PATCH, OPTIONS, CONNECT, DELETE, TRACE, POST, PUT`

```js
const cero = require('0http')
const { router, server } = cero({})

// global middleware example
router.use('/', (req, res, next) => {
  res.write('Hello ')
  next()
})

// route middleware example
const routeMiddleware = (req, res, next) => {
  res.write('World')
  next()
}

// GET /sayhi route with middleware and handler
router.get('/sayhi', routeMiddleware, (req, res) => {
  res.end('!')
})

server.listen(3000)
```
#### Configuration Options
- **defaultRoute**: Route handler when there is no router matching. Default value:
  ```js 
  (req, res) => {
    res.statusCode = 404
    res.end()
  }
  ```
- **cacheSize**: Router matching LRU cache size. A given value <= 0 will disable the cache. Default value: `1000`
- **errorHandler**: Global error handler function. Default value: 
  
  ```js 
  (err, req, res) => {
    res.statusCode = 500
    res.end(err.message)
  }
  ```

* **prioRequestsProcessing**: `true` to use SetImmediate to prioritize router lookup, `false` to disable. By default `true`, if used with native Node.js `http` and `https` servers. Set to `false`, if using Node.js Native Addon server, such as uWebSockets.js, as this will cause a huge performance penalty

Example passing configuration options:

```js
const sequential = require('0http/lib/router/sequential')
const { router, server } = cero({
  router: sequential({
    cacheSize: 2000
  })
})
```

#### Async middlewares
You can use async middlewares to await the remaining chain execution. Let's describe with a custom error handler middleware:
```js
router.use('/', async (req, res, next) => {
  try {
    await next()
  } catch (err) {
    res.statusCode = 500
    res.end(err.message)
  }
})

router.get('/sayhi', (req, res) => {
  throw new Error('Uuuups!')
})
```

#### Nested Routers
You can simply use `sequential` router intances as nested routers:
```js
const cero = require('../index')
const { router, server } = cero({})

const nested = require('0http/lib/router/sequential')()
nested.get('/url', (req, res, next) => {
  res.end(req.url)      
})
router.use('/v1', nested)

server.listen(3000)
```

### find-my-way router
> https://github.com/delvedor/find-my-way  

Super-fast raw HTTP router with no goodies. Internally uses a [Radix Tree](https://en.wikipedia.org/wiki/Radix_tree) 
router that will bring better performance over iterative regular expressions matching. 
```js
const cero = require('../index')
const { router, server } = cero({
  router: require('find-my-way')()
})

router.on('GET', '/hi', (req, res) => {
  res.end('Hello World!')
})

server.listen(3000)
```


## Servers
`0http` is just a wrapper for the servers and routers implementations you provide. 
```js
const cero = require('0http')

const { router, server } = cero({
  server: yourCustomServerInstance
})
```

### Node.js http.Server 
If no server is provided by configuration, the standard Node.js [http.Server](https://nodejs.org/api/http.html#http_class_http_server) implementation is used.  
Because this server offers the best balance between Node.js ecosystem compatibility and performance, we highly recommend it for most use cases.

## Benchmarks (30/12/2019)
**Node version**: v12.14.0  
**Laptop**: MacBook Pro 2019, 2,4 GHz Intel Core i9, 32 GB 2400 MHz DDR4  
**Server**: Single instance

```bash
wrk -t8 -c40 -d5s http://127.0.0.1:3000/hi
```

### 1 route registered
- 0http (sequential)   
  `Requests/sec:  88438.69`
- 0http (find-my-way)   
  `Requests/sec:  87597.44`
- restana v3.4.2   
  `Requests/sec:  73455.97`

### 5 routes registered
- **0http (sequential)**  
  `Requests/sec:  85839.17`
- 0http (find-my-way)   
  `Requests/sec:  82682.86`

> For more accurate benchmarks please see:
>
> - https://github.com/the-benchmarker/web-frameworks

## Support / Donate 💚
You can support the maintenance of this project: 
- PayPal: https://www.paypal.me/kyberneees
- [TRON](https://www.binance.com/en/buy-TRON) Wallet: `TJ5Bbf9v4kpptnRsePXYDvnYcYrS5Tyxus`

## Breaking Changes:
### 3.x
- Low HTTP server implementation was moved to: https://github.com/jkyberneees/low-http-server