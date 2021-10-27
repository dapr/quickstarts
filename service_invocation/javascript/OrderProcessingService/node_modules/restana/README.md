# restana
[![NPM version](https://badgen.net/npm/v/restana)](https://www.npmjs.com/package/restana)
[![NPM Total Downloads](https://badgen.net/npm/dt/restana)](https://www.npmjs.com/package/restana)
[![License](https://badgen.net/npm/license/restana)](https://www.npmjs.com/package/restana)
[![TypeScript support](https://badgen.net/npm/types/restana)](https://www.npmjs.com/package/restana)
[![Github stars](https://badgen.net/github/stars/jkyberneees/restana?icon=github)](https://github.com/jkyberneees/restana)

Blazing fast, tiny and minimalist *connect-like* web framework for building REST micro-services.  

> You can read more:  *[restana = faster and efficient Node.js REST APIs](https://itnext.io/restana-faster-and-efficient-node-js-rest-apis-1ee5285ce66)*

## Performance
![Performance Benchmarks](Benchmarks.png)
> [Where are this numbers coming from?](https://github.com/the-benchmarker/web-frameworks/blob/e00f4b9fc3db7105d8c918c36691560be069697c/README.md)

## Usage
```bash
npm i restana --save
```
### Creating the service instance
Create unsecure HTTP server:
```js
const service = require('restana')()
```
Passing HTTP server instance:
```js
const https = require('https')
const service = require('restana')({
  server: https.createServer({
    key: keys.serviceKey,
    cert: keys.certificate
  })
})
```

Create restana HTTP server with `http.createServer()`:
```js
const http = require('http')
const service = require('restana')()

service.get('/hi', (req, res) => {
  res.send({
    msg: 'Hello World!'
  })
})

http.createServer(service).listen(3000, '0.0.0.0', function () {
  console.log('running')
})
```
> Please take note that in the last case, `service.close()` would **not** be available, since restana does **not** have access to http server instance created by `http.createServer`.

Optionally, learn through examples:
* [HTTPS service demo](demos/https-service.js)
* [HTTP2 service demo](demos/http2-service.js)

### Configuration options
- `server`: Allows to optionally override the HTTP server instance to be used.
- `prioRequestsProcessing`: If `TRUE`, HTTP requests processing/handling is prioritized using `setImmediate`. Default value: `TRUE`
- `defaultRoute`: Optional route handler when no route match occurs. Default value: `((req, res) => res.send(404))`
- `errorHandler`: Optional global error handler function. Default value: `(err, req, res) => res.send(err)`
- `routerCacheSize`: The router matching cache size, indicates how many request matches will be kept in memory. Default value: `2000`


### Full service example
```js
const bodyParser = require('body-parser')

const service = require('restana')()
service.use(bodyParser.json())

const PetsModel = {
  // ... 
}

// registering service routes
service
  .get('/pets/:id', async (req, res) => {
    res.send(await PetsModel.findOne(req.params.id))
  })
  .get('/pets', async (req, res) => {
    res.send(await PetsModel.find())
  })
  .delete('/pets/:id', async (req, res) => {
    res.send(await PetsModel.destroy(req.params.id))
  })
  .post('/pets/:name/:age', async (req, res) => {
    res.send(await PetsModel.create(req.params))
  })
  .patch('/pets/:id', async (req, res) => {
    res.send(await PetsModel.update(req.params.id, req.body))
  })

service.get('/version', function (req, res) {
  // optionally you can send the response data in the body property
  res.body = { 
    version: '1.0.0'
  }
  // 200 is the default response code
  res.send() 
})
```

Supported HTTP methods:
```js
const methods = ['get', 'delete', 'put', 'patch', 'post', 'head', 'options', 'trace']
```

#### Using .all routes registration
You can also register a route handler for `all` supported HTTP methods:
```js
service.all('/allmethodsroute', (req, res) => {
  res.send(200)
})
```

#### Starting the service
```js
service.start(3000).then((server) => {})
```

#### Stopping the service
```js
service.close().then(()=> {})
```

### Async / Await support
```js
// some fake "star" handler
service.post('/star/:username', async (req, res) => {
  await starService.star(req.params.username)
  const stars = await starService.count(req.params.username)

  res.send({ stars })
})
```

### Sending custom headers
```js
res.send('Hello World', 200, {
  'x-response-time': 100
})
```

### The "res.send" method
Same as in express, for `restana` we have implemented a handy `send` method that extends 
every `res` object.  

Supported datatypes are:
- null
- undefined
- String
- Buffer
- Object
- Stream
- Promise

Example usage:
```js
service.get('/promise', (req, res) => {
  res.send(Promise.resolve('I am a Promise object!'))
})
```

#### The method signature
```js
res.send(
  // data payload
  'Hello World', 
  // response code (default 200)
  200, 
  // optional response headers (default NULL)
  {
    'x-cache-timeout': '5 minutes'
  }, 
  // optional res.end callback
  err => { /*...*/ }
)
```
> Optionally, you can also just send a response code:  
> `res.send(401)`

### Global error handling
```js
const service = require('restana')({
  errorHandler (err, req, res) {
    console.log(`Something was wrong: ${err.message || err}`)
    res.send(err)
  }
})

service.get('/throw', (req, res) => {
  throw new Error('Upps!')
})
```
#### errorHandler not being called?
> Issue: https://github.com/jkyberneees/ana/issues/81  

Some middlewares don't call `return next()` inside a synchronous flow. In restana we enable async errors handling by default, however this mechanism fails when a subsequent middleware is just calling `next()` inside a sync or async flow. 

Known incompatible middlewares:
- body-parser (https://www.npmjs.com/package/body-parser)

How to bring async chain compatibility to existing middlewares? The `body-parser` example:
```js
const jsonParser = require('body-parser').json()
const service = require('restana')()

service.use((req, res, next) => {
  return new Promise(resolve => {
    jsonParser(req, res, (err) => {
      return resolve(next(err))
    })
  })
})
```

### Global middlewares
```js
const service = require('restana')()

service.use((req, res, next) => {
  // do something
  return next()
});
...
```

### Prefix middlewares
```js
const service = require('restana')()

service.use('/admin', (req, res, next) => {
  // do something
  return next()
});
...
```

### Route level middlewares
Connecting middlewares to specific routes is also supported:
```js
const service = require('restana')()

service.get('/admin', (req, res, next) => {
  // do something
  return next()
}, (req, res) => {
  res.send('admin data')
});
...
```

As well, multiple middleware callbacks are supported:

```js
const service = require('restana')()

const cb0 = (req, res, next) => {
  // do something
  return next()
}

const cb1 = (req, res, next) => {
  // do something
  return next()
}

service.get('/test/:id', [cb0, cb1], (req, res) => {
  res.send({ id: req.params.id })
})
```

### Nested routers
Nested routers are supported as well:
```js
const service = require('restana')()
const nestedRouter = service.newRouter()

nestedRouter.get('/hello', (req, res) => {
  res.send('Hello World!')
})
service.use('/v1', nestedRouter) 
...
```
In this example the router routes will be available under `/v1` prefix. For example: `GET /v1/hello`

#### Third party middlewares support:
> All middlewares using the `function (req, res, next)` signature format are compatible with restana.

Examples :
* **raw-body**: [https://www.npmjs.com/package/raw-body](https://www.npmjs.com/package/raw-body). See demo: [raw-body.js](demos/raw-body.js)
* **express-jwt**: [https://www.npmjs.com/package/express-jwt](https://www.npmjs.com/package/express-jwt). See demo: [express-jwt.js](demos/express-jwt.js)
* **body-parser**: [https://www.npmjs.com/package/body-parser](https://www.npmjs.com/package/body-parser). See demo: [body-parser.js](demos/body-parser.js)
* **swagger-tools**: [https://www.npmjs.com/package/swagger-tools](https://www.npmjs.com/package/swagger-tools). See demo: [swagger](demos/swagger/index.js)

#### Async middlewares support
Since version `v3.3.x`, you can also use async middlewares as described below:
```js
service.use(async (req, res, next) => {
  await next()
  console.log('All middlewares and route handler executed!')
}))
service.use(logging())
service.use(jwt())
...
```

In the same way you can also capture uncaught exceptions inside the request processing flow:
```js
service.use(async (req, res, next) => {
  try {
    await next()
  } catch (err) {
    console.log('upps, something just happened')
    res.send(err)
  }
})
service.use(logging())
service.use(jwt())
```

### Service Events
Service events are accessible through the `service.events` object, an instance of https://nodejs.org/api/events.html

#### Available events
- `service.events.BEFORE_ROUTE_REGISTER`: This event is triggered before registering a route. 

## AWS Serverless Integration
`restana` is compatible with the [serverless-http](https://github.com/dougmoscrop/serverless-http) library, so restana based services can also run as AWS lambdas 🚀
```js 
// required dependencies
const serverless = require('serverless-http')
const restana = require('restana')

// creating service
const service = restana()
service.get('/hello', (req, res) => {
  res.send('Hello World!')
})

// lambda integration
const handler = serverless(app);
module.exports.handler = async (event, context) => {
  return await handler(event, context)
}
```

> See also:  
> Running restana service as a lambda using AWS SAM at https://github.com/jkyberneees/restana-serverless

## Cloud Functions for Firebase Integration
`restana` restana based services can also run as Cloud Functions for Firebase 🚀
```js 
// required dependencies
const functions = require("firebase-functions");
const restana = require('restana')

// creating service
const service = restana()
service.get('/hello', (req, res) => {
  res.send('Hello World!')
})

// lambda integration
exports = module.exports = functions.https.onRequest(app.callback());
```

## Serving static files
You can read more about serving static files with restana in this link:
https://itnext.io/restana-static-serving-the-frontend-with-node-js-beyond-nginx-e45fdb2e49cb  

Also, the `restana-static` project simplifies the serving of static files using restana and docker containers:
- https://github.com/jkyberneees/restana-static
- https://hub.docker.com/r/kyberneees/restana-static

## Third party integrations
```js
// ...
const service = restana()
service.get('/hello', (req, res) => {
  res.send('Hello World!')
})

// using "the callback integrator" middleware
const server = http.createServer(service.callback())
//...
```

## Application Performance Monitoring (APM)
As a Node.js framework implementation based on the standard `http` module, `restana` benefits from out of the box instrumentation on 
existing APM agents such as:
- https://www.npmjs.com/package/newrelic
- https://www.npmjs.com/package/elastic-apm-node

### Elastic APM - Routes Naming
"Routes Naming" discovery is not supported out of the box by the Elastic APM agent, therefore we have created our custom integration.
```js
// getting the Elastic APM agent
const agent = require('elastic-apm-node').start({
  secretToken: process.env.APM_SECRET_TOKEN,
  serverUrl: process.env.APM_SERVER_URL
})

// creating a restana application
const service = require('restana')()

// getting restana APM routes naming plugin 
const apm = require('restana/libs/elastic-apm')
// attach route naming instrumentation before registering service routes
apm({ agent }).patch(service)

// register your routes or middlewares
service.get('/hello', (req, res) => {
  res.send('Hello World!')
})

// ...
```
### New Relic - Routes Naming
"Routes Naming" discovery is not supported out of the box by the New Relic APM agent, therefore we have created our custom integration.
```js
// getting the New Relic APM agent
const agent = require('newrelic')

// creating a restana application
const service = require('restana')()

// getting restana APM routes naming plugin 
const apm = require('restana/libs/newrelic-apm')
// attach route naming instrumentation before registering service routes
apm({ agent }).patch(service)

// register your routes or middlewares
service.get('/hello', (req, res) => {
  res.send('Hello World!')
})

// ...
```

## Performance comparison (framework overhead)
### Which is the fastest?
You can checkout `restana` performance index on the ***"Which is the fastest"*** project: https://github.com/the-benchmarker/web-frameworks#full-table-1

## Using this project? Let us know 🚀
https://goo.gl/forms/qlBwrf5raqfQwteH3

## Breaking changes
### 4.x:
> Restana version 4.x is much more simple to maintain, mature and faster!
#### Added
 - Node.js v10.x+ is required.
 - `0http` sequential router is now the default and only HTTP router.
 - Overall middlewares support was improved.
 - Nested routers are now supported.
 - Improved error handler through async middlewares.
 - New `getRouter` and `newRouter` methods are added for accesing default and nested routers.
#### Removed
 - The `response` event was removed.
 - `find-my-way` router is replaced by `0http` sequential router.
 - Returning result inside async handler is not allowed anymore. Use `res.send...`
### 3.x: 
#### Removed
- Support for `turbo-http` library was dropped.

## Support / Donate 💚
You can support the maintenance of this project: 
- PayPal: https://www.paypal.me/kyberneees
- [TRON](https://www.binance.com/en/buy-TRON) Wallet: `TJ5Bbf9v4kpptnRsePXYDvnYcYrS5Tyxus`